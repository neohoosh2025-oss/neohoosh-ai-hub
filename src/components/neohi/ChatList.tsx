import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Users, Radio } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Chat {
  id: string;
  type: string;
  name: string | null;
  avatar_url: string | null;
  last_message_at: string | null;
  unread_count?: number;
  last_message?: {
    content: string;
    sender_name: string;
  };
  members?: any[];
}

interface ChatListProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

export function ChatList({ selectedChatId, onSelectChat, onNewChat }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
    subscribeToChats();
  }, []);

  const loadChats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user's chats
    const { data: chatMembers } = await supabase
      .from("neohi_chat_members")
      .select(`
        chat_id,
        chats:neohi_chats(*)
      `)
      .eq("user_id", user.id);

    if (chatMembers) {
      const chatsData = chatMembers
        .map((cm: any) => cm.chats)
        .filter(Boolean)
        .sort((a: any, b: any) => {
          const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
          const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
          return bTime - aTime;
        });

      setChats(chatsData);
    }
    setLoading(false);
  };

  const subscribeToChats = () => {
    const channel = supabase
      .channel("chat-list-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "neohi_chats",
        },
        () => {
          loadChats();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "neohi_messages",
        },
        () => {
          loadChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getChatName = (chat: Chat) => {
    if (chat.name) return chat.name;
    if (chat.type === "dm") return "گفتگوی خصوصی";
    if (chat.type === "group") return "گروه";
    if (chat.type === "channel") return "کانال";
    return "چت";
  };

  const getChatIcon = (type: string) => {
    if (type === "channel") return <Radio className="h-4 w-4" />;
    if (type === "group") return <Users className="h-4 w-4" />;
    return null;
  };

  const filteredChats = chats.filter((chat) =>
    getChatName(chat).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-3 border-b border-border space-y-2 shrink-0">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجوی چت..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
        <Button onClick={onNewChat} className="w-full gap-2" size="sm">
          <Plus className="h-4 w-4" />
          گفتگوی جدید
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border/50">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              در حال بارگذاری...
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              هیچ گفتگویی یافت نشد
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full p-3 flex items-start gap-3 hover:bg-accent/50 transition-colors ${
                  selectedChatId === chat.id ? "bg-accent" : ""
                }`}
              >
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={chat.avatar_url || undefined} />
                  <AvatarFallback>
                    {getChatName(chat).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-right">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold truncate flex items-center gap-1.5">
                      {getChatIcon(chat.type)}
                      {getChatName(chat)}
                    </h3>
                    {chat.last_message_at && (
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(chat.last_message_at), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.last_message?.content || "هنوز پیامی ارسال نشده"}
                  </p>
                </div>
                {chat.unread_count && chat.unread_count > 0 && (
                  <div className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs shrink-0">
                    {chat.unread_count}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
