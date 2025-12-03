import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY not configured");
    return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Parse request body
    const body = await req.json().catch(() => ({}));
    const voice = body.voice || "alloy";

    console.log("Requesting ephemeral token for voice:", voice);

    // Request ephemeral token from OpenAI with optimized configuration
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: voice,
        modalities: ["text", "audio"],
        instructions: `شما یک دستیار هوشمند فارسی‌زبان هستید که به صورت دوستانه و مفید با کاربران صحبت می‌کنید. 
        
نکات مهم:
- همیشه به فارسی صحبت کنید مگر کاربر زبان دیگری بخواهد
- پاسخ‌های خود را کوتاه، واضح و مفید ارائه دهید
- صمیمانه و با احترام پاسخ دهید
- وقتی کاربر سلام می‌کند، با خوش‌رویی پاسخ دهید و از حالش بپرسید
- اگر سوالی نامشخص بود، برای روشن‌تر شدن سوال بپرسید

شما نئو هستید، دستیار هوشمند نئوهوش.`,
        input_audio_format: "pcm16",
        output_audio_format: "pcm16",
        input_audio_transcription: {
          model: "whisper-1"
        },
        turn_detection: {
          type: "server_vad",
          threshold: 0.3,
          prefix_padding_ms: 200,
          silence_duration_ms: 500,
          create_response: true
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: `OpenAI API error: ${response.status}`, details: errorText }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log("✅ Session created successfully with optimized config");
    console.log("Session config:", JSON.stringify({
      voice: data.voice,
      modalities: data.modalities,
      turn_detection: data.turn_detection
    }));

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
