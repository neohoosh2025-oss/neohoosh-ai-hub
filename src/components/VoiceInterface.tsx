import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { PhoneCall, PhoneOff, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioRecorder, encodeAudioForAPI, playAudioData, clearAudioQueue } from '@/utils/RealtimeAudio';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

interface VoiceInterfaceProps {
  onTranscriptUpdate?: (text: string) => void;
}

const VOICES = [
  { value: 'alloy', label: 'Alloy', description: 'متعادل و حرفه‌ای' },
  { value: 'echo', label: 'Echo', description: 'مردانه و صمیمی' },
  { value: 'fable', label: 'Fable', description: 'زنانه و گرم' },
  { value: 'onyx', label: 'Onyx', description: 'مردانه و قدرتمند' },
  { value: 'nova', label: 'Nova', description: 'زنانه و پرانرژی' },
  { value: 'shimmer', label: 'Shimmer', description: 'زنانه و ملایم' },
];

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onTranscriptUpdate }) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startConversation = async () => {
    try {
      // Initialize audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });

      // Connect to WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//mktsqcxbcaexyxmenafp.supabase.co/functions/v1/realtime-voice`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = async () => {
        console.log('Connected to voice service');
        setIsConnected(true);
        
        // Send voice preference
        wsRef.current?.send(JSON.stringify({
          type: 'config',
          voice: selectedVoice
        }));
        
        // Start recording
        recorderRef.current = new AudioRecorder((audioData) => {
          if (!isMuted && wsRef.current?.readyState === WebSocket.OPEN) {
            const base64Audio = encodeAudioForAPI(audioData);
            wsRef.current.send(JSON.stringify({
              type: 'input_audio_buffer.append',
              audio: base64Audio
            }));
          }
        });
        
        await recorderRef.current.start();
        
        toast({
          title: "✅ تماس برقرار شد",
          description: "می‌توانید با AI صحبت کنید",
        });
      };

      wsRef.current.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received event:', data.type);

          switch (data.type) {
            case 'response.audio.delta':
              setIsAISpeaking(true);
              const binaryString = atob(data.delta);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              if (audioContextRef.current) {
                await playAudioData(audioContextRef.current, bytes);
              }
              break;

            case 'response.audio.done':
              setIsAISpeaking(false);
              break;

            case 'conversation.item.input_audio_transcription.completed':
              if (data.transcript) {
                setCurrentTranscript(data.transcript);
                onTranscriptUpdate?.(data.transcript);
              }
              break;

            case 'response.audio_transcript.delta':
              setCurrentTranscript(prev => prev + data.delta);
              break;

            case 'response.audio_transcript.done':
              if (data.transcript) {
                onTranscriptUpdate?.(data.transcript);
              }
              break;

            case 'error':
              console.error('Voice service error:', data);
              toast({
                title: "خطا",
                description: data.error || "خطا در ارتباط با سرویس صوتی",
                variant: "destructive",
              });
              break;
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast({
          title: "خطا در اتصال",
          description: "لطفاً دوباره تلاش کنید",
          variant: "destructive",
        });
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        setIsAISpeaking(false);
      };

    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "خطا",
        description: error instanceof Error ? error.message : 'خطا در شروع تماس',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    recorderRef.current?.stop();
    wsRef.current?.close();
    clearAudioQueue();
    setIsConnected(false);
    setIsAISpeaking(false);
    setCurrentTranscript('');
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    toast({
      title: "تماس قطع شد",
      description: "تماس با موفقیت پایان یافت",
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "میکروفون روشن شد" : "میکروفون خاموش شد",
      description: isMuted ? "AI صدای شما را می‌شنود" : "AI صدای شما را نمی‌شنود",
    });
  };

  useEffect(() => {
    return () => {
      recorderRef.current?.stop();
      wsRef.current?.close();
      clearAudioQueue();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div 
      className={`fixed z-50 flex flex-col gap-3 ${
        isMobile 
          ? 'bottom-20 left-4 right-4 items-stretch' 
          : 'bottom-6 right-6 items-end'
      }`}
    >
      <AnimatePresence>
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`bg-gradient-to-br from-card via-card/98 to-card/95 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-primary/20 ${
              isMobile ? 'w-full' : 'w-[320px]'
            }`}
          >
            <div className="flex flex-col gap-4">
              {/* Status Indicator */}
              <div className="flex items-center gap-3 px-1">
                <motion.div
                  animate={{
                    scale: isAISpeaking ? [1, 1.4, 1] : 1,
                    opacity: isAISpeaking ? [1, 0.6, 1] : 1,
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: isAISpeaking ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  className={`w-3 h-3 rounded-full ${
                    isAISpeaking 
                      ? 'bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/60' 
                      : 'bg-muted-foreground/40'
                  }`}
                />
                <span className="text-sm font-semibold text-foreground">
                  {isAISpeaking ? '🎙️ AI در حال صحبت است...' : '👂 در حال گوش دادن...'}
                </span>
              </div>

              {/* Transcript Display */}
              {currentTranscript && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gradient-to-br from-muted/60 to-muted/40 rounded-2xl p-4 border border-border/50 shadow-inner"
                >
                  <p className="text-sm text-foreground/90 leading-relaxed line-clamp-4 text-right">
                    {currentTranscript}
                  </p>
                </motion.div>
              )}

              {/* Mute Button */}
              <Button
                onClick={toggleMute}
                variant="outline"
                size={isMobile ? "default" : "sm"}
                className="gap-2 hover:bg-primary/10 hover:border-primary/60 transition-all duration-300 rounded-xl"
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span className="text-sm font-medium">
                  {isMuted ? 'روشن کردن میکروفون' : 'خاموش کردن میکروفون'}
                </span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Selector - Only show when not connected */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-card/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-border/50 ${
            isMobile ? 'w-full' : 'w-[320px]'
          }`}
        >
          <label className="text-sm font-semibold text-foreground mb-2 block text-right">
            انتخاب صدای AI:
          </label>
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger className="w-full rounded-xl bg-background/50 border-border/60 hover:border-primary/40 transition-all">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {VOICES.map((voice) => (
                <SelectItem 
                  key={voice.value} 
                  value={voice.value}
                  className="rounded-lg"
                >
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-medium">{voice.label}</span>
                    <span className="text-xs text-muted-foreground">{voice.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {/* Main Call Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={isMobile ? 'w-full' : 'self-end'}
      >
        {!isConnected ? (
          <Button
            onClick={startConversation}
            size={isMobile ? "lg" : "default"}
            className={`gap-3 bg-gradient-to-br from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/85 hover:to-primary/70 shadow-xl hover:shadow-2xl shadow-primary/40 hover:shadow-primary/50 border border-primary/30 transition-all duration-300 group rounded-2xl font-semibold ${
              isMobile ? 'w-full h-14 text-base' : 'h-12 px-6'
            }`}
          >
            <PhoneCall className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:rotate-6" />
            <span>شروع تماس صوتی</span>
          </Button>
        ) : (
          <Button
            onClick={endConversation}
            size={isMobile ? "lg" : "default"}
            variant="destructive"
            className={`gap-3 shadow-xl hover:shadow-2xl shadow-destructive/40 hover:shadow-destructive/50 border border-destructive/30 transition-all duration-300 group rounded-2xl font-semibold ${
              isMobile ? 'w-full h-14 text-base' : 'h-12 px-6'
            }`}
          >
            <PhoneOff className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:-rotate-6" />
            <span>قطع تماس</span>
          </Button>
        )}
      </motion.div>
    </div>
  );
};

export default VoiceInterface;
