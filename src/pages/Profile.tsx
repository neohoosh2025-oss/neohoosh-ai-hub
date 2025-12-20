import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  User, Mail, LogOut, Loader2, ChevronRight, Check, X, MessageSquare, Calendar, Brain, ChevronLeft
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [stats, setStats] = useState({ messages: 0, conversations: 0 });

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          navigate("/auth");
          return;
        }

        setUser(user);
        setDisplayName(user.user_metadata?.display_name || "");
        
        // Get NEOHI profile for display name
        const { data: neohiUser } = await supabase
          .from('neohi_users')
          .select('display_name')
          .eq('id', user.id)
          .single();
        
        if (neohiUser?.display_name && !user.user_metadata?.display_name) {
          setDisplayName(neohiUser.display_name);
        }

        // Get stats
        const { data: conversations } = await supabase
          .from("conversations")
          .select("id")
          .eq("user_id", user.id);

        if (conversations && conversations.length > 0) {
          const { count } = await supabase
            .from("messages")
            .select("id", { count: 'exact', head: true })
            .in("conversation_id", conversations.map(c => c.id));
          
          setStats({
            messages: count || 0,
            conversations: conversations.length,
          });
        }
      } catch {
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);


  const handleUpdateName = async () => {
    if (!user || !tempName.trim()) return;
    setSaving(true);
    try {
      await supabase.auth.updateUser({ data: { display_name: tempName } });
      await supabase.from('neohi_users').update({ display_name: tempName }).eq('id', user.id);
      setDisplayName(tempName);
      toast.success("نام به‌روز شد");
      setIsEditingName(false);
    } catch {
      toast.error("خطا در به‌روزرسانی");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const startEditingName = () => {
    setTempName(displayName);
    setIsEditingName(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Header - Calm */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="max-w-lg mx-auto px-6 h-14 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted/50 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-foreground/70" />
          </button>
          <h1 className="text-sm font-medium text-foreground/80">پروفایل</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-10">
        {/* Avatar Section - Simple Letter */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center mb-10"
        >
          <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center text-primary text-3xl font-semibold mb-3">
            {displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <p className="text-sm text-foreground/80">{displayName || user?.email?.split('@')[0]}</p>
        </motion.div>

        {/* Info Cards - Calm */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="space-y-2"
        >
          {/* Name */}
          <div className="bg-card/30 rounded-2xl border border-border/30 p-4 hover:bg-card/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-muted-foreground/70" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground/50 mb-0.5">نام</p>
                  {isEditingName ? (
                    <Input
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      className="h-7 text-sm bg-transparent border-0 p-0 focus-visible:ring-0 text-foreground/90"
                      autoFocus
                      placeholder="نام خود را وارد کنید"
                    />
                  ) : (
                    <p className="text-sm text-foreground/80">{displayName || "تنظیم نشده"}</p>
                  )}
                </div>
              </div>
              {isEditingName ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="w-7 h-7 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground/70" />
                  </button>
                  <button
                    onClick={handleUpdateName}
                    disabled={saving || !tempName.trim()}
                    className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-primary" />
                    )}
                  </button>
                </div>
              ) : (
                <button
                  onClick={startEditingName}
                  className="text-[11px] text-primary/70 hover:text-primary transition-colors"
                >
                  ویرایش
                </button>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="bg-card/30 rounded-2xl border border-border/30 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center">
                <Mail className="w-3.5 h-3.5 text-muted-foreground/70" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground/50 mb-0.5">ایمیل</p>
                <p className="text-sm text-foreground/80" dir="ltr">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Member Since */}
          <div className="bg-card/30 rounded-2xl border border-border/30 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground/50 mb-0.5">عضویت</p>
                <p className="text-sm text-foreground/80">
                  {new Date(user?.created_at).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats - Calm */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-6 grid grid-cols-2 gap-2"
        >
          <div className="bg-card/30 rounded-2xl border border-border/30 p-4 text-center">
            <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground/70" />
            </div>
            <p className="text-lg font-medium text-foreground/80">{stats.messages}</p>
            <p className="text-[10px] text-muted-foreground/50">پیام</p>
          </div>
          <div className="bg-card/30 rounded-2xl border border-border/30 p-4 text-center">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <User className="w-3.5 h-3.5 text-primary/70" />
            </div>
            <p className="text-lg font-medium text-foreground/80">{stats.conversations}</p>
            <p className="text-[10px] text-muted-foreground/50">گفتگو</p>
          </div>
        </motion.div>

        {/* AI Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="mt-4"
        >
          <button
            onClick={() => navigate('/ai-settings')}
            className="w-full bg-card/30 rounded-2xl border border-border/30 p-4 hover:bg-card/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground/80">تنظیمات AI</p>
                  <p className="text-[10px] text-muted-foreground/50">لحن، حافظه و شخصی‌سازی</p>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground/40" />
            </div>
          </button>
        </motion.div>

        {/* Sign Out - Calm */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-8"
        >
          <Button 
            onClick={handleSignOut} 
            variant="ghost" 
            className="w-full h-11 rounded-2xl text-destructive/70 hover:text-destructive hover:bg-destructive/5 text-sm font-normal"
          >
            <LogOut className="w-4 h-4 ml-2" />
            خروج از حساب
          </Button>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-[10px] text-muted-foreground/30 mt-10">
          نئوهوش • نسخه ۱.۰.۰
        </p>
      </div>
    </div>
  );
};

export default Profile;
