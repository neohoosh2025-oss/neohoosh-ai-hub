import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical,
  Check,
  CheckCheck
} from "lucide-react";
import { MessageInput } from "./MessageInput";

interface ChatViewProps {
  chatId: string;
  onBack: () => void;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  media_url: string | null;
  message_type: string;
  sender: {
    display_name: string;
    avatar_url: string | null;
  };
}

export function ChatView({ chatId, onBack }: ChatViewProps) {
  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  const getTimeDisplay = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (!chat) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-[#1c1c1d] border-b border-[#2c2c2e] px-4 py-2">
        <div className="flex items-center justify-between h-11">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-[#0a84ff] hover:bg-transparent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <Avatar className="h-9 w-9">
              <AvatarImage src={chat.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {chat.name?.charAt(0) || "C"}
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="text-white font-semibold text-[15px]">
                {chat.name || "چت"}
              </h2>
              <p className="text-gray-400 text-xs">آنلاین</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-[#0a84ff] hover:bg-transparent">
              <Phone className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-[#0a84ff] hover:bg-transparent">
              <Video className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-[#0a84ff] hover:bg-transparent">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3 pb-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">در حال بارگذاری پیام‌ها...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500 text-center">
                <p>هنوز پیامی ارسال نشده</p>
                <p className="text-sm mt-1">اولین پیام را ارسال کنید</p>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              const isOwn = message.sender_id === currentUser?.id;
              const showAvatar = !isOwn && (
                index === messages.length - 1 ||
                messages[index + 1]?.sender_id !== message.sender_id
              );

              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className="w-8 h-8 shrink-0">
                    {showAvatar && message.sender && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.sender.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                          {message.sender.display_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex flex-col max-w-[75%] ${isOwn ? "items-end" : "items-start"}`}>
                    {message.media_url && (
                      <div className="mb-1">
                        {message.message_type === "image" && (
                          <img
                            src={message.media_url}
                            alt="Shared"
                            className="rounded-2xl max-w-xs border border-[#2c2c2e]"
                          />
                        )}
                        {message.message_type === "video" && (
                          <video
                            src={message.media_url}
                            controls
                            className="rounded-2xl max-w-xs border border-[#2c2c2e]"
                          />
                        )}
                      </div>
                    )}
                    
                    {message.content && (
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwn
                            ? "bg-[#0a84ff] text-white rounded-br-md"
                            : "bg-[#2c2c2e] text-white rounded-bl-md"
                        }`}
                      >
                        <p className="text-[15px] whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                        
                        <div className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? "text-white/70" : "text-gray-400"}`}>
                          <span>{getTimeDisplay(message.created_at)}</span>
                          {isOwn && (
                            <CheckCheck className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
}
