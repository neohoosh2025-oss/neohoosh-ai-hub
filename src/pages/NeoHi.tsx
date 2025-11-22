import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Plus, 
  Edit3, 
  MessageCircle, 
  ArrowLeft
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ChatView } from "@/components/neohi/ChatView";
import { StoryBar } from "@/components/neohi/StoryBar";
import { NewChatDialog } from "@/components/neohi/NewChatDialog";
import { ProfileSettings } from "@/components/neohi/ProfileSettings";
import { ContactsPage } from "@/components/neohi/ContactsPage";
import BottomNavigation from "@/components/neohi/BottomNavigation";
import ChatListItem from "@/components/neohi/ChatListItem";
import { ChatListSkeleton } from "@/components/neohi/SkeletonLoader";
import { Button } from "@/components/ui/button";

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
}

export default function NeoHi() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("chats");
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadChats();
      subscribeToChats();
    }
  }, [user]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please login to use NeoHi",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }
      setUser(user);
      
      const { data: profile } = await supabase
        .from("neohi_users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      
      if (!profile) {
        await supabase.from("neohi_users").insert({
          id: user.id,
          username: user.email?.split("@")[0] || "user",
          display_name: user.email?.split("@")[0] || "User",
        });
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadChats = async () => {
    if (!user) return;

    const { data: chatMembers } = await supabase
      .from("neohi_chat_members")
      .select(`
        chat_id,
        is_muted,
        chats:neohi_chats(
          id,
          type,
          name,
          avatar_url,
          last_message_at
        )
      `)
      .eq("user_id", user.id)
      .order("last_read_at", { ascending: false });

    if (chatMembers) {
      const chatsData = await Promise.all(
        chatMembers
          .map((cm: any) => cm.chats)
          .filter(Boolean)
          .map(async (chat: any) => {
            // Get last message
            const { data: lastMessage } = await supabase
              .from("neohi_messages")
              .select("content, sender_id")
              .eq("chat_id", chat.id)
              .eq("is_deleted", false)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            // Get unread count
            const { count: unreadCount } = await supabase
              .from("neohi_messages")
              .select("*", { count: "exact", head: true })
              .eq("chat_id", chat.id)
              .neq("sender_id", user.id)
              .eq("is_deleted", false);

            return {
              ...chat,
              last_message: lastMessage
                ? {
                    content: lastMessage.content,
                    is_read: lastMessage.sender_id === user.id,
                  }
                : null,
              unread_count: unreadCount || 0,
              is_muted: chatMembers.find((cm: any) => cm.chat_id === chat.id)?.is_muted || false,
            };
          })
      );

      setChats(
        chatsData.sort((a: any, b: any) => {
          const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
          const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
          return bTime - aTime;
        })
      );
    }
  };

  const subscribeToChats = () => {
    const channel = supabase
      .channel("chat-updates")
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
    if (chat.type === "dm") return "چت خصوصی";
    if (chat.type === "group") return "گروه";
    if (chat.type === "channel") return "کانال";
    return "چت";
  };

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
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const filteredChats = chats.filter((chat) =>
    getChatName(chat).toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If Contacts tab is active, show Contacts Page
  if (activeTab === "contacts") {
    return <ContactsPage />;
  }

  // If Settings tab is active, show Profile Settings
  if (activeTab === "settings") {
    return (
      <ProfileSettings onBack={() => setActiveTab("chats")} />
    );
  }

  // If a chat is selected, show the chat view
  if (selectedChatId) {
    return (
      <ChatView
        chatId={selectedChatId}
        onBack={() => setSelectedChatId(null)}
      />
    );
  }

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden safe-area-inset">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-card border-b border-border px-4 py-3 safe-area-top shrink-0"
      >
        <div className="flex items-center justify-between h-12">
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              className="text-primary hover:bg-transparent px-0 h-auto min-h-[44px] min-w-[44px]"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </motion.div>
          
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <MessageCircle className="h-5 w-5 text-primary" />
            </motion.div>
            <span className="text-foreground font-bold text-lg">NeoHi</span>
          </div>

          <div className="flex items-center gap-2">
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-primary hover:bg-muted min-h-[44px] min-w-[44px] rounded-xl"
              >
                <Search className="h-5 w-5" />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-muted min-h-[44px] min-w-[44px] rounded-xl"
                onClick={() => setShowNewChat(true)}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-primary hover:bg-muted min-h-[44px] min-w-[44px] rounded-xl"
              >
                <Edit3 className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mt-3"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-muted/50 border-none text-foreground placeholder:text-muted-foreground pl-11 h-11 rounded-xl"
            />
          </div>
        </motion.div>
      </motion.header>

      {/* Stories */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <StoryBar />
      </motion.div>

      {/* Chat List */}
      <ScrollArea className="flex-1 bg-background pb-16">
        <AnimatePresence mode="wait">
          {filteredChats.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center h-full text-center p-8"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
              <MessageCircle className="h-20 w-20 text-muted-foreground/30 mb-4" />
              </motion.div>
              <p className="text-muted-foreground text-lg font-medium">No chats yet</p>
              <p className="text-muted-foreground/70 text-sm mt-2">Click + to start</p>
            </motion.div>
          ) : (
            <motion.div
              key="chats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="divide-y divide-border/30"
            >
              {filteredChats.map((chat, index) => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: index * 0.05,
                    duration: 0.3
                  }}
                >
                  <ChatListItem
                    chat={chat}
                    onDelete={() => loadChats()}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* New Chat Dialog */}
      <NewChatDialog
        open={showNewChat}
        onOpenChange={setShowNewChat}
        onChatCreated={(chatId) => {
          setSelectedChatId(chatId);
          setShowNewChat(false);
        }}
      />
    </div>
  );
}
