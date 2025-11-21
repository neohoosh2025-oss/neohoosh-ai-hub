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
  CheckCheck,
  Check
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isMuted?: boolean;
  isRead?: boolean;
  isPinned?: boolean;
}

export default function NeoHi() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("chats");

  // Sample data - این رو بعداً از دیتابیس می‌گیریم
  const [chats] = useState<Chat[]>([
    {
      id: "1",
      name: "MILAD MAN",
      avatar: "",
      lastMessage: "ای گبرم دهنت مدد 😂😂",
      time: "02:29",
      unreadCount: 121,
      isMuted: true,
      isPinned: true
    },
    {
      id: "2",
      name: "Moez M",
      avatar: "",
      lastMessage: "الکیه",
      time: "01:55",
      isRead: true,
      isMuted: true
    },
    {
      id: "3",
      name: "FutNews | فوتنیوز",
      avatar: "",
      lastMessage: "📋 FutNewsCH@ ❤️ شنبون بخیر",
      time: "01:53",
      unreadCount: 56,
      isMuted: true
    },
    {
      id: "4",
      name: "اخبار فوری / مهم",
      avatar: "",
      lastMessage: "🖊 تغییر لحن قابل توجه ترامپ درباره مذاکرات...",
      time: "01:35",
      isMuted: true
    },
    {
      id: "5",
      name: "Music Connection",
      avatar: "",
      lastMessage: "Arash\nRise Of The Longship KINGOFTHENORTH —...",
      time: "01:23",
      unreadCount: 817,
      isMuted: true
    }
  ]);

  useEffect(() => {
    checkUser();
  }, []);

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

  if (loading) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <Button variant="ghost" size="icon" className="text-[#0a84ff] hover:bg-transparent">
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

      {/* Chat List */}
      <ScrollArea className="flex-1 bg-black">
        <div className="divide-y divide-[#2c2c2e]">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#1c1c1d] transition-colors active:bg-[#2c2c2e]"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <Avatar className="h-[52px] w-[52px]">
                  <AvatarImage src={chat.avatar} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                    {chat.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {chat.isPinned && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#2c2c2e] border-2 border-black flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-gray-500" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    {chat.isMuted && (
                      <VolumeX className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                    )}
                    <h3 className="text-white font-medium text-[15px] truncate">
                      {chat.name}
                    </h3>
                  </div>
                  <span className="text-gray-500 text-[13px] shrink-0">
                    {chat.time}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-start gap-1.5 min-w-0 flex-1">
                    {chat.isRead && (
                      <CheckCheck className="h-3.5 w-3.5 text-[#0a84ff] shrink-0 mt-0.5" />
                    )}
                    <p className="text-gray-400 text-[14px] line-clamp-2 leading-tight">
                      {chat.lastMessage}
                    </p>
                  </div>
                  
                  {chat.unreadCount && chat.unreadCount > 0 && (
                    <div className="bg-[#2c2c2e] text-gray-400 rounded-full px-2 py-0.5 text-xs font-medium shrink-0 min-w-[24px] text-center">
                      {chat.unreadCount > 999 ? "999+" : chat.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
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
              {activeTab === "chats" && (
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0a84ff] flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">64</span>
                </div>
              )}
            </div>
            <span className={`text-[10px] ${activeTab === "chats" ? "text-[#0a84ff]" : "text-gray-500"}`}>
              Chats
            </span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className="flex flex-col items-center justify-center flex-1 gap-0.5 relative"
          >
            <div className="relative">
              <Settings className={`h-6 w-6 ${activeTab === "settings" ? "text-[#0a84ff]" : "text-gray-500"}`} />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-white text-[9px] font-bold">1</span>
              </div>
            </div>
            <span className={`text-[10px] ${activeTab === "settings" ? "text-[#0a84ff]" : "text-gray-500"}`}>
              Settings
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
