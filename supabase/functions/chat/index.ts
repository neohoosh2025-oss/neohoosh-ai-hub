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
          messages: [{ role: "user", content: userPrompt }],
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
          return new Response(JSON.stringify({ error: "اعتبار تمام شده است." }), {
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
      
      if (!base64Image) throw new Error("No image returned from AI");
      if (!userId) throw new Error("User not authenticated");

      const base64Data = base64Image.split(',')[1];
      const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      const timestamp = Date.now();
      const fileName = `${userId}/${timestamp}.png`;

      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, imageBuffer, { contentType: 'image/png', upsert: false });

      if (uploadError) throw new Error("Failed to upload image");

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
        userContext = `

🔒 حافظه کاربر (فقط برای مرجع داخلی):
${memories.map(m => `- ${m.key}: ${m.value}`).join("\n")}

قوانین حافظه:
1. هرگز خودبه‌خود از این اطلاعات استفاده نکن
2. فقط وقتی کاربر صریحاً سؤال کرد
3. طبیعی باش، نگو "طبق حافظه"`;
      }
    }

    // System prompt - بهبود یافته برای گوش دادن به کاربر
    const systemPrompt = `شما NEOHi هستید - دستیار هوشمند نئوهوش.

⚠️ قانون طلایی: همیشه به درخواست کاربر گوش بده و دقیقاً همان کاری که می‌خواهد انجام بده!
- اگر کاربر گفت "جواب نده" → جواب نده
- اگر کاربر گفت "فقط سوال بپرس" → فقط سوال بپرس
- اگر کاربر گفت "کوتاه باش" → کوتاه باش
- اگر کاربر گفت "توضیح نده" → توضیح نده
- هرگز خلاف خواسته کاربر عمل نکن!

🎭 شخصیت:
- گرم، هوشمند، حرفه‌ای
- پاسخ‌های کوتاه و مفید
- بدون حرف‌های اضافی
- بدون کلیشه‌های AI
- به زبان کاربر پاسخ بده

📌 درباره نئوهوش:
نئوهوش پلتفرم هوش مصنوعی فارسی است. بنیان‌گذار: محمدرضا تقی‌معز

❌ هرگز:
- خلاف درخواست کاربر عمل نکن
- پرحرفی نکن
- "به عنوان یک AI..." نگو
- اطلاعات بی‌ربط نده${userContext}`;

    // Prepare messages with vision support
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg: any) => {
        if (msg.role === 'user' && imageData) {
          return {
            role: msg.role,
            content: [
              { type: "text", text: msg.content },
              { type: "image_url", image_url: { url: imageData } }
            ]
          };
        }
        return { role: msg.role, content: msg.content };
      })
    ];

    console.log("Calling Lovable AI with google/gemini-2.5-flash");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: apiMessages,
        stream: true
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "محدودیت درخواست. چند لحظه صبر کنید." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "اعتبار تمام شده است." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "خطا در پردازش" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "خطا" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
