import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Mic, MicOff, Phone, PhoneOff, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const VOICES = [
  { value: "alloy", label: "Alloy", description: "صدای متعادل و حرفه‌ای" },
  { value: "echo", label: "Echo", description: "صدای مردانه و گرم" },
  { value: "shimmer", label: "Shimmer", description: "صدای نرم و روان" },
  { value: "ash", label: "Ash", description: "صدای مردانه و آرام" },
  { value: "coral", label: "Coral", description: "صدای زنانه و گرم" },
  { value: "sage", label: "Sage", description: "صدای طبیعی و دوستانه" },
];

const VoiceCall = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [transcript, setTranscript] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  const startCall = async () => {
    setIsConnecting(true);
    
    try {
      // Get ephemeral token
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke('realtime-voice', {
        body: { voice: selectedVoice }
      });

      if (tokenError || !tokenData?.client_secret?.value) {
        console.error('Token error:', tokenError, tokenData);
        throw new Error('Failed to get session token');
      }

      const EPHEMERAL_KEY = tokenData.client_secret.value;
      console.log('✅ Got ephemeral token');

      // Create peer connection
      pcRef.current = new RTCPeerConnection();

      // Set up remote audio
      audioElRef.current = document.createElement('audio');
      audioElRef.current.autoplay = true;
      pcRef.current.ontrack = (e) => {
        console.log('🔊 Received audio track');
        if (audioElRef.current) {
          audioElRef.current.srcObject = e.streams[0];
        }
      };

      // Add local audio track
      const ms = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      mediaStreamRef.current = ms;
      pcRef.current.addTrack(ms.getTracks()[0]);

      // Set up data channel
      dcRef.current = pcRef.current.createDataChannel('oai-events');
      
      dcRef.current.addEventListener('message', (e) => {
        try {
          const event = JSON.parse(e.data);
          console.log('📨 Event:', event.type);

          switch (event.type) {
            case 'response.audio.delta':
              setIsAISpeaking(true);
              break;
            case 'response.audio.done':
              setIsAISpeaking(false);
              break;
            case 'conversation.item.input_audio_transcription.completed':
              if (event.transcript) {
                setTranscript(prev => prev + "\n👤 شما: " + event.transcript);
              }
              break;
            case 'response.audio_transcript.delta':
              setTranscript(prev => prev + (event.delta || ''));
              break;
            case 'response.audio_transcript.done':
              setTranscript(prev => prev + "\n");
              break;
            case 'error':
              console.error('❌ OpenAI error:', event);
              toast.error("خطا: " + (event.error?.message || "مشکل نامشخص"));
              break;
          }
        } catch (error) {
          console.error('Error parsing event:', error);
        }
      });

      // Create offer
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);

      // Connect to OpenAI
      const sdpResponse = await fetch("https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17", {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        throw new Error('Failed to establish connection');
      }

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await pcRef.current.setRemoteDescription(answer);
      console.log('✅ WebRTC connected');

      setIsConnected(true);
      setCallDuration(0);
      
      durationIntervalRef.current = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      toast.success("تماس برقرار شد ✓");
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : "خطا در اتصال");
    } finally {
      setIsConnecting(false);
    }
  };

  const endCall = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    dcRef.current?.close();
    pcRef.current?.close();
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (audioElRef.current) {
      audioElRef.current.srcObject = null;
      audioElRef.current = null;
    }
    
    pcRef.current = null;
    dcRef.current = null;
    
    setIsConnected(false);
    setIsAISpeaking(false);
    setCallDuration(0);
  };

  const toggleMute = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
        toast(isMuted ? "میکروفون فعال شد" : "میکروفون خاموش شد");
      }
    }
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
        {/* AI Avatar */}
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
            {isConnecting ? "در حال اتصال..." : isConnected ? "در حال تماس..." : "آماده برای شروع"}
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
        {!isConnected && !isConnecting && (
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
            disabled={isConnecting}
            className={`w-24 h-24 rounded-full shadow-2xl transition-all ${
              isConnected
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            }`}
          >
            {isConnecting ? (
              <Loader2 className="w-10 h-10 animate-spin" />
            ) : isConnected ? (
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
