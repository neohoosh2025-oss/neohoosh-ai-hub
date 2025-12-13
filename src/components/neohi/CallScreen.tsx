import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, X, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface CallScreenProps {
  callId: string;
  callType: "voice" | "video";
  isIncoming: boolean;
  otherUser: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
  onEnd: () => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export function CallScreen({ callId, callType, isIncoming, otherUser, onEnd }: CallScreenProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState<"ringing" | "connecting" | "connected" | "ended">(
    isIncoming ? "ringing" : "connecting"
  );
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === "voice");
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeCall();
    subscribeToSignals();

    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (status === "connected") {
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [status]);

  const initializeCall = async () => {
    try {
      // Get media stream
      const constraints = {
        audio: true,
        video: callType === "video",
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current && callType === "video") {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // Add local tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle incoming tracks
      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
        setStatus("connected");
      };

      // Handle ICE candidates
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          const { data: { user } } = await supabase.auth.getUser();
          await supabase.from("neohi_call_signals" as any).insert({
            call_id: callId,
            sender_id: user?.id,
            signal_type: "ice-candidate",
            signal_data: event.candidate.toJSON(),
          } as any);
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "connected") {
          setStatus("connected");
          updateCallStatus("connected");
        } else if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
          handleEndCall();
        }
      };

      // If caller, create offer
      if (!isIncoming) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("neohi_call_signals" as any).insert({
          call_id: callId,
          sender_id: user?.id,
          signal_type: "offer",
          signal_data: { sdp: offer.sdp, type: offer.type },
        } as any);
      }
    } catch (error) {
      console.error("Error initializing call:", error);
      toast({
        title: "خطا",
        description: "دسترسی به میکروفون/دوربین امکان‌پذیر نیست",
        variant: "destructive",
      });
      handleEndCall();
    }
  };

  const subscribeToSignals = () => {
    const channel = supabase
      .channel(`call-signals-${callId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "neohi_call_signals",
          filter: `call_id=eq.${callId}`,
        },
        async (payload: any) => {
          const { data: { user } } = await supabase.auth.getUser();
          if (payload.new.sender_id === user?.id) return;

          const pc = peerConnectionRef.current;
          if (!pc) return;

          const signal = payload.new;

          if (signal.signal_type === "offer") {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.signal_data));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            
            await supabase.from("neohi_call_signals" as any).insert({
              call_id: callId,
              sender_id: user?.id,
              signal_type: "answer",
              signal_data: { sdp: answer.sdp, type: answer.type },
            } as any);
          } else if (signal.signal_type === "answer") {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.signal_data));
          } else if (signal.signal_type === "ice-candidate") {
            await pc.addIceCandidate(new RTCIceCandidate(signal.signal_data));
          }
        }
      )
      .subscribe();

    // Subscribe to call status changes
    const callChannel = supabase
      .channel(`call-status-${callId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "neohi_calls",
          filter: `id=eq.${callId}`,
        },
        (payload: any) => {
          if (payload.new.status === "ended" || payload.new.status === "declined") {
            cleanup();
            onEnd();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(callChannel);
    };
  };

  const updateCallStatus = async (newStatus: string) => {
    await supabase
      .from("neohi_calls" as any)
      .update({
        status: newStatus,
        ...(newStatus === "connected" ? { started_at: new Date().toISOString() } : {}),
      } as any)
      .eq("id", callId);
  };

  const handleAcceptCall = async () => {
    setStatus("connecting");
    await updateCallStatus("connected");
  };

  const handleDeclineCall = async () => {
    await supabase
      .from("neohi_calls" as any)
      .update({ status: "declined", ended_at: new Date().toISOString() } as any)
      .eq("id", callId);
    cleanup();
    onEnd();
  };

  const handleEndCall = async () => {
    await supabase
      .from("neohi_calls" as any)
      .update({
        status: "ended",
        ended_at: new Date().toISOString(),
        duration,
      } as any)
      .eq("id", callId);
    cleanup();
    onEnd();
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-neutral-900 flex flex-col"
    >
      {/* Video Background (if video call) */}
      {callType === "video" && status === "connected" && (
        <>
          {/* Remote Video - Full Screen */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Local Video - Picture in Picture */}
          <motion.div
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            className="absolute top-20 left-4 w-28 h-40 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20"
          >
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </motion.div>
        </>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        {/* User Info */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center"
        >
          {/* Avatar with pulse animation */}
          <div className="relative mb-6">
            <motion.div
              animate={status === "ringing" || status === "connecting" ? {
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.2, 0.5],
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 bg-white/20 rounded-full"
            />
            <Avatar className="w-32 h-32 ring-4 ring-white/20">
              <AvatarImage src={otherUser.avatar_url || undefined} />
              <AvatarFallback className="bg-neutral-700 text-white text-4xl">
                {otherUser.display_name?.charAt(0) || "?"}
              </AvatarFallback>
            </Avatar>
          </div>

          <h2 className="text-white text-2xl font-semibold mb-2">
            {otherUser.display_name || "کاربر"}
          </h2>
          
          <p className="text-neutral-400 text-base">
            {status === "ringing" && isIncoming && "تماس ورودی..."}
            {status === "ringing" && !isIncoming && "در حال زنگ زدن..."}
            {status === "connecting" && "در حال اتصال..."}
            {status === "connected" && formatDuration(duration)}
          </p>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="pb-12 safe-area-bottom">
        {status === "ringing" && isIncoming ? (
          // Incoming call controls
          <div className="flex items-center justify-center gap-8">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleDeclineCall}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </motion.button>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAcceptCall}
              className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg"
            >
              {callType === "video" ? (
                <Video className="w-7 h-7 text-white" />
              ) : (
                <Phone className="w-7 h-7 text-white" />
              )}
            </motion.button>
          </div>
        ) : (
          // Active call controls
          <div className="flex items-center justify-center gap-4">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleMute}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isMuted ? "bg-white text-neutral-900" : "bg-neutral-700/80 text-white"
              }`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </motion.button>

            {callType === "video" && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleVideo}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                  isVideoOff ? "bg-white text-neutral-900" : "bg-neutral-700/80 text-white"
                }`}
              >
                {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              </motion.button>
            )}

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsSpeakerOn(!isSpeakerOn)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                isSpeakerOn ? "bg-neutral-700/80 text-white" : "bg-white text-neutral-900"
              }`}
            >
              <Volume2 className="w-6 h-6" />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleEndCall}
              className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
            >
              <PhoneOff className="w-7 h-7 text-white" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}