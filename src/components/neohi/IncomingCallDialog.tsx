import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { CallScreen } from "./CallScreen";
import { callRingtone } from "@/utils/callRingtone";
import { showCallNotification, isAppInBackground } from "@/utils/neohiNotifications";

interface IncomingCall {
  id: string;
  call_type: "voice" | "video";
  caller: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function IncomingCallListener() {
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [activeCall, setActiveCall] = useState<IncomingCall | null>(null);

  // Start/stop ringtone based on incoming call state
  useEffect(() => {
    if (incomingCall) {
      // Start ringtone
      callRingtone.start();
      
      // Show notification if app is in background
      if (isAppInBackground()) {
        showCallNotification(
          incomingCall.caller.display_name || "کاربر",
          incomingCall.call_type,
          incomingCall.caller.avatar_url || undefined
        );
      }
    } else {
      // Stop ringtone when call is answered/declined
      callRingtone.stop();
    }

    return () => {
      callRingtone.stop();
    };
  }, [incomingCall]);

  // Check for pending incoming calls on mount
  const checkPendingCalls = useCallback(async (userId: string) => {
    console.log("Checking pending calls for user:", userId);
    
    const { data: pendingCalls, error } = await supabase
      .from("neohi_calls")
      .select("*")
      .eq("callee_id", userId)
      .eq("status", "ringing")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error checking pending calls:", error);
      return;
    }

    if (pendingCalls && pendingCalls.length > 0) {
      const call = pendingCalls[0];
      console.log("Found pending call:", call);
      
      // Get caller info
      const { data: caller } = await supabase
        .from("neohi_users")
        .select("id, display_name, avatar_url")
        .eq("id", call.caller_id)
        .single();

      if (caller) {
        setIncomingCall({
          id: call.id,
          call_type: call.call_type as "voice" | "video",
          caller,
        });
      }
    }
  }, []);

  useEffect(() => {
    let callChannel: ReturnType<typeof supabase.channel> | null = null;
    let mounted = true;

    const setupListener = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !mounted) return;

      console.log("Setting up incoming call listener for user:", user.id);

      // Check for any pending calls first
      await checkPendingCalls(user.id);

      // Subscribe to ALL call changes and filter client-side
      callChannel = supabase
        .channel(`incoming-calls-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "neohi_calls",
          },
          async (payload: any) => {
            console.log("Call event received:", payload);
            
            const callData = payload.new;
            if (!callData) return;
            
            // Handle new incoming call
            if (payload.eventType === "INSERT" && callData.callee_id === user.id && callData.status === "ringing") {
              console.log("New incoming call:", callData);
              
              // Get caller info
              const { data: caller } = await supabase
                .from("neohi_users")
                .select("id, display_name, avatar_url")
                .eq("id", callData.caller_id)
                .single();

              if (caller) {
                setIncomingCall({
                  id: callData.id,
                  call_type: callData.call_type,
                  caller,
                });
              }
            }
            
            // Handle call status updates (declined/ended)
            if (payload.eventType === "UPDATE") {
              if (callData.status === "declined" || callData.status === "ended" || callData.status === "missed") {
                setIncomingCall(prev => prev?.id === callData.id ? null : prev);
                setActiveCall(prev => prev?.id === callData.id ? null : prev);
              }
            }
          }
        )
        .subscribe((status) => {
          console.log("Call channel subscription status:", status);
        });
    };

    setupListener();

    return () => {
      mounted = false;
      if (callChannel) {
        console.log("Removing call channel");
        supabase.removeChannel(callChannel);
      }
    };
  }, [checkPendingCalls]);

  const handleAccept = async () => {
    if (incomingCall) {
      console.log("Accepting call:", incomingCall.id);
      
      // Stop ringtone
      callRingtone.stop();
      
      // Update call status to connected
      await supabase
        .from("neohi_calls")
        .update({ status: "connected", started_at: new Date().toISOString() })
        .eq("id", incomingCall.id);
      
      setActiveCall(incomingCall);
      setIncomingCall(null);
    }
  };

  const handleDecline = async () => {
    if (incomingCall) {
      console.log("Declining call:", incomingCall.id);
      
      // Stop ringtone
      callRingtone.stop();
      
      await supabase
        .from("neohi_calls")
        .update({ status: "declined", ended_at: new Date().toISOString() })
        .eq("id", incomingCall.id);
      setIncomingCall(null);
    }
  };

  return (
    <>
      {/* Incoming Call Dialog */}
      <AnimatePresence>
        {incomingCall && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 z-[100] bg-neutral-900 rounded-2xl p-4 shadow-2xl safe-area-top"
          >
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14">
                <AvatarImage src={incomingCall.caller.avatar_url || undefined} />
                <AvatarFallback className="bg-neutral-700 text-white text-xl">
                  {incomingCall.caller.display_name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">
                  {incomingCall.caller.display_name || "کاربر"}
                </h3>
                <p className="text-neutral-400 text-sm">
                  {incomingCall.call_type === "video" ? "تماس تصویری" : "تماس صوتی"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDecline}
                  className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center"
                >
                  <PhoneOff className="w-5 h-5 text-white" />
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAccept}
                  className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center"
                >
                  {incomingCall.call_type === "video" ? (
                    <Video className="w-5 h-5 text-white" />
                  ) : (
                    <Phone className="w-5 h-5 text-white" />
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Call Screen */}
      <AnimatePresence>
        {activeCall && (
          <CallScreen
            callId={activeCall.id}
            callType={activeCall.call_type}
            isIncoming={true}
            otherUser={activeCall.caller}
            onEnd={() => setActiveCall(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
