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
    <div className="h-screen flex flex-col bg-neohi-bg-chat">
      {/* Header - Fixed Top Bar (Telegram Style) */}
      <header className="h-[60px] flex-shrink-0 bg-neohi-bg-sidebar/95 backdrop-blur-lg border-b border-neohi-border px-3 z-10">
        <div className="h-full flex items-center justify-between gap-2">
          {/* Back Button - Mobile Only */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden h-9 w-9 rounded-full hover:bg-neohi-bg-hover text-neohi-text-primary flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Chat Info - Clickable */}
          <button
            onClick={() => setShowInfo(true)}
            className="flex items-center gap-2.5 flex-1 hover:bg-neohi-bg-hover rounded-lg px-2 py-1.5 transition-all min-w-0"
          >
            <Avatar className="h-10 w-10 ring-1 ring-neohi-border flex-shrink-0">
              <AvatarImage src={chat.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-neohi-accent to-blue-600 text-white font-semibold text-sm">
                {chat.name?.charAt(0)?.toUpperCase() || "C"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-left min-w-0">
              <h2 className="text-neohi-text-primary font-semibold text-[15px] truncate leading-tight">
                {chat.name || "گفتگو"}
              </h2>
              <p className="text-neohi-text-secondary text-[13px] flex items-center gap-1.5 truncate leading-tight mt-0.5">
                {chat.type === "channel" ? (
                  "کانال"
                ) : chat.type === "group" ? (
                  "گروه"
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-neohi-online"></span>
                    آنلاین
                  </>
                )}
              </p>
            </div>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {chat.type === "dm" && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-neohi-text-secondary hover:bg-neohi-bg-hover hover:text-neohi-accent transition-all h-9 w-9 rounded-full hidden sm:flex"
                >
                  <Phone className="h-[18px] w-[18px]" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-neohi-text-secondary hover:bg-neohi-bg-hover hover:text-neohi-accent transition-all h-9 w-9 rounded-full hidden sm:flex"
                >
                  <Video className="h-[18px] w-[18px]" />
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowInfo(true)}
              className="text-neohi-text-secondary hover:bg-neohi-bg-hover hover:text-neohi-accent transition-all h-9 w-9 rounded-full"
            >
              <Info className="h-[18px] w-[18px]" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-neohi-text-secondary hover:bg-neohi-bg-hover hover:text-neohi-accent transition-all h-9 w-9 rounded-full hidden md:flex"
            >
              <MoreVertical className="h-[18px] w-[18px]" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages Area - Scrollable Container (Telegram Style) */}
      <div className="flex-1 overflow-hidden relative">
        <MessageList messages={messages} loading={loading} />
      </div>

      {/* Input Bar - Fixed at Bottom (Telegram Style) */}
      {(chat.type === "dm" || chat.type === "group") && (
        <div className="flex-shrink-0 border-t border-neohi-border bg-neohi-bg-sidebar/95 backdrop-blur-lg">
          <MessageInput onSend={handleSendMessage} />
        </div>
      )}

      {/* Info Panel - Modern Slide-in */}
      <AnimatePresence>
        {showInfo && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfo(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
            />
            
            {/* Info Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed md:absolute top-0 left-0 bottom-0 w-full sm:w-[90%] md:w-80 bg-neohi-bg-sidebar shadow-2xl z-50 overflow-y-auto safe-area-inset"
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
