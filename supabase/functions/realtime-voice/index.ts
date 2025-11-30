import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY not configured");
    return new Response("OPENAI_API_KEY not configured", { status: 500 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let openAISocket: WebSocket | null = null;
  let sessionReady = false;
  let selectedVoice = "alloy";

  socket.onopen = () => {
    console.log("Client connected");
    
    // Connect to OpenAI Realtime API
    const url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";
    
    try {
      openAISocket = new WebSocket(url, {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "OpenAI-Beta": "realtime=v1",
        }
      });
      console.log("OpenAI WebSocket created");
    } catch (error) {
      console.error("Error creating OpenAI WebSocket:", error);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "error", error: "Failed to connect to OpenAI" }));
      }
      return;
    }

    openAISocket.onopen = () => {
      console.log("Connected to OpenAI Realtime API");
    };

    openAISocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("OpenAI message type:", data.type);

        // Send session.update after receiving session.created
        if (data.type === "session.created" && !sessionReady) {
          sessionReady = true;
          
          const sessionConfig = {
            type: "session.update",
            session: {
              modalities: ["text", "audio"],
              instructions: "شما یک دستیار هوشمند فارسی‌زبان هستید که به صورت دوستانه و مفید با کاربران صحبت می‌کنید. پاسخ‌های خود را واضح، مختصر و کاربردی ارائه دهید. در مکالمات خود صمیمی، حرفه‌ای و کمک‌کننده باشید.",
              voice: selectedVoice,
              input_audio_format: "pcm16",
              output_audio_format: "pcm16",
              input_audio_transcription: {
                model: "whisper-1"
              },
              turn_detection: {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              },
              temperature: 0.8,
              max_response_output_tokens: "inf"
            }
          };
          openAISocket?.send(JSON.stringify(sessionConfig));
          console.log("Session configuration sent with voice:", selectedVoice);
        }

        // Forward all messages to client
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(event.data);
        }
      } catch (error) {
        console.error("Error processing OpenAI message:", error);
      }
    };

    openAISocket.onerror = (error) => {
      console.error("OpenAI WebSocket error:", error);
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ 
          type: "error", 
          error: "Connection to AI failed" 
        }));
      }
    };

    openAISocket.onclose = () => {
      console.log("OpenAI connection closed");
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Client message type:", data.type);

      // Handle voice selection
      if (data.type === "config" && data.voice) {
        selectedVoice = data.voice;
        console.log("Voice set to:", selectedVoice);
        return;
      }

      if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.send(event.data);
      }
    } catch (error) {
      console.error("Error processing client message:", error);
    }
  };

  socket.onerror = (error) => {
    console.error("Client WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("Client disconnected");
    if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.close();
    }
  };

  return response;
});
