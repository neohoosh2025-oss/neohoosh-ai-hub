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
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ backgroundColor: "hsl(var(--neohi-bg-hover))" }}
        onClick={() => onChatSelect(chat.id)}
        className={cn(
          "w-full px-4 py-3 flex items-start gap-3 transition-colors relative",
          "border-b border-neohi-border",
          isSelected && "bg-neohi-accent-light"
        )}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neohi-accent to-primary flex items-center justify-center overflow-hidden">
            {chat.avatar_url ? (
              <img src={chat.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <MessageCircle className="w-6 h-6 text-white" />
            )}
          </div>
          {chat.is_online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-neohi-online border-2 border-neohi-bg-sidebar rounded-full" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between mb-1">
            <h3 className={cn(
              "font-medium text-sm truncate",
              hasUnread 
                ? "text-neohi-text-primary font-semibold" 
                : "text-neohi-text-primary"
            )}>
              {chat.name || "Unknown"}
            </h3>
            <span className="text-xs text-neohi-text-secondary ml-2 flex-shrink-0">
              {getTimeDisplay(chat.last_message_at)}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <p className={cn(
              "text-xs truncate",
              hasUnread
                ? "text-neohi-text-primary font-medium"
                : "text-neohi-text-secondary"
            )}>
              {chat.last_message?.content || "No messages yet"}
            </p>
            {hasUnread && (
              <div className="ml-2 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
            )}
          </div>
        </div>
      </motion.button>
    );
  };

  return (
    <div className="h-full w-full md:w-80 lg:w-96 bg-neohi-bg-sidebar flex flex-col border-l border-neohi-border">
      {/* Header */}
      <div className="p-4 border-b border-neohi-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neohi-accent to-primary flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-neohi-text-primary">NeoHi</h1>
          </div>
          
          <div className="flex items-center gap-1">
            <Link to="/">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-xl hover:bg-neohi-bg-hover text-neohi-accent"
              >
                <Home className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewChat}
              className="h-9 w-9 rounded-xl hover:bg-neohi-bg-hover text-neohi-accent"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neohi-text-secondary" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-neohi-bg-hover border-none text-neohi-text-primary placeholder:text-neohi-text-muted h-10 rounded-xl"
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
              <MessageCircle className="h-16 w-16 text-neohi-text-muted mb-4" />
              <p className="text-neohi-text-secondary text-sm">
                {searchQuery ? "No chats found" : "No chats yet"}
              </p>
              <p className="text-neohi-text-muted text-xs mt-1">
                Click + to start a conversation
              </p>
            </motion.div>
          ) : (
            <div key="chats">
              {pinnedChats.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-neohi-text-muted uppercase tracking-wider">
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
                    <div className="px-4 py-2 text-xs font-medium text-neohi-text-muted uppercase tracking-wider">
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

      {/* Bottom Navigation - Contacts & Settings */}
      <div className="p-3 border-t border-neohi-border">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate("/neohi?tab=contacts")}
            variant="ghost"
            className="justify-center gap-2 h-12 hover:bg-neohi-accent hover:text-white transition-all duration-300 text-neohi-text-primary rounded-xl group"
          >
            <Users className="h-5 w-5 text-neohi-accent group-hover:text-white transition-colors" />
            <span className="font-medium text-sm">Contacts</span>
          </Button>
          <Button
            onClick={() => navigate("/neohi?tab=settings")}
            variant="ghost"
            className="justify-center gap-2 h-12 hover:bg-neohi-accent hover:text-white transition-all duration-300 text-neohi-text-primary rounded-xl group"
          >
            <Settings className="h-5 w-5 text-neohi-accent group-hover:text-white transition-colors" />
            <span className="font-medium text-sm">Settings</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
