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

    // Call AI to extract memory - improved prompt
    const extractionPrompt = `تحلیل این گفتگو و فقط اطلاعات واقعی و مهم شخصی کاربر را استخراج کن.

⚠️ مهم: فقط اطلاعات زیر را استخراج کن اگر کاربر صراحتاً گفته باشد:

✅ اطلاعات قابل قبول:
- نام واقعی (نه نام کاربری، نه کلمات تصادفی)
- محل زندگی/شهر (فقط اسم شهر یا کشور واقعی)
- شغل یا رشته تحصیلی واقعی
- سن یا سال تولد
- علایق و سرگرمی‌های مشخص (مثل: فوتبال، موسیقی، برنامه‌نویسی)
- زبان‌هایی که بلد است
- وضعیت تأهل یا تعداد فرزندان
- نام‌های افراد مهم زندگی (همسر، فرزند)

❌ موارد غیرقابل قبول (ذخیره نکن):
- احساسات موقتی (خوبم، بدم، خسته‌ام)
- نظرات درباره AI یا چت‌بات
- درخواست‌ها و سوالات (مثل: کمک می‌خوام)
- جملات عمومی و بی‌معنی
- هر چیزی که فقط برای آن مکالمه است
- کلمات تصادفی مثل "ennisily" یا چرت و پرت

گفتگو:
${conversationText}

اگر هیچ اطلاعات واقعی شخصی پیدا نکردی، memories را خالی برگردان.

خروجی JSON:
{
  "memories": [
    {"key": "نام", "value": "علی"},
    {"key": "شهر", "value": "تهران"},
    {"key": "شغل", "value": "برنامه‌نویس"}
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

    if (!extractedData.memories || !Array.isArray(extractedData.memories)) {
      console.log("No memories extracted");
      return new Response(JSON.stringify({ success: true, message: "No new memories found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save or update memories
    let savedCount = 0;
    for (const memory of extractedData.memories) {
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

    console.log(`Saved ${savedCount} memories for user ${user.id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      memoriesSaved: savedCount,
      memories: extractedData.memories
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
