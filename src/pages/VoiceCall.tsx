import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Sparkles, 
  Loader2,
  Volume2,
  Waves
} from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";

const VOICES = [
  { value: "alloy", label: "آلوی", description: "صدای متعادل و حرفه‌ای" },
  { value: "echo", label: "اکو", description: "صدای مردانه و گرم" },
  { value: "shimmer", label: "شیمر", description: "صدای نرم و روان" },
  { value: "ash", label: "اَش", description: "صدای مردانه و آرام" },
  { value: "coral", label: "کورال", description: "صدای زنانه و گرم" },
  { value: "sage", label: "سِیج", description: "صدای طبیعی و دوستانه" },
];

interface TranscriptItem {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

const VoiceCall = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("alloy");
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [currentAIText, setCurrentAIText] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<string>("آماده برای شروع");
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<number | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, currentAIText]);

  const startCall = async () => {
    setIsConnecting(true);
    setConnectionStatus("در حال دریافت توکن...");
    console.log('🔄 Starting voice call...');
    
    try {
      // Get ephemeral token
      console.log('📡 Requesting ephemeral token for voice:', selectedVoice);
      const { data: tokenData, error: tokenError } = await supabase.functions.invoke('realtime-voice', {
        body: { voice: selectedVoice }
      });

      console.log('📦 Token response:', tokenData);

      if (tokenError) {
        console.error('❌ Token error:', tokenError);
        throw new Error('خطا در دریافت توکن');
      }

      if (!tokenData?.client_secret?.value) {
        console.error('❌ Invalid token data:', tokenData);
        throw new Error('توکن دریافت شده معتبر نیست');
      }

      const EPHEMERAL_KEY = tokenData.client_secret.value;
      console.log('✅ Got ephemeral token');
      setConnectionStatus("در حال دسترسی به میکروفون...");

      // Create peer connection with STUN servers
      pcRef.current = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Monitor connection state
      pcRef.current.onconnectionstatechange = () => {
        console.log('📶 Connection state:', pcRef.current?.connectionState);
        if (pcRef.current?.connectionState === 'connected') {
          console.log('✅ Peer connection fully connected!');
        } else if (pcRef.current?.connectionState === 'failed') {
          console.error('❌ Connection failed');
          toast.error("اتصال قطع شد");
          endCall();
        }
      };

      pcRef.current.oniceconnectionstatechange = () => {
        console.log('🧊 ICE state:', pcRef.current?.iceConnectionState);
      };

      // Set up remote audio
      audioElRef.current = document.createElement('audio');
      audioElRef.current.autoplay = true;
      audioElRef.current.volume = 1.0;
      
      pcRef.current.ontrack = (e) => {
        console.log('🔊 Received audio track from AI');
        if (audioElRef.current && e.streams[0]) {
          audioElRef.current.srcObject = e.streams[0];
          audioElRef.current.play().catch(err => {
            console.error('Audio play error:', err);
          });
        }
      };

      // Add local audio track
      setConnectionStatus("در حال فعال‌سازی میکروفون...");
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
      const audioTrack = ms.getTracks()[0];
      pcRef.current.addTrack(audioTrack, ms);
      console.log('🎤 Microphone active');

      // Set up data channel BEFORE creating offer
      setConnectionStatus("در حال ایجاد کانال داده...");
      dcRef.current = pcRef.current.createDataChannel('oai-events');
      
      dcRef.current.onopen = () => {
        console.log('✅ Data channel OPEN');
        setConnectionStatus("کانال داده باز شد");
        toast.success("اتصال برقرار شد - صحبت کنید!");
      };
      
      dcRef.current.onclose = () => {
        console.log('❌ Data channel closed');
      };
      
      dcRef.current.onerror = (e) => {
        console.error('❌ Data channel error:', e);
      };
      
      dcRef.current.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data);
          console.log('📨 Event:', event.type);

          switch (event.type) {
            case 'session.created':
              console.log('✅ Session ready on OpenAI');
              setConnectionStatus("آماده - صحبت کنید");
              break;
              
            case 'input_audio_buffer.speech_started':
              console.log('🎙️ Speech detected!');
              setIsUserSpeaking(true);
              setConnectionStatus("در حال گوش دادن...");
              break;
              
            case 'input_audio_buffer.speech_stopped':
              console.log('🎙️ Speech ended');
              setIsUserSpeaking(false);
              setConnectionStatus("در حال پردازش...");
              break;
              
            case 'input_audio_buffer.committed':
              console.log('📝 Audio committed');
              break;
              
            case 'response.created':
              console.log('🤖 AI response started');
              setCurrentAIText("");
              setConnectionStatus("AI در حال پاسخ‌دهی...");
              break;
              
            case 'response.audio.delta':
              setIsAISpeaking(true);
              break;
              
            case 'response.audio.done':
              setIsAISpeaking(false);
              break;
              
            case 'response.done':
              console.log('✅ AI response complete');
              setIsAISpeaking(false);
              setConnectionStatus("آماده - صحبت کنید");
              if (currentAIText.trim()) {
                setTranscripts(prev => [...prev, {
                  role: 'assistant',
                  text: currentAIText,
                  timestamp: new Date()
                }]);
                setCurrentAIText("");
              }
              break;
              
            case 'conversation.item.input_audio_transcription.completed':
              if (event.transcript) {
                console.log('👤 User said:', event.transcript);
                setTranscripts(prev => [...prev, {
                  role: 'user',
                  text: event.transcript,
                  timestamp: new Date()
                }]);
              }
              break;
              
            case 'response.audio_transcript.delta':
              if (event.delta) {
                setCurrentAIText(prev => prev + event.delta);
              }
              break;
              
            case 'error':
              console.error('❌ OpenAI error:', event.error);
              toast.error(event.error?.message || "خطای OpenAI");
              break;
          }
        } catch (error) {
          console.error('Parse error:', error);
        }
      };

      // Create and send offer
      setConnectionStatus("در حال برقراری اتصال...");
      console.log('📞 Creating offer...');
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      
      // Wait for ICE gathering to complete
      await new Promise<void>((resolve) => {
        if (pcRef.current?.iceGatheringState === 'complete') {
          resolve();
        } else {
          pcRef.current!.onicegatheringstatechange = () => {
            if (pcRef.current?.iceGatheringState === 'complete') {
              resolve();
            }
          };
          // Timeout after 2 seconds
          setTimeout(resolve, 2000);
        }
      });
      
      console.log('🧊 ICE gathering done');
      
      // Get the final SDP with all ICE candidates
      const finalOffer = pcRef.current.localDescription;
      
      // Connect to OpenAI
      console.log('🌐 Connecting to OpenAI...');
      const sdpResponse = await fetch("https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17", {
        method: "POST",
        body: finalOffer!.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });

      console.log('📡 Response status:', sdpResponse.status);
      
      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        console.error('❌ SDP error:', errorText);
        throw new Error('خطا در اتصال به OpenAI');
      }

      const answerSdp = await sdpResponse.text();
      console.log('✅ Got SDP answer');
      
      await pcRef.current.setRemoteDescription({
        type: "answer",
        sdp: answerSdp,
      });
      
      console.log('✅ Remote description set');

      setIsConnected(true);
      setCallDuration(0);
      
      durationIntervalRef.current = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : "خطا در اتصال");
      setConnectionStatus("خطا در اتصال");
      endCall();
    } finally {
      setIsConnecting(false);
    }
  };

  const endCall = () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    if (dcRef.current) {
      dcRef.current.close();
      dcRef.current = null;
    }
    
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    
    if (audioElRef.current) {
      audioElRef.current.srcObject = null;
      audioElRef.current = null;
    }
    
    setIsConnected(false);
    setIsAISpeaking(false);
    setIsUserSpeaking(false);
    setCallDuration(0);
    setConnectionStatus("آماده برای شروع");
    setCurrentAIText("");
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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        {isAISpeaking && (
          <motion.div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-3 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
        
        <div className="flex flex-col items-center">
          <h1 className="text-lg font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            گفتگوی صوتی
          </h1>
          {isConnected && (
            <span className="text-xs text-white/50 font-mono">{formatDuration(callDuration)}</span>
          )}
        </div>
        
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-between py-6 px-4 relative z-10">
        
        {/* Voice Selection */}
        {!isConnected && !isConnecting && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            <label className="block text-sm text-white/60 mb-2 text-center">انتخاب صدای AI</label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="w-full h-12 bg-white/5 border-white/10 text-white rounded-2xl backdrop-blur-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                {VOICES.map((voice) => (
                  <SelectItem 
                    key={voice.value} 
                    value={voice.value}
                    className="text-white focus:bg-white/10 focus:text-white"
                  >
                    <div className="flex flex-col items-start py-1">
                      <span className="font-medium">{voice.label}</span>
                      <span className="text-xs text-white/50">{voice.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
        )}

        {/* Avatar & Visualization */}
        <div className="flex-1 flex items-center justify-center py-8">
          <div className="relative">
            {/* Sound Waves */}
            <AnimatePresence>
              {(isAISpeaking || isUserSpeaking) && (
                <>
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className={`absolute inset-0 rounded-full border-2 ${
                        isAISpeaking ? 'border-primary/40' : 'border-emerald-500/40'
                      }`}
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 1.5 + (i * 0.3), opacity: 0 }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeOut",
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Main Avatar */}
            <motion.div
              className={`relative w-40 h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center shadow-2xl ${
                isConnected 
                  ? isAISpeaking 
                    ? 'bg-gradient-to-br from-primary via-primary/90 to-violet-600' 
                    : isUserSpeaking
                      ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600'
                      : 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700'
                  : 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800'
              }`}
              animate={{
                scale: isAISpeaking ? [1, 1.08, 1] : isUserSpeaking ? [1, 1.05, 1] : 1,
              }}
              transition={{
                duration: 0.8,
                repeat: (isAISpeaking || isUserSpeaking) ? Infinity : 0,
                ease: "easeInOut",
              }}
            >
              {isConnecting ? (
                <Loader2 className="w-16 h-16 text-white animate-spin" />
              ) : isAISpeaking ? (
                <Waves className="w-16 h-16 text-white" />
              ) : isUserSpeaking ? (
                <Mic className="w-16 h-16 text-white" />
              ) : (
                <Sparkles className="w-16 h-16 text-white/80" />
              )}
            </motion.div>
          </div>
        </div>

        {/* Status & Transcript */}
        <div className="w-full max-w-lg space-y-4">
          <motion.div className="text-center">
            <p className={`text-sm font-medium ${
              isAISpeaking ? 'text-primary' : 
              isUserSpeaking ? 'text-emerald-400' : 
              'text-white/50'
            }`}>
              {connectionStatus}
            </p>
          </motion.div>

          {/* Transcript Area */}
          {isConnected && (transcripts.length > 0 || currentAIText) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
            >
              <ScrollArea className="h-40 p-4">
                <div className="space-y-3">
                  {transcripts.map((item, index) => (
                    <div 
                      key={index}
                      className={`flex ${item.role === 'user' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${
                        item.role === 'user' 
                          ? 'bg-emerald-500/20 text-emerald-100' 
                          : 'bg-primary/20 text-white'
                      }`}>
                        <span className="text-xs opacity-60 block mb-1">
                          {item.role === 'user' ? '👤 شما' : '🤖 AI'}
                        </span>
                        {item.text}
                      </div>
                    </div>
                  ))}
                  {currentAIText && (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] px-4 py-2 rounded-2xl bg-primary/20 text-white text-sm">
                        <span className="text-xs opacity-60 block mb-1">🤖 AI</span>
                        {currentAIText}
                        <span className="inline-block w-2 h-4 bg-white/50 animate-pulse mr-1" />
                      </div>
                    </div>
                  )}
                  <div ref={transcriptEndRef} />
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="pt-6 flex items-center justify-center gap-6">
          {isConnected && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full border ${
                  isMuted 
                    ? 'bg-red-500/20 border-red-500/30 text-red-400' 
                    : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
            </motion.div>
          )}

          <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}>
            <Button
              size="icon"
              onClick={isConnected ? endCall : startCall}
              disabled={isConnecting}
              className={`w-20 h-20 rounded-full shadow-2xl ${
                isConnected
                  ? "bg-gradient-to-br from-red-500 to-red-600 shadow-red-500/30"
                  : "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-500/30"
              }`}
            >
              {isConnecting ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : isConnected ? (
                <PhoneOff className="w-8 h-8" />
              ) : (
                <Phone className="w-8 h-8" />
              )}
            </Button>
          </motion.div>

          {isConnected && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <Button
                variant="ghost"
                size="icon"
                className="w-14 h-14 rounded-full bg-white/5 border border-white/10 text-white/70"
              >
                <Volume2 className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </div>

        {!isConnected && !isConnecting && (
          <p className="text-white/30 text-xs text-center mt-4">
            با فشردن دکمه سبز، گفتگوی صوتی آغاز می‌شود
          </p>
        )}
      </div>
    </div>
  );
};

export default VoiceCall;
