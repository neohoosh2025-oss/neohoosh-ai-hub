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
    const init = async () => {
      await getCurrentUser();
      await loadChat();
      await loadMessages();
      await markMessagesAsRead();
      const cleanup = subscribeToMessages();
      return cleanup;
    };
    
    const cleanup = init();
    return () => {
      cleanup.then(fn => fn && fn());
    };
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

  const markMessagesAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("neohi_chat_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("chat_id", chatId)
      .eq("user_id", user.id);
    
    if (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const loadChat = async () => {
    const { data } = await supabase
      .from("neohi_chats")
      .select("*")
      .eq("id", chatId)
      .single();
    
    if (data) {
      let chatData = { ...data };

      // For DMs, get the other user's info
      if (data.type === "dm" && currentUser) {
        const { data: members } = await supabase
          .from("neohi_chat_members")
          .select("user_id")
          .eq("chat_id", chatId);

        const otherUserId = members?.find((m: any) => m.user_id !== currentUser.id)?.user_id;
        
        if (otherUserId) {
          const { data: otherUser } = await supabase
            .from("neohi_users")
            .select("display_name, avatar_url")
            .eq("id", otherUserId)
            .single();

          if (otherUser) {
            chatData.name = otherUser.display_name;
            chatData.avatar_url = otherUser.avatar_url;
          }
        }
      }

      setChat(chatData);
    }
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
    <div className="h-full w-full bg-[hsl(var(--neohi-bg-chat))] flex flex-col overflow-hidden" dir="ltr">
      {/* Header - Mobile Optimized */}
      <header className="bg-[hsl(var(--neohi-bg-sidebar))] border-b border-[hsl(var(--neohi-border))] px-3 md:px-4 py-2.5 md:py-3 backdrop-blur-md z-10 sticky top-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="text-[hsl(var(--neohi-accent))] hover:bg-[hsl(var(--neohi-bg-chat))] transition-all h-9 w-9 md:h-10 md:w-10 flex-shrink-0"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <Avatar className="h-9 w-9 md:h-10 md:w-10 ring-2 ring-[hsl(var(--neohi-border))] cursor-pointer flex-shrink-0" onClick={() => setShowInfo(true)}>
              <AvatarImage src={chat.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--neohi-accent))] to-primary text-white font-semibold text-sm">
                {chat.name?.charAt(0)?.toUpperCase() || "C"}
              </AvatarFallback>
            </Avatar>

            <div className="cursor-pointer flex-1 min-w-0" onClick={() => setShowInfo(true)}>
              <h2 className="text-[hsl(var(--neohi-text-primary))] font-semibold text-sm md:text-[15px] truncate">
                {chat.name || "Chat"}
              </h2>
              <p className="text-[hsl(var(--neohi-status-online))] text-[10px] md:text-xs flex items-center gap-1 truncate">
                {chat.type === "channel" ? (
                  "Channel"
                ) : chat.type === "group" ? (
                  "Group"
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[hsl(var(--neohi-status-online))] animate-pulse"></span>
                    Online
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-0.5 md:gap-1 flex-shrink-0">
            {chat.type === "dm" && (
              <>
                <Button variant="ghost" size="icon" className="text-[hsl(var(--neohi-accent))] hover:bg-[hsl(var(--neohi-bg-chat))] transition-all h-9 w-9 md:h-10 md:w-10 hidden sm:flex">
                  <Phone className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-[hsl(var(--neohi-accent))] hover:bg-[hsl(var(--neohi-bg-chat))] transition-all h-9 w-9 md:h-10 md:w-10 hidden sm:flex">
                  <Video className="h-4 w-4 md:h-5 md:w-5" />
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowInfo(true)}
              className="text-[hsl(var(--neohi-accent))] hover:bg-[hsl(var(--neohi-bg-chat))] transition-all h-9 w-9 md:h-10 md:w-10"
            >
              <Info className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-[hsl(var(--neohi-accent))] hover:bg-[hsl(var(--neohi-bg-chat))] transition-all h-9 w-9 md:h-10 md:w-10 hidden md:flex">
              <MoreVertical className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <MessageList messages={messages} loading={loading} />

      {/* Message Input - Mobile Optimized */}
      {(chat.type === "dm" || chat.type === "group") && (
        <MessageInput onSend={handleSendMessage} />
      )}

      {/* Info Panel - Mobile Optimized with Full Screen Overlay */}
      <AnimatePresence>
        {showInfo && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfo(false)}
              className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
            />
            
            {/* Info Panel - Slide from right on mobile, side panel on desktop */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed md:absolute top-0 right-0 bottom-0 w-full sm:w-[85%] md:w-80 bg-[hsl(var(--neohi-bg-sidebar))] shadow-2xl z-50 overflow-y-auto"
            >
              {chat.type === "group" ? (
                <GroupInfo chatId={chatId} onClose={() => setShowInfo(false)} />
              ) : chat.type === "channel" ? (
                <ChannelInfo chatId={chatId} onClose={() => setShowInfo(false)} />
              ) : (
                <div className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-[hsl(var(--neohi-text-primary))]">Profile</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowInfo(false)}
                      className="h-9 w-9 rounded-xl hover:bg-[hsl(var(--neohi-bg-hover))]"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-col items-center text-center mb-6">
                    <Avatar className="h-24 w-24 mb-4 ring-4 ring-[hsl(var(--neohi-accent))]/20">
                      <AvatarImage src={chat.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--neohi-accent))] to-primary text-white text-3xl">
                        {chat.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <h4 className="text-xl font-semibold text-[hsl(var(--neohi-text-primary))] mb-1">
                      {chat.name || "User"}
                    </h4>
                    <p className="text-sm text-[hsl(var(--neohi-status-online))] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[hsl(var(--neohi-status-online))] animate-pulse"></span>
                      Online
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
