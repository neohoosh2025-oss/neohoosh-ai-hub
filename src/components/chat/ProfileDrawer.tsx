import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  User, Mail, LogOut, Loader2, Check, X, MessageSquare, Calendar, Brain, ChevronLeft
} from "lucide-react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

interface ProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

export function ProfileDrawer({ open, onOpenChange, user }: ProfileDrawerProps) {
  const navigate = useNavigate();
  
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [stats, setStats] = useState({ messages: 0, conversations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && user) {
      loadUserData();
    }
  }, [open, user]);

  const loadUserData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
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
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

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
    onOpenChange(false);
    navigate("/");
  };

  const startEditingName = () => {
    setTempName(displayName);
    setIsEditingName(true);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="left" 
        className="w-[90vw] sm:w-[380px] p-0 [&>button]:hidden border-l border-border/50 bg-background/95 backdrop-blur-xl"
      >
        <div className="h-full flex flex-col" dir="rtl">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-border/30 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">پروفایل</h2>
            <button
              onClick={() => onOpenChange(false)}
              className="w-8 h-8 rounded-lg hover:bg-muted/50 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/50" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Avatar Section */}
              <motion.div 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center mb-8"
              >
                <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center text-primary text-3xl font-semibold mb-3">
                  {displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <p className="text-sm text-foreground/80">{displayName || user?.email?.split('@')[0]}</p>
              </motion.div>

              {/* Info Cards */}
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

              {/* Stats */}
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
                  onClick={() => {
                    onOpenChange(false);
                    navigate('/ai-settings');
                  }}
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

              {/* Sign Out */}
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
              <p className="text-center text-[10px] text-muted-foreground/30 mt-8">
                نئوهوش • نسخه ۱.۰.۰
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}