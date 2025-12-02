import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Phone, PhoneOff, Mic, MicOff, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

interface VoiceInterfaceProps {
  onTranscriptUpdate?: (text: string) => void;
}

const VOICES = [
  { value: 'alloy', label: 'Alloy', description: 'متعادل و حرفه‌ای' },
  { value: 'echo', label: 'Echo', description: 'مردانه و صمیمی' },
  { value: 'shimmer', label: 'Shimmer', description: 'زنانه و ملایم' },
  { value: 'ash', label: 'Ash', description: 'مردانه و آرام' },
  { value: 'coral', label: 'Coral', description: 'زنانه و گرم' },
  { value: 'sage', label: 'Sage', description: 'طبیعی و دوستانه' },
];

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onTranscriptUpdate }) => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [callDuration, setCallDuration] = useState(0);
  
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<number | null>(null);

  const startConversation = async () => {
    setIsConnecting(true);
    
    try {
      // Get ephemeral token from our edge function
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
      console.log('🎤 Added local audio track');

      // Set up data channel for events
      dcRef.current = pcRef.current.createDataChannel('oai-events');
      
      dcRef.current.addEventListener('open', () => {
        console.log('📡 Data channel open');
      });

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
                setCurrentTranscript(event.transcript);
                onTranscriptUpdate?.(event.transcript);
              }
              break;
            case 'response.audio_transcript.delta':
              setCurrentTranscript(prev => prev + (event.delta || ''));
              break;
            case 'response.audio_transcript.done':
              if (event.transcript) {
                onTranscriptUpdate?.(event.transcript);
              }
              break;
            case 'error':
              console.error('❌ OpenAI error:', event);
              toast({
                title: "خطا",
                description: event.error?.message || "خطا در ارتباط",
                variant: "destructive",
              });
              break;
          }
        } catch (error) {
          console.error('Error parsing event:', error);
        }
      });

      // Create and set local description
      const offer = await pcRef.current.createOffer();
      await pcRef.current.setLocalDescription(offer);
      console.log('📝 Created offer');

      // Connect to OpenAI's Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        console.error('SDP response error:', sdpResponse.status, errorText);
        throw new Error('Failed to establish connection');
      }

      const answerSdp = await sdpResponse.text();
      const answer = {
        type: "answer" as RTCSdpType,
        sdp: answerSdp,
      };
      
      await pcRef.current.setRemoteDescription(answer);
      console.log('✅ WebRTC connection established');

      setIsConnected(true);
      setCallDuration(0);
      
      // Start duration counter
      durationIntervalRef.current = window.setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      toast({
        title: "✅ تماس برقرار شد",
        description: "می‌توانید با AI صحبت کنید",
      });

    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "خطا در اتصال",
        description: error instanceof Error ? error.message : 'لطفاً دوباره تلاش کنید',
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const endConversation = () => {
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
    setCurrentTranscript('');
    setCallDuration(0);

    toast({
      title: "✅ تماس پایان یافت",
    });
  };

  const toggleMute = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted;
        setIsMuted(!isMuted);
        toast({
          title: isMuted ? "🎤 میکروفون روشن شد" : "🔇 میکروفون خاموش شد",
        });
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      dcRef.current?.close();
      pcRef.current?.close();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
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
              disabled={isConnecting}
              size="lg"
              className="w-full h-14 gap-3 bg-gradient-to-r from-primary via-primary to-primary/80 hover:from-primary/90 hover:via-primary/85 hover:to-primary/70 shadow-xl hover:shadow-2xl shadow-primary/40 hover:shadow-primary/50 border border-primary/30 transition-all duration-300 group rounded-2xl font-semibold text-base disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Radio className="w-5 h-5" />
                  </motion.div>
                  <span>در حال اتصال...</span>
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                  <span>شروع تماس صوتی</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={endConversation}
              size="lg"
              variant="destructive"
              className="w-full h-14 gap-3 shadow-xl hover:shadow-2xl shadow-destructive/40 hover:shadow-destructive/50 border border-destructive/30 transition-all duration-300 group rounded-2xl font-semibold text-base"
            >
              <PhoneOff className="w-5 h-5 transition-transform group-hover:scale-110 group-hover:-rotate-12" />
              <span>قطع تماس</span>
            </Button>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default VoiceInterface;
