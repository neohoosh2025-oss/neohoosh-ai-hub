import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, modelType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Handle image generation separately
    if (modelType === "image") {
      const userPrompt = messages[messages.length - 1].content;
      
      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [
            {
              role: "user",
              content: userPrompt
            }
          ],
          modalities: ["image", "text"]
        }),
      });

      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error("Image generation error:", imageResponse.status, errorText);
        return new Response(JSON.stringify({ error: "خطا در تولید تصویر" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const imageData = await imageResponse.json();
      const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

      return new Response(JSON.stringify({ imageUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Define system prompts for each model
    const systemPrompts: Record<string, string> = {
      business: "شما یک مشاور حرفه‌ای کسب و کار هستید. تخصص شما در استراتژی، بازاریابی، مدیریت و رشد کسب و کار است. پاسخ‌های شما عملی، تحلیلی و مبتنی بر داده است.",
      personal: "شما یک مربی توسعه فردی و حرفه‌ای هستید. به افراد کمک می‌کنید تا مهارت‌های خود را بهبود بخشند، اهداف شخصی خود را تعیین کنند و به آن‌ها دست یابند. پاسخ‌های شما انگیزشی و راهنما هستند.",
      general: "شما یک دستیار هوشمند و دانا هستید که می‌تواند در مورد موضوعات مختلف پاسخ دهید. پاسخ‌های شما دقیق، جامع و قابل فهم هستند.",
      ads: "شما یک متخصص تبلیغات و بازاریابی محتوا هستید. می‌توانید متن‌های تبلیغاتی جذاب، شعارها و کمپین‌های خلاقانه ایجاد کنید. پاسخ‌های شما خلاق و متقاعدکننده هستند.",
    };

    const systemPrompt = systemPrompts[modelType] || systemPrompts.general;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "محدودیت تعداد درخواست، لطفاً بعداً تلاش کنید." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "نیاز به شارژ اعتبار، لطفاً به تنظیمات Lovable مراجعه کنید." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "خطا در ارتباط با هوش مصنوعی" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const assistantResponse = data.choices?.[0]?.message?.content || "متاسفانه پاسخی دریافت نشد.";

    return new Response(JSON.stringify({ response: assistantResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطای ناشناخته" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
