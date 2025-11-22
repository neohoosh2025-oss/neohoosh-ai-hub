import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Search, RefreshCw } from "lucide-react";
import ChatListItem from "./ChatListItem";
import { ChatListSkeleton } from "./SkeletonLoader";
import { cn } from "@/lib/utils";

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
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChats();
    const cleanup = subscribeToChats();
    return cleanup;
  }, []);

  const loadChats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
    setRefreshing(false);
  };

  const handlePullToRefresh = useCallback(async () => {
    await loadChats(true);
    setPullDistance(0);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (scrollRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (scrollRef.current?.scrollTop === 0 && !refreshing) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY.current;
      
      if (distance > 0) {
        setPullDistance(Math.min(distance, 100));
      }
    }
  }, [refreshing]);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 60) {
      handlePullToRefresh();
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, handlePullToRefresh]);

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

  const filteredChats = chats.filter((chat) =>
    (chat.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Pull to Refresh Indicator */}
      <div 
        className={cn(
          "overflow-hidden transition-all duration-200 flex items-center justify-center bg-muted/30",
          pullDistance > 0 ? "opacity-100" : "opacity-0"
        )}
        style={{ height: `${pullDistance}px` }}
      >
        <RefreshCw 
          className={cn(
            "w-5 h-5 text-primary transition-transform duration-200",
            refreshing && "animate-spin",
            pullDistance > 60 && !refreshing && "rotate-180"
          )} 
        />
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-border/50 space-y-3 shrink-0">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="جستجوی چت..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-11 h-11 text-base rounded-xl"
          />
        </div>
        <Button onClick={onNewChat} className="w-full gap-2 h-11 text-base rounded-xl" size="lg">
          <Plus className="h-5 w-5" />
          گفتگوی جدید
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea 
        className="flex-1"
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {loading ? (
          <ChatListSkeleton />
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Search className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-lg font-medium">
              هیچ گفتگویی یافت نشد
            </p>
            <p className="text-muted-foreground/70 text-sm mt-2">
              برای شروع، روی دکمه "گفتگوی جدید" کلیک کنید
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filteredChats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                onDelete={() => loadChats()}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
