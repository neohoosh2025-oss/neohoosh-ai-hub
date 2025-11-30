import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mic, MicOff, Phone, PhoneOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VOICES = [
  { value: "alloy", label: "Alloy", description: "صدای خنثی و متعادل" },
  { value: "echo", label: "Echo", description: "صدای مردانه و گرم" },
  { value: "fable", label: "Fable", description: "صدای انگلیسی بریتانیایی" },
  { value: "onyx", label: "Onyx", description: "صدای عمیق و قدرتمند" },
  { value: "nova", label: "Nova", description: "صدای زنانه و دوستانه" },
  { value: "shimmer", label: "Shimmer", description: "صدای نرم و روان" },
];

const VoiceCall = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [transcript, setTranscript] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [durationInterval, setDurationInterval] = useState<NodeJS.Timeout | null>(null);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContext({ sampleRate: 24000 });
      setAudioContext(context);

      const projectId = "mktsqcxbcaexyxmenafp";
      const wsUrl = `wss://${projectId}.supabase.co/functions/v1/realtime-voice`;
      
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log("WebSocket connected");
        websocket.send(JSON.stringify({ type: "config", voice: selectedVoice }));
        setIsConnected(true);
        
        // Start duration timer
        const interval = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
        setDurationInterval(interval);

        // Start sending audio
        const source = context.createMediaStreamSource(stream);
        const processor = context.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
          if (websocket.readyState === WebSocket.OPEN && !isMuted) {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16Array = new Int16Array(inputData.length);
            
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }

            const base64Audio = btoa(String.fromCharCode(...new Uint8Array(int16Array.buffer)));
            
            websocket.send(JSON.stringify({
              type: "input_audio_buffer.append",
              audio: base64Audio
            }));
          }
        };

        source.connect(processor);
        processor.connect(context.destination);
      };

      websocket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log("Received:", data.type);

        if (data.type === "response.audio.delta" && data.delta) {
          setIsAISpeaking(true);
          const audioData = Uint8Array.from(atob(data.delta), c => c.charCodeAt(0));
          
          if (context) {
            const audioBuffer = await context.decodeAudioData(audioData.buffer);
            const source = context.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(context.destination);
            source.start(0);
          }
        } else if (data.type === "response.audio.done") {
          setIsAISpeaking(false);
        } else if (data.type === "conversation.item.input_audio_transcription.completed") {
          setTranscript(prev => prev + "\n👤 شما: " + data.transcript);
        } else if (data.type === "response.audio_transcript.delta") {
          setTranscript(prev => prev + data.delta);
        } else if (data.type === "response.audio_transcript.done") {
          setTranscript(prev => prev + "\n");
        }
      };

      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast({
          title: "خطا در اتصال",
          description: "لطفاً دوباره تلاش کنید",
          variant: "destructive",
        });
        endCall();
      };

      websocket.onclose = () => {
        console.log("WebSocket closed");
        endCall();
      };

      setWs(websocket);

      toast({
        title: "تماس برقرار شد",
        description: "می‌توانید صحبت کنید",
      });
    } catch (error) {
      console.error("Error starting call:", error);
      toast({
        title: "خطا",
        description: "دسترسی به میکروفون رد شد",
        variant: "destructive",
      });
    }
  };

  const endCall = () => {
    if (ws) {
      ws.close();
      setWs(null);
    }
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }
    if (durationInterval) {
      clearInterval(durationInterval);
      setDurationInterval(null);
    }
    setIsConnected(false);
    setIsAISpeaking(false);
    setCallDuration(0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "میکروفون فعال شد" : "میکروفون خاموش شد",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border/50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-bold">تماس صوتی</h1>
          {isConnected && (
            <p className="text-sm text-muted-foreground">{formatDuration(callDuration)}</p>
          )}
        </div>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        {/* AI Avatar with Animation */}
        <div className="relative">
          <AnimatePresence>
            {isAISpeaking && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/20"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  exit={{ scale: 1, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/30"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 1.3, opacity: 0 }}
                  exit={{ scale: 1, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 0.3,
                  }}
                />
              </>
            )}
          </AnimatePresence>

          <motion.div
            className="w-40 h-40 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-2xl relative z-10"
            animate={{
              scale: isAISpeaking ? [1, 1.1, 1] : 1,
            }}
            transition={{
              duration: 1,
              repeat: isAISpeaking ? Infinity : 0,
              ease: "easeInOut",
            }}
          >
            <Volume2 className="w-16 h-16 text-white" />
          </motion.div>
        </div>

        {/* Status */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">
            {isConnected ? "در حال تماس..." : "آماده برای شروع"}
          </h2>
          <p className="text-muted-foreground">
            {isConnected
              ? isAISpeaking
                ? "🎙️ AI در حال صحبت است..."
                : "👂 در حال گوش دادن..."
              : "برای شروع، دکمه تماس را فشار دهید"}
          </p>
        </div>

        {/* Voice Selection (only when not connected) */}
        {!isConnected && (
          <div className="w-full max-w-xs">
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VOICES.map((voice) => (
                  <SelectItem key={voice.value} value={voice.value}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{voice.label}</span>
                      <span className="text-xs text-muted-foreground">{voice.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Transcript */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl p-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50"
          >
            <p className="text-sm text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
              {transcript}
            </p>
          </motion.div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="p-6 flex items-center justify-center gap-6">
        {isConnected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={toggleMute}
              className="w-16 h-16 rounded-full"
            >
              {isMuted ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </Button>
          </motion.div>
        )}

        <Button
          size="icon"
          onClick={isConnected ? endCall : startCall}
          className={`w-20 h-20 rounded-full ${
            isConnected
              ? "bg-destructive hover:bg-destructive/90"
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          {isConnected ? (
            <PhoneOff className="w-8 h-8" />
          ) : (
            <Phone className="w-8 h-8" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default VoiceCall;
