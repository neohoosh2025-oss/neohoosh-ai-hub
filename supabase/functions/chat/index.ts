import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, modelType, imageData, model } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase config missing");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Handle media generation (image only - video/animation not yet supported)
    if (modelType === "image") {
      const userPrompt = messages[messages.length - 1].content;
      
      const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-image-1",
          prompt: userPrompt,
          n: 1,
          size: "1024x1024",
          response_format: "b64_json"
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
      const base64Image = imageData.data?.[0]?.b64_json;
      
      if (!base64Image) {
        throw new Error("No media returned from AI");
      }

      // Get user ID from auth header
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) throw new Error("No authorization header");
      
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !user) {
        console.error("Auth error:", userError);
        throw new Error("Authentication failed");
      }

      // Convert base64 to blob
      const imageBuffer = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
      const timestamp = Date.now();
      const fileName = `${user.id}/${timestamp}.png`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, imageBuffer, {
          contentType: 'image/png',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Failed to upload media");
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      return new Response(JSON.stringify({ 
        imageUrl: publicUrl,
        videoUrl: modelType === "video" ? publicUrl : undefined 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Video and animation not yet supported - Lovable AI currently only supports image generation
    if (modelType === "animation" || modelType === "video") {
      return new Response(JSON.stringify({ 
        error: modelType === "animation" 
          ? "قابلیت تولید انیمیشن به زودی اضافه خواهد شد"
          : "قابلیت تولید ویدیو به زودی اضافه خواهد شد"
      }), {
        status: 501,
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

    // Prepare messages for vision API if image is provided
    let apiMessages;
    if (imageData) {
      // If there's an image, use vision-capable model and format message appropriately
      const lastMessage = messages[messages.length - 1];
      apiMessages = [
        { role: "system", content: systemPrompt },
        ...messages.slice(0, -1),
        {
          role: "user",
          content: [
            { type: "text", text: lastMessage.content },
            { type: "image_url", image_url: { url: imageData } }
          ]
        }
      ];
    } else {
      apiMessages = [
        { role: "system", content: systemPrompt },
        ...messages,
      ];
    }

    const requestBody: any = {
      model: model || "gpt-4o-mini",
      messages: apiMessages,
    };
    
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("OpenRouter response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error details:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "محدودیت تعداد درخواست، لطفاً بعداً تلاش کنید." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402 || response.status === 401) {
        return new Response(JSON.stringify({ error: "نیاز به شارژ اعتبار OpenAI یا API key نامعتبر است" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: `خطا از OpenAI (${response.status}): ${errorText.substring(0, 100)}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("OpenAI response:", JSON.stringify(data, null, 2));
    
    const assistantResponse = data.choices?.[0]?.message?.content || "متاسفانه پاسخی دریافت نشد.";

    return new Response(JSON.stringify({ text: assistantResponse }), {
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
