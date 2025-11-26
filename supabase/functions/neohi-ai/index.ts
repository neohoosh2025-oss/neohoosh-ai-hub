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
    const { chatId, message } = await req.json();
    
    if (!chatId || !message) {
      return new Response(
        JSON.stringify({ error: 'chatId and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get auth user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get conversation history from chat
    const { data: messages } = await supabase
      .from('neohi_messages')
      .select('content, sender_id, is_ai_message')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(20);

    const conversationHistory = messages?.map(msg => ({
      role: msg.is_ai_message ? 'assistant' : 'user',
      content: msg.content || ''
    })) || [];

    // System prompt for NEOHI AI
    const systemPrompt = `تو NEOHi Assistant هستی، یک دستیار هوشمند فارسی که در پلتفرم NEOHi Community فعالیت می‌کنه.

ویژگی‌های تو:
- همیشه به فارسی پاسخ میدی
- دوستانه و محترمانه صحبت می‌کنی
- در مورد موضوعات مختلف اطلاعات داری
- می‌تونی به سوالات عمومی، فنی، و شخصی پاسخ بدی
- خلاق و کمک‌کننده هستی

هدف تو:
کمک به کاربران در هر زمینه‌ای که نیاز دارند، از مشاوره تا سرگرمی.`;

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable AI workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('AI API request failed');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Save AI response to database
    const { error: insertError } = await supabase
      .from('neohi_messages')
      .insert({
        chat_id: chatId,
        sender_id: user.id,
        content: aiResponse,
        is_ai_message: true,
        message_type: 'text'
      });

    if (insertError) {
      console.error('Error saving AI message:', insertError);
    }

    // Update chat last message time
    await supabase
      .from('neohi_chats')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chatId);

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
