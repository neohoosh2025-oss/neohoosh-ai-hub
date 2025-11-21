import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function NeoHi() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      
      // Check if user has neohi profile, create if not
      const { data: profile } = await supabase
        .from("neohi_users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      
      if (!profile) {
        // Create initial profile
        const { error } = await supabase.from("neohi_users").insert({
          id: user.id,
          username: user.email?.split("@")[0] || "user",
          display_name: user.email?.split("@")[0] || "کاربر",
        });
        
        if (error) {
          console.error("Error creating profile:", error);
        }
      }
    } catch (error) {
      console.error("Error in checkUser:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToWebsite = () => {
    navigate("/");
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            نئوهای
          </div>
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          نئوهای
        </h1>
        
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

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              خوش آمدید به نئوهای
            </h2>
            <p className="text-lg text-muted-foreground">
              محیط چت پیشرفته شبیه تلگرام
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card transition-colors">
              <div className="text-3xl mb-3">💬</div>
              <h3 className="font-semibold mb-2">چت خصوصی</h3>
              <p className="text-sm text-muted-foreground">
                گفتگوی مستقیم با دوستان
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card transition-colors">
              <div className="text-3xl mb-3">👥</div>
              <h3 className="font-semibold mb-2">گروه‌ها</h3>
              <p className="text-sm text-muted-foreground">
                ساخت و مدیریت گروه‌های خود
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card transition-colors">
              <div className="text-3xl mb-3">📢</div>
              <h3 className="font-semibold mb-2">کانال‌ها</h3>
              <p className="text-sm text-muted-foreground">
                انتشار پیام برای مخاطبان
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card transition-colors">
              <div className="text-3xl mb-3">📸</div>
              <h3 className="font-semibold mb-2">استوری‌ها</h3>
              <p className="text-sm text-muted-foreground">
                به اشتراک‌گذاری لحظات روز
              </p>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card/50 backdrop-blur-sm hover:bg-card transition-colors">
              <div className="text-3xl mb-3">🎤</div>
              <h3 className="font-semibold mb-2">پیام صوتی</h3>
              <p className="text-sm text-muted-foreground">
                ارسال پیام‌های صوتی
              </p>
            </div>
          </div>

          <div className="mt-8 p-4 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-sm text-primary">
              🚀 سیستم در حال توسعه است. به زودی تمام قابلیت‌ها فعال خواهند شد!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
