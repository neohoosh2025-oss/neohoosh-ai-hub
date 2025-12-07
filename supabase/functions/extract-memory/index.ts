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
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
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

    // Call AI to extract memory
    const extractionPrompt = `تحلیل گفتگوی زیر و اطلاعات مهم درباره کاربر را استخراج کن. فقط اطلاعات واقعی و مهمی که کاربر گفته را استخراج کن.

موارد مهم:
- نام و مشخصات شخصی
- علایق و سرگرمی‌ها
- مشکلات و نگرانی‌ها
- احساسات و حالات روحی
- اهداف و آرزوها
- ترجیحات و نظرات
- تجربیات مهم زندگی
- روابط و افراد مهم
- وضعیت شغلی یا تحصیلی
- سلامتی و نگرانی‌های پزشکی

گفتگو:
${conversationText}

خروجی را به صورت JSON با این ساختار بده:
{
  "memories": [
    {"key": "نام", "value": "مقدار", "type": "personal"},
    {"key": "علاقه", "value": "مقدار", "type": "interest"},
    ...
  ]
}

انواع type: personal, interest, concern, emotion, goal, preference, experience, relationship, work, health

فقط JSON خروجی بده، بدون توضیحات اضافی.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "user", content: extractionPrompt }
        ],
        temperature: 0.3
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
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
        .maybeSingle();

      if (existing) {
        // Update existing
        await supabase
          .from('user_memory')
          .update({
            value: memory.value,
            memory_type: memory.type || 'general',
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
            memory_type: memory.type || 'general'
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