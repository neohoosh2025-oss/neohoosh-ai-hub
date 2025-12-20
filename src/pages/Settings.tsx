import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  User, Mail, LogOut, Loader2, 
  ChevronLeft, Camera, Check, X,
  Wifi, WifiOff, Download, Bell, BellOff, 
  HelpCircle, Info, ChevronRight, Brain
} from "lucide-react";
import { usePWA } from "@/hooks/usePWA";

const Settings = () => {
  const navigate = useNavigate();
  const { isInstalled, canInstall, installPrompt, isOnline, isPushSupported, isNotificationsEnabled, toggleNotifications } = usePWA();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("");

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
        setAvatarUrl(user.user_metadata?.avatar_url || null);
        
        const { data: neohiUser } = await supabase
          .from('neohi_users')
          .select('avatar_url, display_name')
          .eq('id', user.id)
          .single();
        
        if (neohiUser?.avatar_url) setAvatarUrl(neohiUser.avatar_url);
        if (neohiUser?.display_name && !user.user_metadata?.display_name) {
          setDisplayName(neohiUser.display_name);
        }
      } catch {
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      toast.error('فایل باید تصویر و کمتر از ۵ مگابایت باشد');
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      await supabase.storage.from('neohi-avatars').upload(fileName, file, { upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('neohi-avatars').getPublicUrl(fileName);

      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      await supabase.from('neohi_users').upsert({ 
        id: user.id, 
        username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
        avatar_url: publicUrl 
      });

      setAvatarUrl(publicUrl);
      toast.success('عکس پروفایل به‌روز شد');
    } catch {
      toast.error('خطا در آپلود عکس');
    } finally {
      setUploadingAvatar(false);
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
    navigate("/");
  };

  const handleInstall = async () => {
    if (installPrompt) await installPrompt();
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
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />

      {/* Header - Calm */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/30">
        <div className="max-w-lg mx-auto px-6 h-14 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted/50 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-foreground/70" />
          </button>
          <h1 className="text-sm font-medium text-foreground/80">تنظیمات</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-8">
        {/* Profile Card - Calm */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-card/30 rounded-2xl border border-border/30 mb-8"
          onClick={() => navigate('/profile')}
        >
          <div 
            className="relative cursor-pointer group"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="Profile" 
                className="w-14 h-14 rounded-2xl object-cover ring-1 ring-border/30" 
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground/70 text-xl font-medium ring-1 ring-border/30">
                {displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
            <div className="absolute inset-0 rounded-2xl bg-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploadingAvatar ? (
                <Loader2 className="w-4 h-4 text-background animate-spin" />
              ) : (
                <Camera className="w-4 h-4 text-background" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-medium text-foreground/80 truncate">{displayName || "کاربر نئوهوش"}</h2>
            <p className="text-xs text-muted-foreground/50 truncate" dir="ltr">{user?.email}</p>
          </div>
          <ChevronLeft className="w-4 h-4 text-muted-foreground/40" />
        </motion.div>

        {/* Account Section */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h3 className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-2 px-1">حساب کاربری</h3>
          <div className="bg-card/30 rounded-2xl border border-border/30 divide-y divide-border/20">
            {/* Name */}
            <div className="p-4">
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
            <div className="p-4">
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
          </div>
        </motion.div>

        {/* App Settings Section */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <h3 className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-2 px-1">تنظیمات اپلیکیشن</h3>
          <div className="bg-card/30 rounded-2xl border border-border/30 divide-y divide-border/20">
            {/* Notifications */}
            <button 
              onClick={isPushSupported ? toggleNotifications : undefined}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isNotificationsEnabled ? 'bg-green-500/10' : 'bg-muted/50'}`}>
                  {isNotificationsEnabled ? (
                    <Bell className="w-3.5 h-3.5 text-green-500/70" />
                  ) : (
                    <BellOff className="w-3.5 h-3.5 text-muted-foreground/70" />
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground/80">اعلان‌ها</p>
                </div>
              </div>
              <span className={`text-xs ${isNotificationsEnabled ? 'text-green-500/70' : 'text-muted-foreground/50'}`}>
                {isNotificationsEnabled ? "فعال" : "غیرفعال"}
              </span>
            </button>

            {/* Install */}
            <button 
              onClick={canInstall ? handleInstall : undefined}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isInstalled ? 'bg-green-500/10' : 'bg-muted/50'}`}>
                  <Download className={`w-3.5 h-3.5 ${isInstalled ? 'text-green-500/70' : 'text-muted-foreground/70'}`} />
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground/80">نصب اپلیکیشن</p>
                </div>
              </div>
              <span className={`text-xs ${isInstalled ? 'text-green-500/70' : 'text-muted-foreground/50'}`}>
                {isInstalled ? "نصب شده" : canInstall ? "نصب کنید" : "—"}
              </span>
            </button>

            {/* Connection */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isOnline ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  {isOnline ? (
                    <Wifi className="w-3.5 h-3.5 text-green-500/70" />
                  ) : (
                    <WifiOff className="w-3.5 h-3.5 text-red-500/70" />
                  )}
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground/80">وضعیت اتصال</p>
                </div>
              </div>
              <span className={`text-xs ${isOnline ? 'text-green-500/70' : 'text-red-500/70'}`}>
                {isOnline ? "آنلاین" : "آفلاین"}
              </span>
            </div>
          </div>
        </motion.div>

        {/* AI Settings Section */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h3 className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-2 px-1">هوش مصنوعی</h3>
          <div className="bg-card/30 rounded-2xl border border-border/30 divide-y divide-border/20">
            <button 
              onClick={() => navigate("/ai-settings")}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-primary/70" />
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground/80">تنظیمات AI</p>
                  <p className="text-[10px] text-muted-foreground/50">لحن، حافظه و شخصی‌سازی</p>
                </div>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground/40" />
            </button>
          </div>
        </motion.div>

        {/* Support Section */}
        <motion.div 
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <h3 className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider mb-2 px-1">پشتیبانی</h3>
          <div className="bg-card/30 rounded-2xl border border-border/30 divide-y divide-border/20">
            <button 
              onClick={() => toast.info("به زودی...")}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center">
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground/70" />
                </div>
                <p className="text-sm text-foreground/80">راهنما</p>
              </div>
              <ChevronLeft className="w-4 h-4 text-muted-foreground/40" />
            </button>

            <button 
              onClick={() => navigate("/about")}
              className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-muted/50 flex items-center justify-center">
                  <Info className="w-3.5 h-3.5 text-muted-foreground/70" />
                </div>
                <p className="text-sm text-foreground/80">درباره نئوهوش</p>
              </div>
              <span className="text-xs text-muted-foreground/50">نسخه ۱.۰.۰</span>
            </button>
          </div>
        </motion.div>

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
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

export default Settings;
