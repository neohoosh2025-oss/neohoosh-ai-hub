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
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <AnimatePresence>
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-card/90 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-border/50 min-w-[300px]"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{
                      scale: isAISpeaking ? [1, 1.2, 1] : 1,
                    }}
                    transition={{
                      duration: 1,
                      repeat: isAISpeaking ? Infinity : 0,
                    }}
                    className={`w-3 h-3 rounded-full ${
                      isAISpeaking ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                  <span className="text-sm text-muted-foreground">
                    {isAISpeaking ? 'AI در حال صحبت است...' : 'در حال گوش دادن...'}
                  </span>
                </div>

                {currentTranscript && (
                  <div className="text-sm text-foreground/80 text-center max-w-[250px] line-clamp-3">
                    {currentTranscript}
                  </div>
                )}

                <Button
                  onClick={toggleMute}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  {isMuted ? 'روشن کردن میکروفون' : 'خاموش کردن میکروفون'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {!isConnected ? (
            <Button
              onClick={startConversation}
              size="lg"
              className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90 shadow-xl"
            >
              <Phone className="w-6 h-6" />
            </Button>
          ) : (
            <Button
              onClick={endConversation}
              size="lg"
              variant="destructive"
              className="rounded-full w-16 h-16 shadow-xl"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default VoiceInterface;
