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
      business: "شما یک مشاور حرفه‌ای کسب و کار هستید. در یک مکالمه مداوم با کاربر هستید - فقط اولین بار سلام کنید، در ادامه مکالمه مستقیماً به سوالات پاسخ دهید.",
      personal: "شما یک مربی توسعه فردی هستید. در یک مکالمه مداوم با کاربر هستید - فقط اولین بار سلام کنید، در ادامه مکالمه مستقیماً به سوالات پاسخ دهید.",
      general: "شما در یک مکالمه مداوم با کاربر هستید. اگر قبلاً سلام کرده‌اید، دیگر سلام نکنید و مستقیماً به سوال پاسخ دهید.",
      ads: "شما یک متخصص تبلیغات هستید. در یک مکالمه مداوم با کاربر هستید - فقط اولین بار سلام کنید، در ادامه مکالمه مستقیماً به سوالات پاسخ دهید.",
    };

    let systemPrompt = systemPrompts[modelType] || systemPrompts.general;
    
    // Add memory context if exists
    if (userContext) {
      systemPrompt += userContext;
    }

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
      stream: true, // Enable streaming for faster response
    };
    
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

    // Return streaming response
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      },
    });

  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطای ناشناخته" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
