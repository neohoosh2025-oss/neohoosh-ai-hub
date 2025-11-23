import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ChatView } from "@/components/neohi/ChatView";
import { NewChatDialog } from "@/components/neohi/NewChatDialog";
import { ProfileSettings } from "@/components/neohi/ProfileSettings";
import { ContactsPage } from "@/components/neohi/ContactsPage";
import { Sidebar } from "@/components/neohi/Sidebar";
import StoriesPage from "@/pages/StoriesPage";
import BottomNavigation from "@/components/neohi/BottomNavigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import neohooshLogo from "@/assets/neohoosh-logo.png";

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
    if (chat.type === "dm") return "Private Chat";
    if (chat.type === "group") return "Group";
    if (chat.type === "channel") return "Channel";
    return "Chat";
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
      <div className="h-screen w-full bg-[hsl(var(--neohi-bg-main))] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[hsl(var(--neohi-accent))] border-t-transparent rounded-full"
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

  // If a chat is selected, show the chat view
  if (selectedChatId) {
    return (
      <ChatView
        chatId={selectedChatId}
        onBack={() => setSelectedChatId(null)}
      />
    );
  }

  // Main View - Desktop: Sidebar + Chat Area / Mobile: Full Screen
  return (
    <div className="h-screen w-full bg-[hsl(var(--neohi-bg-main))] flex flex-col overflow-hidden">
      {/* Back to NeoHoosh Button */}
      <div className="flex items-center gap-3 p-3 sm:p-4 border-b border-[hsl(var(--neohi-border))] bg-[hsl(var(--neohi-bg-secondary))]/50 backdrop-blur-sm">
        <Link to="/">
          <Button 
            variant="ghost" 
            size="sm"
            className="gap-2 text-[hsl(var(--neohi-text-primary))] hover:text-[hsl(var(--neohi-accent))] hover:bg-[hsl(var(--neohi-bg-chat))]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">بازگشت به نئوهوش</span>
          </Button>
        </Link>
        <Link to="/" className="mr-auto">
          <img 
            src={neohooshLogo} 
            alt="NeoHoosh Logo" 
            className="h-8 sm:h-10 w-auto opacity-60 hover:opacity-100 transition-opacity"
          />
        </Link>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            chats={chats}
            selectedChatId={selectedChatId}
            onChatSelect={setSelectedChatId}
            onNewChat={() => setShowNewChat(true)}
            onSettings={() => navigate("/neohi?tab=settings")}
          />
        </div>

        {/* Mobile View */}
        <div className="flex-1 md:hidden flex flex-col">
          <Sidebar
            chats={chats}
            selectedChatId={selectedChatId}
            onChatSelect={setSelectedChatId}
            onNewChat={() => setShowNewChat(true)}
            onSettings={() => navigate("/neohi?tab=settings")}
          />
          <BottomNavigation />
        </div>

        {/* Desktop Empty State */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-[hsl(var(--neohi-bg-chat))]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-[hsl(var(--neohi-accent))] to-primary flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </motion.div>
            </motion.div>
            <h2 className="text-2xl font-bold text-[hsl(var(--neohi-text-primary))] mb-2">
              Welcome to NeoHi
            </h2>
            <p className="text-[hsl(var(--neohi-text-secondary))] max-w-md">
              Select a chat from the sidebar to start messaging, or create a new conversation
            </p>
          </motion.div>
        </div>
      </div>

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
