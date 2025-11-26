import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, content, chatId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    
    switch (action) {
      case "expand":
        systemPrompt = "شما یک دستیار هوشمند هستید. پاسخ داده شده را با جزئیات بیشتر و توضیحات کامل‌تر گسترش دهید. پاسخ را به فارسی بنویسید.";
        break;
      case "improve":
        systemPrompt = "شما یک دستیار هوشمند هستید. پاسخ داده شده را از نظر کیفیت، وضوح و ساختار بهبود دهید. پاسخ را به فارسی بنویسید.";
        break;
      case "regenerate":
        systemPrompt = "شما یک دستیار هوشمند هستید. یک پاسخ جدید و متفاوت برای همین موضوع بنویسید. پاسخ را به فارسی بنویسید.";
        break;
      case "translate":
        systemPrompt = "شما یک مترجم حرفه‌ای هستید. متن داده شده را به بهترین شکل ممکن ترجمه کنید.";
        break;
      case "rewrite":
        systemPrompt = "شما یک نویسنده حرفه‌ای هستید. متن داده شده را با لحن و سبک بهتری بازنویسی کنید.";
        break;
      default:
        systemPrompt = "شما یک دستیار هوشمند هستید. به سوالات کاربران پاسخ دهید.";
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: content }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "محدودیت تعداد درخواست‌ها، لطفاً بعداً تلاش کنید." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "لطفاً اعتبار Lovable AI خود را شارژ کنید." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI Gateway returned ${response.status}`);
    }

    const data = await response.json();
    const enhancedText = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ text: enhancedText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-enhance function:", error);
    const errorMessage = error instanceof Error ? error.message : "خطای ناشناخته";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
