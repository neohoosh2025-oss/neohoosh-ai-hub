import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mic, MicOff, Phone, PhoneOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AudioQueue, encodeAudioForAPI } from "@/utils/audioUtils";

const VOICES = [
  { value: "alloy", label: "Alloy", description: "صدای خنثی و متعادل" },
  { value: "echo", label: "Echo", description: "صدای مردانه و گرم" },
  { value: "fable", label: "Fable", description: "صدای انگلیسی" },
  { value: "onyx", label: "Onyx", description: "صدای عمیق و قدرتمند" },
  { value: "nova", label: "Nova", description: "صدای زنانه و دوستانه" },
  { value: "shimmer", label: "Shimmer", description: "صدای نرم و روان" },
];

const VoiceCall = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [transcript, setTranscript] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioQueue, setAudioQueue] = useState<AudioQueue | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioProcessor, setAudioProcessor] = useState<ScriptProcessorNode | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isConnected]);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const context = new AudioContext({ sampleRate: 24000 });
      setAudioContext(context);
      setMediaStream(stream);
      
      const queue = new AudioQueue(context);
      setAudioQueue(queue);

      const projectId = "mktsqcxbcaexyxmenafp";
      const wsUrl = `wss://${projectId}.supabase.co/functions/v1/realtime-voice`;
      
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log("✅ WebSocket connected");
        websocket.send(JSON.stringify({ type: "config", voice: selectedVoice }));
        setIsConnected(true);

        // Start sending audio
        const source = context.createMediaStreamSource(stream);
        const processor = context.createScriptProcessor(4096, 1, 1);
        setAudioProcessor(processor);

        processor.onaudioprocess = (e) => {
          if (websocket.readyState === WebSocket.OPEN && !isMuted) {
            const inputData = e.inputBuffer.getChannelData(0);
            const base64Audio = encodeAudioForAPI(inputData);
            
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
        
        if (data.type === "error") {
          console.error("❌ Server error:", data);
          toast.error("خطا در اتصال: " + (data.error || "مشکل نامشخص"), { duration: 2000 });
          return;
        }

        if (data.type === "response.audio.delta" && data.delta) {
          setIsAISpeaking(true);
          const audioData = Uint8Array.from(atob(data.delta), c => c.charCodeAt(0));
          await queue.addToQueue(audioData);
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
        console.error("❌ WebSocket error:", error);
        toast.error("خطا در اتصال - دوباره تلاش کنید", { duration: 2000 });
        endCall();
      };

      websocket.onclose = (event) => {
        console.log("🔌 WebSocket closed:", event.code, event.reason);
        endCall();
      };

      setWs(websocket);
      toast.success("تماس برقرار شد ✓", { duration: 2000 });
    } catch (error) {
      console.error("❌ Error starting call:", error);
      toast.error("دسترسی به میکروفون رد شد", { duration: 2000 });
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
    if (audioProcessor) {
      audioProcessor.disconnect();
      setAudioProcessor(null);
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    if (audioQueue) {
      audioQueue.clear();
      setAudioQueue(null);
    }
    setIsConnected(false);
    setIsAISpeaking(false);
    setCallDuration(0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast(isMuted ? "میکروفون فعال شد" : "میکروفون خاموش شد", { duration: 2000 });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border/30 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full hover:bg-primary/10"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <h1 className="text-xl font-bold flex items-center gap-2 justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
            تماس صوتی
          </h1>
          {isConnected && (
            <p className="text-sm text-muted-foreground mt-1">{formatDuration(callDuration)}</p>
          )}
        </div>
        <div className="w-10" />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-10">
        {/* AI Avatar with Pulsing Animation */}
        <div className="relative">
          <AnimatePresence>
            {isAISpeaking && (
              <>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full bg-primary/20"
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={{ scale: 2 + i * 0.3, opacity: 0 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay,
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          <motion.div
            className="w-48 h-48 rounded-full bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center shadow-2xl relative z-10 border-4 border-background"
            animate={{
              scale: isAISpeaking ? [1, 1.15, 1] : 1,
            }}
            transition={{
              duration: 0.8,
              repeat: isAISpeaking ? Infinity : 0,
              ease: "easeInOut",
            }}
          >
            <Sparkles className="w-20 h-20 text-white" />
          </motion.div>
        </div>

        {/* Status */}
        <div className="text-center space-y-3">
          <motion.h2 
            className="text-3xl font-bold"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: isConnected ? Infinity : 0 }}
          >
            {isConnected ? "در حال تماس..." : "آماده برای شروع"}
          </motion.h2>
          <p className="text-muted-foreground text-lg">
            {isConnected
              ? isAISpeaking
                ? "🎙️ AI در حال صحبت است..."
                : "👂 در حال گوش دادن..."
              : "دکمه تماس را فشار دهید"}
          </p>
        </div>

        {/* Voice Selection */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xs"
          >
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="w-full h-12 text-base bg-card/50 backdrop-blur-sm border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VOICES.map((voice) => (
                  <SelectItem key={voice.value} value={voice.value}>
                    <div className="flex flex-col items-start py-1">
                      <span className="font-medium">{voice.label}</span>
                      <span className="text-xs text-muted-foreground">{voice.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}

        {/* Transcript */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl p-5 bg-card/60 backdrop-blur-md rounded-3xl border border-border/30 shadow-lg"
          >
            <p className="text-sm text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto leading-relaxed">
              {transcript}
            </p>
          </motion.div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="p-8 flex items-center justify-center gap-8">
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
              className={`w-16 h-16 rounded-full transition-all ${
                isMuted ? 'bg-destructive/10 border-destructive/30' : 'hover:bg-primary/10'
              }`}
            >
              {isMuted ? (
                <MicOff className="w-6 h-6 text-destructive" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </Button>
          </motion.div>
        )}

        <motion.div
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
        >
          <Button
            size="icon"
            onClick={isConnected ? endCall : startCall}
            className={`w-24 h-24 rounded-full shadow-2xl transition-all ${
              isConnected
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            }`}
          >
            {isConnected ? (
              <PhoneOff className="w-10 h-10" />
            ) : (
              <Phone className="w-10 h-10" />
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default VoiceCall;