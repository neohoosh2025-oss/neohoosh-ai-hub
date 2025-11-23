import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MoreVertical, Phone, Video, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { GroupInfo } from "./GroupInfo";
import { ChannelInfo } from "./ChannelInfo";

interface Message {
  id: string;
  content: string | null;
  created_at: string;
  sender_id: string;
  message_type: string | null;
  media_url: string | null;
  sender?: {
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface ChatViewProps {
  chatId: string;
  onBack: () => void;
}

export function ChatView({ chatId, onBack }: ChatViewProps) {
  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCurrentUser();
    loadChat();
    loadMessages();
    const cleanup = subscribeToMessages();
    return cleanup;
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUser(user);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const loadChat = async () => {
    const { data } = await supabase
      .from("neohi_chats")
      .select("*")
      .eq("id", chatId)
      .single();
    
    if (data) setChat(data);
  };

  const loadMessages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("neohi_messages")
      .select(`
        *,
        sender:neohi_users(id, display_name, avatar_url)
      `)
      .eq("chat_id", chatId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });

    if (data) setMessages(data);
    setLoading(false);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "neohi_messages",
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          const { data: sender } = await supabase
            .from("neohi_users")
            .select("display_name, avatar_url")
            .eq("id", payload.new.sender_id)
            .single();

          setMessages((prev) => [
            ...prev,
            {
              ...payload.new,
              sender: sender || { display_name: "Unknown", avatar_url: null },
            } as Message,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (content: string, mediaUrl?: string, messageType?: string) => {
    if (!currentUser) return;

    await supabase.from("neohi_messages").insert({
      chat_id: chatId,
      sender_id: currentUser.id,
      content,
      media_url: mediaUrl,
      message_type: messageType || "text",
    });

    await supabase
      .from("neohi_chats")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", chatId);
  };

  if (!chat) {
    return (
      <div className="h-screen bg-[hsl(var(--neohi-bg-main))] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-3 border-[hsl(var(--neohi-accent))] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[hsl(var(--neohi-bg-chat))] flex flex-col overflow-hidden relative" dir="ltr">
      {/* Header */}
      <header className="bg-[hsl(var(--neohi-bg-sidebar))] border-b border-[hsl(var(--neohi-border))] px-4 py-3 backdrop-blur-md z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-[hsl(var(--neohi-accent))] hover:bg-[hsl(var(--neohi-bg-chat))] transition-all"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <Avatar className="h-10 w-10 ring-2 ring-[hsl(var(--neohi-border))] cursor-pointer" onClick={() => setShowInfo(true)}>
              <AvatarImage src={chat.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--neohi-accent))] to-primary text-white font-semibold">
                {chat.name?.charAt(0)?.toUpperCase() || "C"}
              </AvatarFallback>
            </Avatar>

            <div className="cursor-pointer" onClick={() => setShowInfo(true)}>
              <h2 className="text-[hsl(var(--neohi-text-primary))] font-semibold text-[15px]">
                {chat.name || "Chat"}
              </h2>
              <p className="text-[hsl(var(--neohi-status-online))] text-xs flex items-center gap-1">
                {chat.type === "channel" ? (
                  "Channel"
                ) : chat.type === "group" ? (
                  "Group"
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[hsl(var(--neohi-status-online))] animate-pulse"></span>
                    Online
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {chat.type === "dm" && (
              <>
                <Button variant="ghost" size="icon" className="text-[hsl(var(--neohi-accent))] hover:bg-[hsl(var(--neohi-bg-chat))] transition-all">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-[hsl(var(--neohi-accent))] hover:bg-[hsl(var(--neohi-bg-chat))] transition-all">
                  <Video className="h-5 w-5" />
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowInfo(true)}
              className="text-[hsl(var(--neohi-accent))] hover:bg-[hsl(var(--neohi-bg-chat))] transition-all"
            >
              <Info className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-[hsl(var(--neohi-accent))] hover:bg-[hsl(var(--neohi-bg-chat))] transition-all">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <MessageList messages={messages} loading={loading} />

      {/* Message Input - Only for DM and Group, not for Channel */}
      {chat.type !== "channel" && <MessageInput onSend={handleSendMessage} />}

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <>
            {chat.type === "group" ? (
              <GroupInfo chatId={chatId} onClose={() => setShowInfo(false)} />
            ) : chat.type === "channel" ? (
              <ChannelInfo chatId={chatId} onClose={() => setShowInfo(false)} />
            ) : null}
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
