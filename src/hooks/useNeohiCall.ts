import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface CallUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

export function useNeohiCall() {
  const { toast } = useToast();
  const [activeCall, setActiveCall] = useState<{
    callId: string;
    callType: "voice" | "video";
    otherUser: CallUser;
  } | null>(null);

  const startCall = async (
    calleeId: string,
    callType: "voice" | "video",
    chatId?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "خطا",
          description: "برای تماس باید وارد شوید",
          variant: "destructive",
        });
        return;
      }

      // Get callee info
      const { data: callee } = await supabase
        .from("neohi_users")
        .select("id, display_name, avatar_url")
        .eq("id", calleeId)
        .single();

      if (!callee) {
        toast({
          title: "خطا",
          description: "کاربر یافت نشد",
          variant: "destructive",
        });
        return;
      }

      // Create call record
      const { data: call, error } = await supabase
        .from("neohi_calls" as any)
        .insert({
          caller_id: user.id,
          callee_id: calleeId,
          call_type: callType,
          chat_id: chatId,
          status: "ringing",
        } as any)
        .select()
        .single();

      if (error) throw error;

      const callData = call as any;
      setActiveCall({
        callId: callData.id,
        callType,
        otherUser: callee,
      });

      return callData.id;
    } catch (error) {
      console.error("Error starting call:", error);
      toast({
        title: "خطا",
        description: "خطا در برقراری تماس",
        variant: "destructive",
      });
    }
  };

  const endCall = () => {
    setActiveCall(null);
  };

  return {
    activeCall,
    startCall,
    endCall,
  };
}