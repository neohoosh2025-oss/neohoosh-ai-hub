import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ChatView } from "@/components/neohi/ChatView";
import { NewChatDialog } from "@/components/neohi/NewChatDialog";
import { ProfileSettings } from "@/components/neohi/ProfileSettings";
import { ContactsPage } from "@/components/neohi/ContactsPage";
import { Sidebar } from "@/components/neohi/Sidebar";
import StoriesPage from "@/pages/StoriesPage";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus, MessageCircle, Users, Camera, Settings, Search } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import BottomNavigation from "@/components/neohi/BottomNavigation";
import { Link } from "react-router-dom";

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
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const activeTab = searchParams.get("tab") || "chats";
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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
          title: "ورود لازم است",
          description: "برای استفاده از NeoHi وارد شوید",
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
          display_name: user.email?.split("@")[0] || "کاربر",
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
        last_read_at,
        chats:neohi_chats(id, type, name, avatar_url, last_message_at)
      `)
      .eq("user_id", user.id)
      .order("last_read_at", { ascending: false });

    if (chatMembers) {
      const chatsData = await Promise.all(
        chatMembers
          .map((cm: any) => cm.chats)
          .filter(Boolean)
          .map(async (chat: any) => {
            let chatData = { ...chat };

            if (chat.type === "dm") {
              const { data: members } = await supabase
                .from("neohi_chat_members")
                .select("user_id")
                .eq("chat_id", chat.id);

              const otherUserId = members?.find((m: any) => m.user_id !== user.id)?.user_id;
              
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

            const { data: lastMessage } = await supabase
              .from("neohi_messages")
              .select("content, sender_id, message_type")
              .eq("chat_id", chat.id)
              .eq("is_deleted", false)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            const chatMember = chatMembers.find((cm: any) => cm.chat_id === chat.id);
            const lastReadAt = chatMember?.last_read_at;
            
            let unreadCount = 0;
            if (lastReadAt) {
              const { count } = await supabase
                .from("neohi_messages")
                .select("*", { count: "exact", head: true })
                .eq("chat_id", chat.id)
                .neq("sender_id", user.id)
                .eq("is_deleted", false)
                .gt("created_at", lastReadAt);
              unreadCount = count || 0;
            }

            return {
              ...chatData,
              last_message: lastMessage
                ? {
                    content: lastMessage.message_type && lastMessage.message_type !== "text"
                      ? getMediaTypeLabel(lastMessage.message_type)
                      : (lastMessage.content || "پیامی نیست"),
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
      .on("postgres_changes", { event: "*", schema: "public", table: "neohi_messages" }, () => loadChats())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "neohi_chat_members" }, () => loadChats())
      .on("postgres_changes", { event: "*", schema: "public", table: "neohi_chats" }, () => loadChats())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getMediaTypeLabel = (messageType: string): string => {
    switch (messageType) {
      case "image": return "📷 عکس";
      case "voice": return "🎤 ویس";
      case "video": return "🎬 ویدیو";
      case "file": return "📎 فایل";
      default: return "📎 فایل";
    }
  };

  const getTimeDisplay = (timestamp: string | null) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
    } else {
      return date.toLocaleDateString("fa-IR", { month: "short", day: "numeric" });
    }
  };

  const filteredChats = chats.filter(chat => 
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Handle tab routing
  if (activeTab === "contacts") {
    return <ContactsPage onBack={() => navigate("/neohi")} />;
  }
  if (activeTab === "stories") {
    return <StoriesPage onBack={() => navigate("/neohi")} />;
  }
  if (activeTab === "settings") {
    return <ProfileSettings onBack={() => navigate("/neohi")} />;
  }

  // If a chat is selected on mobile
  if (selectedChatId && window.innerWidth < 768) {
    return (
      <ChatView
        chatId={selectedChatId}
        onBack={() => {
          setSelectedChatId(null);
          loadChats();
        }}
      />
    );
  }

  // Main Chat List View
  return (
    <div className="h-screen w-full bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 safe-area-top">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-lg">NEOHI</h1>
              <p className="text-[10px] text-muted-foreground">شبکه اجتماعی هوشمند</p>
            </div>
          </div>
          
          <Button
            size="icon"
            className="rounded-full bg-primary"
            onClick={() => setShowNewChat(true)}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در چت‌ها..."
              className="pr-10 h-10 rounded-xl bg-muted/50 border-0"
            />
          </div>
        </div>
      </header>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto pb-20">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">هنوز چتی نداری</h3>
            <p className="text-sm text-muted-foreground mb-4">
              یه چت جدید شروع کن و با دوستات در ارتباط باش
            </p>
            <Button onClick={() => setShowNewChat(true)}>
              <Plus className="w-4 h-4 ml-2" />
              چت جدید
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredChats.map((chat, i) => (
              <motion.button
                key={chat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => {
                  setSelectedChatId(chat.id);
                  setChats(prev => prev.map(c => 
                    c.id === chat.id ? { ...c, unread_count: 0 } : c
                  ));
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-right"
              >
                <Avatar className="w-12 h-12 flex-shrink-0">
                  <AvatarImage src={chat.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                    {chat.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-sm truncate">
                      {chat.name || "چت"}
                    </h3>
                    <span className="text-[10px] text-muted-foreground">
                      {getTimeDisplay(chat.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate flex-1">
                      {chat.last_message?.content || "پیامی نیست"}
                    </p>
                    {(chat.unread_count || 0) > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
                        {chat.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>

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
