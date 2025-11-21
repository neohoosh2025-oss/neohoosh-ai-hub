import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Info, Phone, Video } from "lucide-react";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";

interface ChatViewProps {
  chatId: string;
  onShowProfile: () => void;
}

export function ChatView({ chatId, onShowProfile }: ChatViewProps) {
  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (chatId) {
      loadChat();
      loadMessages();
      subscribeToMessages();
    }
  }, [chatId]);

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
        sender:neohi_users(id, username, display_name, avatar_url)
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
          // Fetch sender info
          const { data: sender } = await supabase
            .from("neohi_users")
            .select("*")
            .eq("id", payload.new.sender_id)
            .single();

          setMessages((prev) => [...prev, { ...payload.new, sender }]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "neohi_messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (content: string, mediaUrl?: string, messageType?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("neohi_messages").insert({
      chat_id: chatId,
      sender_id: user.id,
      content,
      media_url: mediaUrl,
      message_type: messageType || "text",
    });

    // Update chat's last_message_at
    await supabase
      .from("neohi_chats")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", chatId);
  };

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={chat.avatar_url || undefined} />
            <AvatarFallback>
              {chat.name?.charAt(0) || "C"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{chat.name || "گفتگو"}</h2>
            <p className="text-xs text-muted-foreground">
              {chat.type === "group" && "گروه"}
              {chat.type === "channel" && "کانال"}
              {chat.type === "dm" && "آنلاین"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onShowProfile}>
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <MessageList messages={messages} loading={loading} />

      {/* Message Input */}
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
}
