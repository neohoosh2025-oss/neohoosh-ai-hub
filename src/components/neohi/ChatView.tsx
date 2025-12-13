import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MoreVertical, Phone, Video, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { GroupInfo } from "./GroupInfo";
import { ChannelInfo } from "./ChannelInfo";
import { UserProfile } from "./UserProfile";
import { CallScreen } from "./CallScreen";
import { useNeohiCall } from "@/hooks/useNeohiCall";

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
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [otherUserData, setOtherUserData] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  
  const { activeCall, startCall, endCall } = useNeohiCall();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        await loadChatWithUser(user);
      }
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
    if (!otherUserId || chat?.type !== "dm") return;

    const userStatusChannel = supabase
      .channel(`user-status-${otherUserId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "neohi_users",
          filter: `id=eq.${otherUserId}`,
        },
        (payload) => {
          setOtherUserData((prev: any) => ({
            ...prev,
            is_online: payload.new.is_online,
            last_seen: payload.new.last_seen,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(userStatusChannel);
    };
  }, [otherUserId, chat?.type]);

  useEffect(() => {
    if (!chatId || !currentUser) return;

    const typingChannel = supabase
      .channel(`typing-${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "neohi_typing_indicators",
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload: any) => {
          if (payload.new && payload.new.user_id !== currentUser.id && payload.new.is_typing) {
            const { data: user } = await supabase
              .from("neohi_users")
              .select("display_name")
              .eq("id", payload.new.user_id)
              .single();

            if (user) {
              setTypingUsers(prev => [...new Set([...prev, user.display_name || "User"])]);
            }

            setTimeout(() => {
              setTypingUsers(prev => prev.filter(u => u !== (user?.display_name || "User")));
            }, 3000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(typingChannel);
    };
  }, [chatId, currentUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const markMessagesAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("neohi_chat_members")
      .update({ last_read_at: new Date().toISOString() })
      .eq("chat_id", chatId)
      .eq("user_id", user.id);
  };

  const loadChatWithUser = async (user: any) => {
    const { data } = await supabase
      .from("neohi_chats")
      .select("*")
      .eq("id", chatId)
      .single();
    
    if (data) {
      let chatData: any = { ...data };

      if (data.type === "dm" && user) {
        const { data: members } = await supabase
          .from("neohi_chat_members")
          .select("user_id")
          .eq("chat_id", chatId);

        const otherUid = members?.find((m: any) => m.user_id !== user.id)?.user_id;
        
        if (otherUid) {
          setOtherUserId(otherUid);
          const { data: otherUser } = await supabase
            .from("neohi_users")
            .select("*")
            .eq("id", otherUid)
            .single();

          if (otherUser) {
            setOtherUserData(otherUser);
            chatData.name = otherUser.display_name;
            chatData.avatar_url = otherUser.avatar_url;
            chatData.is_online = otherUser.is_online;
            chatData.last_seen = otherUser.last_seen;
          }
        }
      }

      setChat(chatData);
    }
  };

  const loadMessages = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("neohi_messages")
      .select(`
        *,
        sender:neohi_users(id, display_name, avatar_url)
      `)
      .eq("chat_id", chatId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });

    if (data) {
      const { data: deletions } = await supabase
        .from("neohi_message_deletions")
        .select("message_id")
        .eq("user_id", user.id);

      const deletedMessageIds = new Set(deletions?.map(d => d.message_id) || []);
      const filteredMessages = data.filter(msg => !deletedMessageIds.has(msg.id));
      setMessages(filteredMessages);
    }
    setLoading(false);
  };

  const subscribeToMessages = () => {
    const messagesChannel = supabase
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
      supabase.removeChannel(messagesChannel);
    };
  };

  const handleSendMessage = async (
    content: string,
    mediaUrl?: string,
    messageType?: string,
    replyTo?: string
  ) => {
    if (!currentUser) return;

    await supabase.from("neohi_messages").insert({
      chat_id: chatId,
      sender_id: currentUser.id,
      content,
      media_url: mediaUrl,
      message_type: messageType || "text",
      reply_to: replyTo,
    });

    await supabase
      .from("neohi_chats")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", chatId);
  };

  const getStatusText = () => {
    if (chat?.type !== "dm" || !otherUserData) return "";
    if (otherUserData.is_online) return "Online";
    if (otherUserData.last_seen) {
      const lastSeen = new Date(otherUserData.last_seen);
      const now = new Date();
      const diff = now.getTime() - lastSeen.getTime();
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      
      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return "Recently";
    }
    return "Recently";
  };

  const filteredMessages = searchQuery
    ? messages.filter(m =>
        m.content?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  if (!chat) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header - Clean Minimal */}
      <header className="h-14 flex-shrink-0 bg-background border-b border-border/50 px-3 z-10">
        <div className="h-full flex items-center justify-between gap-2">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="md:hidden h-9 w-9 rounded-full text-foreground/70 hover:text-foreground hover:bg-muted/50 flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </Button>

          {/* Chat Info */}
          <button
            onClick={() => setShowInfo(true)}
            className="flex items-center gap-3 flex-1 hover:bg-muted/30 rounded-xl px-2 py-1.5 transition-all min-w-0"
          >
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarImage src={chat.avatar_url || undefined} />
              <AvatarFallback className="bg-muted text-foreground/70 font-medium text-sm">
                {chat.name?.charAt(0)?.toUpperCase() || "C"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-left min-w-0">
              <h2 className="text-foreground font-medium text-[15px] truncate leading-tight">
                {chat.type === "dm" ? (otherUserData?.display_name || "User") : (chat.name || "Chat")}
              </h2>
              <p className="text-muted-foreground text-xs flex items-center gap-1.5 truncate leading-tight mt-0.5">
                {typingUsers.length > 0 ? (
                  <span className="text-foreground">typing...</span>
                ) : chat.type === "channel" ? (
                  "Channel"
                ) : chat.type === "group" ? (
                  "Group"
                ) : otherUserData?.is_online ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Online
                  </>
                ) : (
                  <span>{getStatusText()}</span>
                )}
              </p>
            </div>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowSearch(!showSearch)}
              className="h-9 w-9 rounded-full text-foreground/70 hover:text-foreground hover:bg-muted/50"
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Button>
            {chat.type === "dm" && otherUserId && (
              <>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => startCall(otherUserId, "voice", chatId)}
                  className="h-9 w-9 rounded-full text-foreground/70 hover:text-foreground hover:bg-muted/50"
                >
                  <Phone className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => startCall(otherUserId, "video", chatId)}
                  className="h-9 w-9 rounded-full text-foreground/70 hover:text-foreground hover:bg-muted/50"
                >
                  <Video className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-full text-foreground/70 hover:text-foreground hover:bg-muted/50 hidden md:flex"
            >
              <MoreVertical className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border/50 px-3 py-2"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="bg-muted/30 border-0 text-foreground pl-10 pr-10 h-10 rounded-xl focus-visible:ring-1 focus-visible:ring-foreground/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" strokeWidth={1.5} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative bg-muted/10">
        <MessageList 
          messages={filteredMessages} 
          loading={loading} 
          onMessageDeleted={(messageId) => {
            setMessages(prev => prev.filter(m => m.id !== messageId));
          }}
          onReply={(message) => setReplyMessage(message)}
        />
      </div>

      {/* Input Bar */}
      {(chat.type === "dm" || chat.type === "group") && (
        <div className="flex-shrink-0 border-t border-border/50 bg-background">
          <MessageInput 
            onSend={handleSendMessage}
            replyMessage={replyMessage}
            onCancelReply={() => setReplyMessage(null)}
            chatId={chatId}
          />
        </div>
      )}

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfo(false)}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed md:absolute top-0 right-0 bottom-0 w-full sm:w-[90%] md:w-80 bg-background border-l border-border/50 shadow-2xl z-50 overflow-y-auto"
            >
              {chat.type === "group" ? (
                <GroupInfo
                  chatId={chatId}
                  onClose={() => setShowInfo(false)}
                />
              ) : chat.type === "channel" ? (
                <ChannelInfo
                  chatId={chatId}
                  onClose={() => setShowInfo(false)}
                />
              ) : (
                <UserProfile
                  userId={otherUserId!}
                  onClose={() => setShowInfo(false)}
                />
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Call Screen */}
      {activeCall && (
        <CallScreen
          callId={activeCall.callId}
          callType={activeCall.callType}
          otherUser={activeCall.otherUser}
          isIncoming={false}
          onEnd={endCall}
        />
      )}
    </div>
  );
}
