import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { conversationId } = await req.json();
    
    const NEBIIUS_API_KEY = Deno.env.get("NEBIIUS_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!NEBIIUS_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user ID from auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error("User not found");

    // Get conversation messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError || !messages || messages.length === 0) {
      console.log("No messages found");
      return new Response(JSON.stringify({ success: true, message: "No messages to process" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepare conversation for AI
    const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n');

    // Call AI to extract memory - improved prompt with preferences
    const extractionPrompt = `تحلیل این گفتگو و دو نوع اطلاعات استخراج کن:

## ۱. اطلاعات شخصی (memories):
⚠️ فقط اطلاعات زیر را استخراج کن اگر کاربر صراحتاً گفته باشد:

✅ اطلاعات قابل قبول:
- نام واقعی (نه نام کاربری، نه کلمات تصادفی)
- محل زندگی/شهر (فقط اسم شهر یا کشور واقعی)
- شغل یا رشته تحصیلی واقعی
- سن یا سال تولد
- علایق و سرگرمی‌های مشخص (مثل: فوتبال، موسیقی، برنامه‌نویسی)
- زبان‌هایی که بلد است
- وضعیت تأهل یا تعداد فرزندان
- نام‌های افراد مهم زندگی (همسر، فرزند)

## ۲. ترجیحات پاسخ‌دهی (preferences):
دستوراتی که کاربر صراحتاً گفته AI چطور جواب بده:

✅ مثال‌ها:
- "از این به بعد کوتاه جواب بده"
- "بیشتر توضیح بده"
- "شوخی نکن"
- "از ایموجی استفاده کن"
- "رسمی‌تر صحبت کن"
- "اینجوری جواب بده..."
- "مثل X صحبت کن"

❌ موارد غیرقابل قبول (ذخیره نکن):
- احساسات موقتی (خوبم، بدم، خسته‌ام)
- نظرات درباره AI یا چت‌بات
- درخواست‌های یکباره (مثل: این متن رو ترجمه کن)
- جملات عمومی و بی‌معنی
- کلمات تصادفی

گفتگو:
${conversationText}

اگر هیچ اطلاعات پیدا نکردی، آرایه‌ها را خالی برگردان.

خروجی JSON:
{
  "memories": [
    {"key": "نام", "value": "علی"},
    {"key": "شهر", "value": "تهران"}
  ],
  "preferences": [
    "کوتاه و مختصر جواب بده",
    "از ایموجی استفاده کن"
  ]
}

فقط JSON خروجی بده.`;

    const aiResponse = await fetch("https://api.tokenfactory.nebius.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${NEBIIUS_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.3-70B-Instruct-fast",
        messages: [
          { role: "user", content: extractionPrompt }
        ],
        temperature: 0.1
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Nebius API error:", aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ 
          error: "محدودیت تعداد درخواست. لطفاً چند لحظه صبر کنید.",
          success: false 
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error("Failed to extract memories");
    }

    const aiData = await aiResponse.json();
    const responseContent = aiData.choices?.[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error("No response from AI");
    }

    // Parse JSON response
    let extractedData;
    try {
      // Remove markdown code blocks if present
      const cleanContent = responseContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      extractedData = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse AI response:", responseContent);
      throw new Error("Invalid JSON response from AI");
    }

    const memories = extractedData.memories || [];
    const preferences = extractedData.preferences || [];
    
    if (memories.length === 0 && preferences.length === 0) {
      console.log("No memories or preferences extracted");
      return new Response(JSON.stringify({ success: true, message: "No new data found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save or update memories
    let savedCount = 0;
    for (const memory of memories) {
      if (!memory.key || !memory.value) continue;

      // Check if memory exists
      const { data: existing } = await supabase
        .from('user_memory')
        .select('id')
        .eq('user_id', user.id)
        .eq('key', memory.key)
        .eq('memory_type', 'user_info')
        .maybeSingle();

      if (existing) {
        // Update existing
        await supabase
          .from('user_memory')
          .update({
            value: memory.value,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Insert new
        await supabase
          .from('user_memory')
          .insert({
            user_id: user.id,
            key: memory.key,
            value: memory.value,
            memory_type: 'user_info'
          });
      }
      savedCount++;
    }
    
    // Save preferences (user instructions for AI)
    let preferencesCount = 0;
    for (const pref of preferences) {
      if (!pref || typeof pref !== 'string') continue;
      
      // Check if similar preference exists
      const { data: existing } = await supabase
        .from('user_memory')
        .select('id, value')
        .eq('user_id', user.id)
        .eq('memory_type', 'preference')
        .ilike('value', `%${pref.substring(0, 20)}%`)
        .maybeSingle();

      if (!existing) {
        // Insert new preference
        await supabase
          .from('user_memory')
          .insert({
            user_id: user.id,
            key: `pref_${Date.now()}`,
            value: pref,
            memory_type: 'preference'
          });
        preferencesCount++;
      }
    }

    console.log(`Saved ${savedCount} memories and ${preferencesCount} preferences for user ${user.id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      memoriesSaved: savedCount,
      preferencesSaved: preferencesCount,
      memories: memories,
      preferences: preferences
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("extract-memory error:", e);
    return new Response(JSON.stringify({ 
      error: e instanceof Error ? e.message : "خطای ناشناخته",
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
