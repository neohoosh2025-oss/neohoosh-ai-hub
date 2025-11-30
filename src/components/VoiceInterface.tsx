import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Phone, PhoneOff, Mic, MicOff, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioRecorder, encodeAudioForAPI, playAudioData, clearAudioQueue } from '@/utils/RealtimeAudio';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';

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
  const [callDuration, setCallDuration] = useState(0);
  
  const wsRef = useRef<WebSocket | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const durationIntervalRef = useRef<number | null>(null);
  
  const { isRecording, startRecording, stopRecording } = useVoiceRecording();

  const startConversation = async () => {
    try {
      // Initialize audio context
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });

      // Start recording for saving
      await startRecording(selectedVoice);

      // Connect to WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//mktsqcxbcaexyxmenafp.supabase.co/functions/v1/realtime-voice`;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = async () => {
        console.log('Connected to voice service');
        setIsConnected(true);
        setCallDuration(0);
        
        // Send voice preference
        wsRef.current?.send(JSON.stringify({
          type: 'config',
          voice: selectedVoice
        }));
        
        // Start recording for streaming
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
        
        // Start duration counter
        durationIntervalRef.current = window.setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
        
        toast({
          title: "✅ تماس برقرار شد",
          description: "می‌توانید با AI صحبت کنید",
        });
      };

      wsRef.current.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);

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

  const endConversation = async () => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    recorderRef.current?.stop();
    wsRef.current?.close();
    clearAudioQueue();
    
    // Stop and save recording
    await stopRecording(currentTranscript);
    
    setIsConnected(false);
    setIsAISpeaking(false);
    setCurrentTranscript('');
    setCallDuration(0);
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    toast({
      title: "✅ تماس پایان یافت",
      description: "تماس با موفقیت ذخیره شد",
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast({
      title: isMuted ? "🎤 میکروفون روشن شد" : "🔇 میکروفون خاموش شد",
      description: isMuted ? "AI صدای شما را می‌شنود" : "AI صدای شما را نمی‌شنود",
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      recorderRef.current?.stop();
      wsRef.current?.close();
      clearAudioQueue();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div className={`fixed z-50 ${isMobile ? 'inset-x-4 bottom-20' : 'bottom-8 right-8'}`}>
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-gradient-to-br from-card/95 via-card/98 to-card backdrop-blur-xl rounded-3xl shadow-2xl border border-primary/20"
            >
              <div className="p-6 space-y-4">
                {/* Status Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{
                        scale: isAISpeaking ? [1, 1.2, 1] : 1,
                        opacity: isAISpeaking ? [1, 0.7, 1] : 1,
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: isAISpeaking ? Infinity : 0,
                        ease: "easeInOut"
                      }}
                    >
                      <Radio className={`w-5 h-5 ${isAISpeaking ? 'text-primary' : 'text-muted-foreground'}`} />
                    </motion.div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {isAISpeaking ? 'AI در حال صحبت...' : 'در حال گوش دادن...'}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDuration(callDuration)}</p>
                    </div>
                  </div>
                  {isRecording && (
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="flex items-center gap-2 text-xs text-destructive"
                    >
                      <div className="w-2 h-2 rounded-full bg-destructive" />
                      <span>در حال ضبط</span>
                    </motion.div>
                  )}
                </div>

                {/* Transcript Display */}
                {currentTranscript && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-gradient-to-br from-muted/60 to-muted/40 rounded-2xl p-4 border border-border/50"
                  >
                    <p className="text-sm text-foreground/90 leading-relaxed line-clamp-3 text-right">
                      {currentTranscript}
                    </p>
                  </motion.div>
                )}

                {/* Mute Button */}
                <Button
                  onClick={toggleMute}
                  variant="outline"
                  className="w-full gap-3 hover:bg-primary/10 hover:border-primary/60 transition-all duration-300 rounded-xl h-11"
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

        {/* Voice Selector */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border border-border/50"
          >
            <label className="text-sm font-semibold text-foreground mb-2 block text-right">
              انتخاب صدای AI:
            </label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger className="w-full rounded-xl bg-background/50 border-border/60 hover:border-primary/40 transition-all h-11">
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
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {!isConnected ? (
            <Button
              onClick={startConversation}
              size="lg"
              className="w-full h-14 gap-3 bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/85 hover:to-primary/70 shadow-xl hover:shadow-2xl shadow-primary/40 hover:shadow-primary/50 border border-primary/30 transition-all duration-300 group rounded-2xl font-semibold text-base"
            >
              <Phone className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:rotate-12" />
              <span>شروع تماس صوتی</span>
            </Button>
          ) : (
            <Button
              onClick={endConversation}
              size="lg"
              variant="destructive"
              className="w-full h-14 gap-3 shadow-xl hover:shadow-2xl shadow-destructive/40 hover:shadow-destructive/50 border border-destructive/30 transition-all duration-300 group rounded-2xl font-semibold text-base"
            >
              <PhoneOff className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:-rotate-12" />
              <span>قطع تماس و ذخیره</span>
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default VoiceInterface;
