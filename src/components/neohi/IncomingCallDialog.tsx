import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, PhoneOff, Video } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { CallScreen } from "./CallScreen";

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

  useEffect(() => {
    let channel: any;

    const setupListener = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel("incoming-calls")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "neohi_calls",
            filter: `callee_id=eq.${user.id}`,
          },
          async (payload: any) => {
            if (payload.new.status === "ringing") {
              // Get caller info
              const { data: caller } = await supabase
                .from("neohi_users")
                .select("id, display_name, avatar_url")
                .eq("id", payload.new.caller_id)
                .single();

              if (caller) {
                setIncomingCall({
                  id: payload.new.id,
                  call_type: payload.new.call_type,
                  caller,
                });
              }
            }
          }
        )
        .subscribe();
    };

    setupListener();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const handleAccept = () => {
    if (incomingCall) {
      setActiveCall(incomingCall);
      setIncomingCall(null);
    }
  };

  const handleDecline = async () => {
    if (incomingCall) {
      await supabase
        .from("neohi_calls" as any)
        .update({ status: "declined", ended_at: new Date().toISOString() } as any)
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