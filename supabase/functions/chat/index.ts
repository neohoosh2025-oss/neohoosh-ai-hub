import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, modelType, imageData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
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

    // Handle image generation
    if (modelType === "image") {
      const userPrompt = messages[messages.length - 1].content;
      
      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [
            {
              role: "user",
              content: userPrompt
            }
          ],
        }),
      });

      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error("Image generation error:", imageResponse.status, errorText);
        
        if (imageResponse.status === 429) {
          return new Response(JSON.stringify({ error: "محدودیت تعداد درخواست. لطفاً چند لحظه صبر کنید." }), {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (imageResponse.status === 402) {
          return new Response(JSON.stringify({ error: "اعتبار تمام شده است. لطفاً اعتبار خود را شارژ کنید." }), {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        return new Response(JSON.stringify({ error: "خطا در تولید تصویر" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const imageData = await imageResponse.json();
      const base64Image = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!base64Image) {
        throw new Error("No image returned from AI");
      }

      if (!userId) throw new Error("User not authenticated");

      // Convert base64 to blob
      const base64Data = base64Image.split(',')[1];
      const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const timestamp = Date.now();
      const fileName = `${userId}/${timestamp}.png`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, imageBuffer, {
          contentType: 'image/png',
          upsert: false
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Failed to upload image");
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      return new Response(JSON.stringify({ imageUrl: publicUrl }), {
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
      // Use vision-capable model for images
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

    // Use Lovable AI with Gemini Flash for text chat
    const selectedModel = imageData 
      ? "google/gemini-2.5-pro"  // Pro for vision
      : "google/gemini-2.5-flash"; // Flash for text
    
    console.log("Using model:", selectedModel);
    console.log("Request body:", JSON.stringify({ model: selectedModel, messages: apiMessages.length }, null, 2));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: apiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      let errorMessage = "خطا در پردازش درخواست.";
      
      if (response.status === 429) {
        errorMessage = "محدودیت تعداد درخواست. لطفاً چند لحظه صبر کنید و دوباره تلاش کنید.";
      } else if (response.status === 402) {
        errorMessage = "اعتبار تمام شده است. لطفاً اعتبار خود را شارژ کنید.";
      } else if (response.status >= 500) {
        errorMessage = "خطای سرور. لطفاً بعداً تلاش کنید.";
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { 
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
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
