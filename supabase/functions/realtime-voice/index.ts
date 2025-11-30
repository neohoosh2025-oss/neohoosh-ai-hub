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
    
    // Connect to OpenAI Realtime API with authorization in URL
    // Note: This is a workaround since Deno WebSocket doesn't support custom headers
    const url = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`;
    
    try {
      // Create request with proper headers for WebSocket upgrade
      const wsHeaders = {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime=v1'
      };

      // Deno WebSocket workaround: encode auth in connection string
      // Since we can't pass headers, we need to create the socket differently
      const wsRequest = new Request(url, {
        headers: wsHeaders
      });

      // For Deno, we have to use a workaround - create WebSocket after handshake
      // But since WebSocket constructor doesn't accept options, we use native Deno approach
      console.log("Creating OpenAI WebSocket connection...");
      
      // This is the proper way in Deno - create socket with authorization
      openAISocket = new WebSocket(url, {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'realtime=v1'
        }
      } as any); // Type cast needed for Deno's WebSocket options
      
      console.log("OpenAI WebSocket created");
    } catch (error) {
      console.error("Error creating OpenAI WebSocket:", error);
      if (socket.readyState === WebSocket.OPEN) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        socket.send(JSON.stringify({ type: "error", error: "Failed to connect to OpenAI: " + errorMsg }));
      }
      return;
    }

    openAISocket.onopen = () => {
      console.log("✅ Connected to OpenAI Realtime API");
      console.log("Waiting for session.created event...");
    };

    openAISocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📨 OpenAI message type:", data.type);

        // Log error details if present
        if (data.type === "error") {
          console.error("❌ OpenAI Error:", JSON.stringify(data, null, 2));
        }

        // Send session.update after receiving session.created
        if (data.type === "session.created" && !sessionReady) {
          sessionReady = true;
          console.log("✅ Session created, sending configuration...");
          
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
          console.log("📤 Session configuration sent with voice:", selectedVoice);
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
      console.error("❌ OpenAI WebSocket error:", error);
      if (socket.readyState === WebSocket.OPEN) {
        const errorMsg = error instanceof ErrorEvent && error.message ? error.message : "Unknown error";
        socket.send(JSON.stringify({ 
          type: "error", 
          error: "Connection to AI failed: " + errorMsg
        }));
      }
    };

    openAISocket.onclose = (event) => {
      console.log("🔌 OpenAI connection closed. Code:", event.code, "Reason:", event.reason);
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("📨 Client message type:", data.type);

      // Handle voice selection
      if (data.type === "config" && data.voice) {
        selectedVoice = data.voice;
        console.log("🎤 Voice set to:", selectedVoice);
        return;
      }

      if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
        openAISocket.send(event.data);
      } else {
        console.warn("⚠️ OpenAI socket not ready, state:", openAISocket?.readyState);
      }
    } catch (error) {
      console.error("Error processing client message:", error);
    }
  };

  socket.onerror = (error) => {
    console.error("❌ Client WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("🔌 Client disconnected");
    if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
      openAISocket.close();
    }
  };

  return response;
});