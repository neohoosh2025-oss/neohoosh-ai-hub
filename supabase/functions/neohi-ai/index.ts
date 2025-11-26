import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chatId, conversationHistory, customPrompt } = await req.json();
    
    if (!chatId || !conversationHistory) {
      return new Response(
        JSON.stringify({ error: 'chatId and conversationHistory are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!OPENROUTER_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    // System prompt for NEOHI AI
    let systemPrompt = `تو NEOHi Assistant هستی، یک دستیار هوشمند فارسی.

قانون طلایی:
فقط و فقط به محتوای دقیق پیام کاربر پاسخ بده. هیچ چیز اضافی از خودت نیار.

ممنوعیت‌های مطلق:
- ممنوع: سلام کردن یا احوالپرسی (مگر اینکه کاربر خودش سلام کرده باشه)
- ممنوع: گفتن "حالم خوبه" یا "ممنون" بدون اینکه کاربر احوالپرسی کرده باشه  
- ممنوع: اضافه کردن هر جمله مقدماتی که کاربر نخواسته
- ممنوع: تعارف یا ادب‌آوری اضافه

روش صحیح:
اگر کاربر پرسید "آهنگ شجریان معرفی کن" → فقط آهنگ معرفی کن، بدون سلام
اگر کاربر پرسید "سلام! آهنگ شجریان معرفی کن" → سلام کن و بعد آهنگ معرفی کن
اگر کاربر پرسید "حالت چطوره؟" → می‌تونی بگی حالت خوبه

تنها کاری که باید بکنی:
دقیقاً به خواسته کاربر جواب بده. نه کمتر، نه بیشتر.`;

    // Add custom prompt if provided
    if (customPrompt) {
      systemPrompt += `\n\nدستورالعمل خاص کاربر برای این پاسخ:\n${customPrompt}`;
    }

    console.log('Calling OpenRouter with Grok model...');

    // Call OpenRouter API directly
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://neohoosh.com',
        'X-Title': 'NEOHi Assistant'
      },
      body: JSON.stringify({
        model: 'x-ai/grok-4.1-fast:free',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'محدودیت تعداد درخواست‌ها. لطفاً چند لحظه صبر کنید.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('AI response received:', aiResponse.substring(0, 100) + '...');

    // Return AI response without saving to database
    // User will edit and send manually
    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in neohi-ai function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
