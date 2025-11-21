import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Plus, 
  Edit3, 
  Users, 
  Phone, 
  MessageCircle, 
  Settings,
  ArrowLeft,
  VolumeX,
  CheckCheck
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { ChatView } from "@/components/neohi/ChatView";
import { StoryBar } from "@/components/neohi/StoryBar";
import { NewChatDialog } from "@/components/neohi/NewChatDialog";

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
          title: "ورود نیاز است",
          description: "برای استفاده از نئوهای لطفا وارد شوید",
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
    <div className="h-screen w-full bg-black flex flex-col overflow-hidden">
      {/* Telegram Header */}
      <header className="bg-[#1c1c1d] border-b border-[#2c2c2e] px-4 py-2">
        <div className="flex items-center justify-between h-11">
          <Button
            variant="ghost"
            className="text-[#0a84ff] hover:bg-transparent text-base px-0"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-5 w-5 ml-1" />
            بازگشت
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-[#0a84ff] flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-white" fill="currentColor" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-600 border-2 border-[#1c1c1d]" />
            </div>
            <span className="text-white font-semibold text-lg">Chats</span>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-[#0a84ff] hover:bg-transparent">
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-[#0a84ff] hover:bg-transparent"
              onClick={() => setShowNewChat(true)}
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-[#0a84ff] hover:bg-transparent">
              <Edit3 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-2 mb-1">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#2c2c2e] border-none text-white placeholder:text-gray-500 pr-10 h-9 rounded-lg"
            />
          </div>
        </div>
      </header>

      {/* Stories */}
      <StoryBar />

      {/* Chat List */}
      <ScrollArea className="flex-1 bg-black">
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <MessageCircle className="h-16 w-16 text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg">هنوز چتی ندارید</p>
            <p className="text-gray-500 text-sm mt-2">برای شروع چت جدید روی + کلیک کنید</p>
          </div>
        ) : (
          <div className="divide-y divide-[#2c2c2e]">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChatId(chat.id)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#1c1c1d] transition-colors active:bg-[#2c2c2e]"
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar className="h-[52px] w-[52px]">
                    <AvatarImage src={chat.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                      {getChatName(chat).charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {chat.is_muted && (
                        <VolumeX className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                      )}
                      <h3 className="text-white font-medium text-[15px] truncate">
                        {getChatName(chat)}
                      </h3>
                    </div>
                    <span className="text-gray-500 text-[13px] shrink-0">
                      {getTimeDisplay(chat.last_message_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-start gap-1.5 min-w-0 flex-1">
                      {chat.last_message?.is_read && (
                        <CheckCheck className="h-3.5 w-3.5 text-[#0a84ff] shrink-0 mt-0.5" />
                      )}
                      <p className="text-gray-400 text-[14px] line-clamp-2 leading-tight">
                        {chat.last_message?.content || "هنوز پیامی ارسال نشده"}
                      </p>
                    </div>
                    
                    {chat.unread_count && chat.unread_count > 0 && (
                      <div className="bg-[#2c2c2e] text-gray-400 rounded-full px-2 py-0.5 text-xs font-medium shrink-0 min-w-[24px] text-center">
                        {chat.unread_count > 999 ? "999+" : chat.unread_count}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Bottom Tab Bar */}
      <div className="bg-[#1c1c1d] border-t border-[#2c2c2e] pb-safe">
        <div className="flex items-center justify-around h-12">
          <button
            onClick={() => setActiveTab("contacts")}
            className="flex flex-col items-center justify-center flex-1 gap-0.5"
          >
            <Users className={`h-6 w-6 ${activeTab === "contacts" ? "text-[#0a84ff]" : "text-gray-500"}`} />
            <span className={`text-[10px] ${activeTab === "contacts" ? "text-[#0a84ff]" : "text-gray-500"}`}>
              Contacts
            </span>
          </button>

          <button
            onClick={() => setActiveTab("calls")}
            className="flex flex-col items-center justify-center flex-1 gap-0.5"
          >
            <Phone className={`h-6 w-6 ${activeTab === "calls" ? "text-[#0a84ff]" : "text-gray-500"}`} />
            <span className={`text-[10px] ${activeTab === "calls" ? "text-[#0a84ff]" : "text-gray-500"}`}>
              Calls
            </span>
          </button>

          <button
            onClick={() => setActiveTab("chats")}
            className="flex flex-col items-center justify-center flex-1 gap-0.5 relative"
          >
            <div className="relative">
              <MessageCircle className={`h-6 w-6 ${activeTab === "chats" ? "text-[#0a84ff]" : "text-gray-500"}`} />
              {chats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0) > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0a84ff] flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">
                    {Math.min(99, chats.reduce((sum, chat) => sum + (chat.unread_count || 0), 0))}
                  </span>
                </div>
              )}
            </div>
            <span className={`text-[10px] ${activeTab === "chats" ? "text-[#0a84ff]" : "text-gray-500"}`}>
              Chats
            </span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className="flex flex-col items-center justify-center flex-1 gap-0.5"
          >
            <Settings className={`h-6 w-6 ${activeTab === "settings" ? "text-[#0a84ff]" : "text-gray-500"}`} />
            <span className={`text-[10px] ${activeTab === "settings" ? "text-[#0a84ff]" : "text-gray-500"}`}>
              Settings
            </span>
          </button>
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
