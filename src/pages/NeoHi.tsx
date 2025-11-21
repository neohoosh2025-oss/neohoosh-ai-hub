import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Menu } from "lucide-react";
import { ChatList } from "@/components/neohi/ChatList";
import { ChatView } from "@/components/neohi/ChatView";
import { StoryBar } from "@/components/neohi/StoryBar";
import { ProfileSidebar } from "@/components/neohi/ProfileSidebar";
import { NewChatDialog } from "@/components/neohi/NewChatDialog";
import { useToast } from "@/components/ui/use-toast";

export default function NeoHi() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
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
    
    // Check if user has neohi profile, create if not
    const { data: profile } = await supabase
      .from("neohi_users")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (!profile) {
      // Create initial profile
      await supabase.from("neohi_users").insert({
        id: user.id,
        username: user.email?.split("@")[0] || "user",
        display_name: user.email?.split("@")[0] || "کاربر",
      });
    }
  };

  const handleBackToWebsite = () => {
    navigate("/");
  };

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowChatList(!showChatList)}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            نئوهای
          </h1>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleBackToWebsite}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          بازگشت به وبسایت
        </Button>
      </header>

      {/* Stories Bar */}
      <StoryBar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat List Sidebar */}
        <div
          className={`${
            showChatList ? "flex" : "hidden"
          } lg:flex w-full lg:w-80 border-l border-border bg-card/30 flex-col shrink-0`}
        >
          <ChatList
            selectedChatId={selectedChatId}
            onSelectChat={(id) => {
              setSelectedChatId(id);
              setShowChatList(false);
              setShowProfile(false);
            }}
            onNewChat={() => setShowNewChat(true)}
          />
        </div>

        {/* Chat View */}
        <div className="flex-1 flex flex-col bg-background">
          {selectedChatId ? (
            <ChatView
              chatId={selectedChatId}
              onShowProfile={() => setShowProfile(true)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">خوش آمدید به نئوهای</h2>
                <p>یک گفتگو را انتخاب کنید یا گفتگوی جدیدی شروع کنید</p>
              </div>
            </div>
          )}
        </div>

        {/* Profile Sidebar */}
        {showProfile && (
          <ProfileSidebar
            chatId={selectedChatId!}
            onClose={() => setShowProfile(false)}
          />
        )}
      </div>

      {/* New Chat Dialog */}
      <NewChatDialog
        open={showNewChat}
        onOpenChange={setShowNewChat}
        onChatCreated={(chatId) => {
          setSelectedChatId(chatId);
          setShowNewChat(false);
          setShowChatList(false);
        }}
      />
    </div>
  );
}
