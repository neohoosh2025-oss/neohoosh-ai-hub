import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, MessageCircle, Home, Settings, Users } from "lucide-react";
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
}

export function Sidebar({ 
  chats, 
  selectedChatId, 
  onChatSelect, 
  onNewChat
}: SidebarProps) {
  const navigate = useNavigate();
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onChatSelect(chat.id)}
        className={cn(
          "w-full px-4 py-3.5 flex items-center gap-3 transition-all duration-200 relative group",
          "hover:bg-neohi-bg-hover active:bg-neohi-bg-chat",
          isSelected && "bg-neohi-accent-light border-r-2 border-neohi-accent"
        )}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center overflow-hidden transition-transform duration-200 group-hover:scale-105",
            chat.avatar_url ? "bg-neohi-bg-hover" : "bg-gradient-to-br from-neohi-accent to-blue-600"
          )}>
            {chat.avatar_url ? (
              <img src={chat.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <MessageCircle className="w-6 h-6 text-white" />
            )}
          </div>
          {chat.is_online && (
            <div className="absolute bottom-0.5 left-0.5 w-3.5 h-3.5 bg-neohi-online border-2 border-neohi-bg-sidebar rounded-full" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-right">
          <div className="flex items-center justify-between mb-1">
            <h3 className={cn(
              "font-semibold text-base truncate",
              hasUnread 
                ? "text-neohi-text-primary" 
                : "text-neohi-text-primary"
            )}>
              {chat.name || "ناشناس"}
            </h3>
            <span className="text-xs text-neohi-text-muted mr-2 flex-shrink-0">
              {getTimeDisplay(chat.last_message_at)}
            </span>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <p className={cn(
              "text-sm truncate flex-1",
              hasUnread
                ? "text-neohi-text-primary font-medium"
                : "text-neohi-text-secondary"
            )}>
              {chat.last_message?.content || "هنوز پیامی نیست"}
            </p>
            {hasUnread && (
              <div className="mr-2 w-2 h-2 bg-neohi-accent rounded-full flex-shrink-0" />
            )}
          </div>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="h-full w-full md:w-80 lg:w-96 bg-neohi-bg-sidebar flex flex-col border-l border-neohi-border">
      {/* Header - Clean & Modern */}
      <div className="px-4 pt-5 pb-4 border-b border-neohi-border bg-neohi-bg-sidebar sticky top-0 z-10 safe-area-top">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-neohi-text-primary">پیام‌ها</h1>
          
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-neohi-bg-hover text-neohi-text-secondary transition-all"
              >
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewChat}
              className="h-10 w-10 rounded-full bg-neohi-accent text-white hover:bg-neohi-accent-hover transition-all shadow-md"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neohi-text-muted" />
          <Input
            placeholder="جستجو..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 bg-neohi-bg-hover border-transparent text-neohi-text-primary placeholder:text-neohi-text-muted h-11 rounded-full text-sm focus:bg-neohi-bg-chat focus:border-neohi-accent transition-all"
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
              className="flex flex-col items-center justify-center h-64 p-6 text-center"
            >
              <MessageCircle className="h-16 w-16 text-neohi-text-muted mb-4 opacity-50" />
              <p className="text-neohi-text-secondary text-base font-medium">
                {searchQuery ? "چتی پیدا نشد" : "هنوز چتی ندارید"}
              </p>
              <p className="text-neohi-text-muted text-sm mt-2">
                برای شروع گفتگو روی + کلیک کنید
              </p>
            </motion.div>
          ) : (
            <div key="chats" className="pb-20 md:pb-4">
              {pinnedChats.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-neohi-text-muted uppercase tracking-wider bg-neohi-bg-sidebar sticky top-0">
                    سنجاق‌شده
                  </div>
                  {pinnedChats.map((chat) => (
                    <ChatItem key={chat.id} chat={chat} />
                  ))}
                </div>
              )}
              
              {regularChats.length > 0 && (
                <div>
                  {pinnedChats.length > 0 && (
                    <div className="px-4 py-2 text-xs font-semibold text-neohi-text-muted uppercase tracking-wider bg-neohi-bg-sidebar sticky top-0">
                      همه چت‌ها
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

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-neohi-border bg-neohi-bg-sidebar safe-area-bottom">
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => navigate("/neohi?tab=contacts")}
            variant="ghost"
            className="justify-center gap-2 h-12 hover:bg-neohi-accent hover:text-white transition-all duration-200 text-neohi-text-primary rounded-xl group"
          >
            <Users className="h-5 w-5 text-neohi-accent group-hover:text-white transition-colors" />
            <span className="font-medium text-sm">مخاطبین</span>
          </Button>
          <Button
            onClick={() => navigate("/neohi?tab=settings")}
            variant="ghost"
            className="justify-center gap-2 h-12 hover:bg-neohi-accent hover:text-white transition-all duration-200 text-neohi-text-primary rounded-xl group"
          >
            <Settings className="h-5 w-5 text-neohi-accent group-hover:text-white transition-colors" />
            <span className="font-medium text-sm">تنظیمات</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
