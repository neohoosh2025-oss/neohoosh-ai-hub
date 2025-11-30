import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Phone, PhoneOff, Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AudioRecorder, encodeAudioForAPI, playAudioData, clearAudioQueue } from '@/utils/RealtimeAudio';

interface VoiceInterfaceProps {
  onTranscriptUpdate?: (text: string) => void;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onTranscriptUpdate }) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  
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
          title: "تماس برقرار شد",
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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-gradient-to-br from-card to-card/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-primary/20 w-[280px] mb-2"
          >
            <div className="flex flex-col gap-3">
              {/* Status Indicator */}
              <div className="flex items-center gap-2 px-2">
                <motion.div
                  animate={{
                    scale: isAISpeaking ? [1, 1.3, 1] : 1,
                    opacity: isAISpeaking ? [1, 0.7, 1] : 1,
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: isAISpeaking ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                  className={`w-2.5 h-2.5 rounded-full ${
                    isAISpeaking ? 'bg-primary shadow-lg shadow-primary/50' : 'bg-muted-foreground/50'
                  }`}
                />
                <span className="text-xs font-medium text-foreground/90">
                  {isAISpeaking ? 'AI در حال صحبت است...' : 'در حال گوش دادن...'}
                </span>
              </div>

              {/* Transcript Display */}
              {currentTranscript && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-muted/40 rounded-lg p-3 border border-border/50"
                >
                  <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3 text-right">
                    {currentTranscript}
                  </p>
                </motion.div>
              )}

              {/* Mute Button */}
              <Button
                onClick={toggleMute}
                variant="outline"
                size="sm"
                className="gap-2 h-9 hover:bg-primary/10 hover:border-primary/50 transition-all"
              >
                {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span className="text-xs">
                  {isMuted ? 'روشن کردن میکروفون' : 'خاموش کردن میکروفون'}
                </span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {!isConnected ? (
          <Button
            onClick={startConversation}
            size="lg"
            className="rounded-full w-14 h-14 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl hover:shadow-2xl shadow-primary/30 hover:shadow-primary/40 border border-primary/20 transition-all duration-300 group"
          >
            <Phone className="w-5 h-5 transition-transform group-hover:rotate-12" />
          </Button>
        ) : (
          <Button
            onClick={endConversation}
            size="lg"
            variant="destructive"
            className="rounded-full w-14 h-14 shadow-xl hover:shadow-2xl shadow-destructive/30 hover:shadow-destructive/40 border border-destructive/20 transition-all duration-300 group"
          >
            <PhoneOff className="w-5 h-5 transition-transform group-hover:rotate-12" />
          </Button>
        )}
      </motion.div>
    </div>
  );
};

export default VoiceInterface;
