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
    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase config missing");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user ID from auth header for memory access
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Handle media generation (image generation via OpenRouter)
    if (modelType === "image") {
      const userPrompt = messages[messages.length - 1].content;
      
      const imageResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": SUPABASE_URL,
          "X-Title": "NeoHoosh AI Platform",
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
      const base64Image = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
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
      const base64Data = base64Image.split(',')[1];
      const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
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

    // Load user memory
    let userContext = "";
    if (userId) {
      const { data: memories } = await supabase
        .from('user_memory')
        .select('key, value')
        .eq('user_id', userId);
      
      if (memories && memories.length > 0) {
        userContext = "\n\nاطلاعات ذخیره شده کاربر:\n" + 
          memories.map(m => `${m.key}: ${m.value}`).join("\n");
      }
    }

    // Define system prompts for each model
    const systemPrompts: Record<string, string> = {
      business: "شما یک مشاور حرفه‌ای کسب و کار هستید. تخصص شما در استراتژی، بازاریابی، مدیریت و رشد کسب و کار است. پاسخ‌های شما عملی، تحلیلی و مبتنی بر داده است.",
      personal: "شما یک مربی توسعه فردی و حرفه‌ای هستید. به افراد کمک می‌کنید تا مهارت‌های خود را بهبود بخشند، اهداف شخصی خود را تعیین کنند و به آن‌ها دست یابند. پاسخ‌های شما انگیزشی و راهنما هستند.",
      general: "شما یک دستیار هوشمند و دانا هستید که می‌تواند در مورد موضوعات مختلف پاسخ دهید. پاسخ‌های شما دقیق، جامع و قابل فهم هستند.",
      ads: "شما یک متخصص تبلیغات و بازاریابی محتوا هستید. می‌توانید متن‌های تبلیغاتی جذاب، شعارها و کمپین‌های خلاقانه ایجاد کنید. پاسخ‌های شما خلاق و متقاعدکننده هستند.",
    };

    let systemPrompt = systemPrompts[modelType] || systemPrompts.general;
    
    // Add memory instructions and context
    systemPrompt += `\n\nدستورالعمل حافظه: وقتی کاربر اطلاعات شخصی مهمی مانند نام، سن، شغل، علایق یا هر جزئیات مهم دیگری به شما می‌دهد، این اطلاعات را به خاطر بسپارید. در انتهای پاسخ خود، اگر اطلاعات جدیدی یاد گرفتید، آن را در این فرمت اضافه کنید:
[MEMORY_SAVE:key=value]
مثال: [MEMORY_SAVE:name=محمدرضا] یا [MEMORY_SAVE:job=برنامه‌نویس]

همیشه از اطلاعات ذخیره شده برای شخصی‌سازی پاسخ‌های خود استفاده کنید.${userContext}`;

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

    // Use Grok with reasoning for vision or standard chat
    const selectedModel = imageData 
      ? "qwen/qwen2.5-vl-32b-instruct:free" 
      : "x-ai/grok-4.1-fast:free";
    
    // Check if we need to preserve reasoning from previous message
    const lastAssistantMsg = [...apiMessages].reverse().find(m => m.role === 'assistant');
    const hasReasoningDetails = lastAssistantMsg?.reasoning_details;
    
    const requestBody: any = {
      model: selectedModel,
      messages: apiMessages,
    };
    
    // Enable reasoning for Grok model (but not for vision model)
    if (!imageData) {
      requestBody.reasoning = { enabled: true };
    }
    
    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": SUPABASE_URL,
        "X-Title": "NeoHoosh AI Platform",
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
        return new Response(JSON.stringify({ error: "نیاز به شارژ اعتبار OpenRouter یا API key نامعتبر است" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: `خطا از OpenRouter (${response.status}): ${errorText.substring(0, 100)}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("OpenRouter response:", JSON.stringify(data, null, 2));
    
    const assistantMessage = data.choices?.[0]?.message;
    let assistantResponse = assistantMessage?.content || "متاسفانه پاسخی دریافت نشد.";
    const reasoningDetails = assistantMessage?.reasoning_details;

    // Extract and save memory items
    if (userId) {
      const memoryPattern = /\[MEMORY_SAVE:(\w+)=([^\]]+)\]/g;
      let match;
      
      while ((match = memoryPattern.exec(assistantResponse)) !== null) {
        const [fullMatch, key, value] = match;
        
        // Save to database
        await supabase
          .from('user_memory')
          .upsert({
            user_id: userId,
            memory_type: 'profile',
            key: key,
            value: value,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,key'
          });
        
        // Remove memory tags from response
        assistantResponse = assistantResponse.replace(fullMatch, '');
      }
      
      // Clean up any extra whitespace
      assistantResponse = assistantResponse.trim();
    }

    return new Response(JSON.stringify({ 
      text: assistantResponse,
      reasoning_details: reasoningDetails 
    }), {
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
