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

  socket.onopen = async () => {
    console.log("Client connected");
    
    try {
      console.log("Connecting to OpenAI Realtime API...");
      
      // Create WebSocket connection to OpenAI using Deno.connectTls for custom headers
      const url = "api.openai.com";
      const path = "/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01";
      
      // Establish TLS connection
      const conn = await Deno.connectTls({
        hostname: url,
        port: 443,
      });

      // Send WebSocket upgrade request with authentication
      const key = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16))));
      const upgradeRequest = [
        `GET ${path} HTTP/1.1`,
        `Host: ${url}`,
        `Upgrade: websocket`,
        `Connection: Upgrade`,
        `Sec-WebSocket-Key: ${key}`,
        `Sec-WebSocket-Version: 13`,
        `Authorization: Bearer ${OPENAI_API_KEY}`,
        `OpenAI-Beta: realtime=v1`,
        ``,
        ``
      ].join("\r\n");

      await conn.write(new TextEncoder().encode(upgradeRequest));

      // Read upgrade response
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      const response = new TextDecoder().decode(buffer.subarray(0, n!));
      
      console.log("OpenAI response headers:", response.split("\r\n")[0]);

      if (!response.includes("101")) {
        throw new Error("WebSocket upgrade failed: " + response.split("\r\n")[0]);
      }

      console.log("✅ Connected to OpenAI, creating WebSocket wrapper...");

      // Create a proper WebSocket-like interface
      const sendToOpenAI = async (data: string) => {
        // WebSocket frame format for text message
        const payload = new TextEncoder().encode(data);
        const frame = new Uint8Array(2 + payload.length);
        frame[0] = 0x81; // Text frame, FIN bit set
        frame[1] = payload.length; // Payload length
        frame.set(payload, 2);
        await conn.write(frame);
      };

      const readFromOpenAI = async () => {
        const headerBuffer = new Uint8Array(2);
        await conn.read(headerBuffer);
        
        const fin = (headerBuffer[0] & 0x80) !== 0;
        const opcode = headerBuffer[0] & 0x0F;
        let payloadLength = headerBuffer[1] & 0x7F;

        if (payloadLength === 126) {
          const extBuffer = new Uint8Array(2);
          await conn.read(extBuffer);
          payloadLength = (extBuffer[0] << 8) | extBuffer[1];
        } else if (payloadLength === 127) {
          const extBuffer = new Uint8Array(8);
          await conn.read(extBuffer);
          payloadLength = Number((BigInt(extBuffer[0]) << 56n) | (BigInt(extBuffer[1]) << 48n) | 
                                 (BigInt(extBuffer[2]) << 40n) | (BigInt(extBuffer[3]) << 32n) |
                                 (BigInt(extBuffer[4]) << 24n) | (BigInt(extBuffer[5]) << 16n) |
                                 (BigInt(extBuffer[6]) << 8n) | BigInt(extBuffer[7]));
        }

        const payloadBuffer = new Uint8Array(payloadLength);
        await conn.read(payloadBuffer);

        if (opcode === 0x1) { // Text frame
          return new TextDecoder().decode(payloadBuffer);
        }
        return null;
      };

      // Message loop
      (async () => {
        try {
          while (true) {
            const message = await readFromOpenAI();
            if (!message) continue;

            const data = JSON.parse(message);
            console.log("📨 OpenAI message type:", data.type);

            if (data.type === "error") {
              console.error("❌ OpenAI Error:", JSON.stringify(data, null, 2));
            }

            if (data.type === "session.created" && !sessionReady) {
              sessionReady = true;
              console.log("✅ Session created, sending configuration...");
              
              const sessionConfig = {
                type: "session.update",
                session: {
                  modalities: ["text", "audio"],
                  instructions: "شما یک دستیار هوشمند فارسی‌زبان هستید که به صورت دوستانه و مفید با کاربران صحبت می‌کنید. پاسخ‌های خود را واضح، مختصر و کاربردی ارائه دهید.",
                  voice: selectedVoice,
                  input_audio_format: "pcm16",
                  output_audio_format: "pcm16",
                  input_audio_transcription: { model: "whisper-1" },
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
              await sendToOpenAI(JSON.stringify(sessionConfig));
              console.log("📤 Session configuration sent");
            }

            if (socket.readyState === WebSocket.OPEN) {
              socket.send(message);
            }
          }
        } catch (error) {
          console.error("Error in message loop:", error);
          if (socket.readyState === WebSocket.OPEN) {
            socket.close();
          }
        }
      })();

      // Store send function for client messages
      (socket as any).sendToOpenAI = sendToOpenAI;

    } catch (error) {
      console.error("Error connecting to OpenAI:", error);
      if (socket.readyState === WebSocket.OPEN) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        socket.send(JSON.stringify({ type: "error", error: "Failed to connect: " + errorMsg }));
      }
    }
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("📨 Client message type:", data.type);

      if (data.type === "config" && data.voice) {
        selectedVoice = data.voice;
        console.log("🎤 Voice set to:", selectedVoice);
        return;
      }

      const sendFn = (socket as any).sendToOpenAI;
      if (sendFn) {
        await sendFn(event.data);
      } else {
        console.warn("⚠️ OpenAI connection not ready");
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
  };

  return response;
});
