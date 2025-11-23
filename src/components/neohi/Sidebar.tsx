import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Settings, MessageCircle, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Chat {
  id: string;
  type: string;
  name: string | null;
  avatar_url: string | null;
  last_message_at: string | null;
  last_message?: {
    content: string;
    is_read: boolean;
  };
  unread_count?: number;
  is_muted?: boolean;
  is_pinned?: boolean;
  is_online?: boolean;
}

interface SidebarProps {
  chats: Chat[];
  selectedChatId: string | null;
  onChatSelect: (chatId: string) => void;
  onNewChat: () => void;
  onSettings: () => void;
}

export function Sidebar({ 
  chats, 
  selectedChatId, 
  onChatSelect, 
  onNewChat,
  onSettings 
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredChats = chats.filter((chat) =>
    (chat.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedChats = filteredChats.filter((c) => c.is_pinned);
  const regularChats = filteredChats.filter((c) => !c.is_pinned);

  const getTimeDisplay = (timestamp: string | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const ChatItem = ({ chat }: { chat: Chat }) => {
    const isSelected = selectedChatId === chat.id;
    const hasUnread = (chat.unread_count || 0) > 0;

    return (
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ backgroundColor: "hsl(var(--neohi-bg-hover))" }}
        onClick={() => onChatSelect(chat.id)}
        className={cn(
          "w-full px-4 py-3 flex items-start gap-3 transition-colors relative",
          "border-b border-[hsl(var(--neohi-border))]",
          isSelected && "bg-[hsl(var(--neohi-accent-light))]"
        )}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--neohi-accent))] to-primary flex items-center justify-center overflow-hidden">
            {chat.avatar_url ? (
              <img src={chat.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <MessageCircle className="w-6 h-6 text-white" />
            )}
          </div>
          {chat.is_online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-[hsl(var(--neohi-online))] border-2 border-[hsl(var(--neohi-bg-sidebar))] rounded-full" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between mb-1">
            <h3 className={cn(
              "font-medium text-sm truncate",
              hasUnread 
                ? "text-[hsl(var(--neohi-text-primary))] font-semibold" 
                : "text-[hsl(var(--neohi-text-primary))]"
            )}>
              {chat.name || "Unknown"}
            </h3>
            <span className="text-xs text-[hsl(var(--neohi-text-secondary))] ml-2 flex-shrink-0">
              {getTimeDisplay(chat.last_message_at)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <p className={cn(
              "text-xs truncate",
              hasUnread
                ? "text-[hsl(var(--neohi-text-primary))] font-medium"
                : "text-[hsl(var(--neohi-text-secondary))]"
            )}>
              {chat.last_message?.content || "No messages yet"}
            </p>
            {hasUnread && (
              <span className="ml-2 px-1.5 py-0.5 bg-[hsl(var(--neohi-unread))] text-white text-xs rounded-full font-medium min-w-[18px] text-center flex-shrink-0">
                {chat.unread_count}
              </span>
            )}
          </div>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="h-full w-full md:w-80 lg:w-96 bg-[hsl(var(--neohi-bg-sidebar))] flex flex-col border-r border-[hsl(var(--neohi-border))]">
      {/* Header */}
      <div className="p-4 border-b border-[hsl(var(--neohi-border))]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--neohi-accent))] to-primary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-[hsl(var(--neohi-text-primary))]">NeoHi</h1>
          </div>
          
          <div className="flex items-center gap-1">
            <Link to="/">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl hover:bg-[hsl(var(--neohi-bg-hover))] text-[hsl(var(--neohi-accent))]"
              >
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewChat}
              className="h-9 w-9 rounded-xl hover:bg-[hsl(var(--neohi-bg-hover))] text-[hsl(var(--neohi-accent))]"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onSettings}
              className="h-9 w-9 rounded-xl hover:bg-[hsl(var(--neohi-bg-hover))] text-[hsl(var(--neohi-text-secondary))]"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--neohi-text-secondary))]" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[hsl(var(--neohi-bg-hover))] border-none text-[hsl(var(--neohi-text-primary))] placeholder:text-[hsl(var(--neohi-text-muted))] h-10 rounded-xl"
          />
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1">
        <AnimatePresence mode="wait">
          {filteredChats.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full p-8 text-center"
            >
              <MessageCircle className="h-16 w-16 text-[hsl(var(--neohi-text-muted))] mb-4" />
              <p className="text-[hsl(var(--neohi-text-secondary))] text-sm">
                {searchQuery ? "No chats found" : "No chats yet"}
              </p>
              <p className="text-[hsl(var(--neohi-text-muted))] text-xs mt-1">
                Click + to start a conversation
              </p>
            </motion.div>
          ) : (
            <div key="chats">
              {pinnedChats.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-[hsl(var(--neohi-text-muted))] uppercase tracking-wider">
                    Pinned
                  </div>
                  {pinnedChats.map((chat) => (
                    <ChatItem key={chat.id} chat={chat} />
                  ))}
                </div>
              )}
              
              {regularChats.length > 0 && (
                <div>
                  {pinnedChats.length > 0 && (
                    <div className="px-4 py-2 text-xs font-medium text-[hsl(var(--neohi-text-muted))] uppercase tracking-wider">
                      All Chats
                    </div>
                  )}
                  {regularChats.map((chat) => (
                    <ChatItem key={chat.id} chat={chat} />
                  ))}
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
