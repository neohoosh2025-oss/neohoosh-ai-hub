import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  User, Mail, LogOut, Loader2, 
  Calendar, ChevronLeft, Camera, Check,
  Wifi, WifiOff, Download, Bell, BellOff, Shield, MessageSquare, 
  HelpCircle, Info, Moon, Globe, Smartphone, Lock, Trash2
} from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { MainLayout } from "@/components/layouts/MainLayout";
import { cn } from "@/lib/utils";

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
        setAvatarUrl(user.user_metadata?.avatar_url || null);
        
        // Get NEOHI profile
        const { data: neohiUser } = await supabase
          .from('neohi_users')
          .select('avatar_url, display_name')
          .eq('id', user.id)
          .single();
        
        if (neohiUser?.avatar_url) setAvatarUrl(neohiUser.avatar_url);
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
    if (!user || !displayName.trim()) return;
    setSaving(true);
    try {
      await supabase.auth.updateUser({ data: { display_name: displayName } });
      await supabase.from('neohi_users').update({ display_name: displayName }).eq('id', user.id);
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

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const menuSections = [
    {
      title: "حساب کاربری",
      items: [
        { 
          icon: User, 
          label: "نام نمایشی", 
          value: displayName || "تنظیم نشده",
          onClick: () => setIsEditingName(true)
        },
        { 
          icon: Mail, 
          label: "ایمیل", 
          value: user?.email,
          disabled: true
        },
        { 
          icon: Calendar, 
          label: "تاریخ عضویت", 
          value: new Date(user?.created_at).toLocaleDateString('fa-IR'),
          disabled: true
        },
        { 
          icon: Shield, 
          label: "وضعیت تأیید", 
          value: user?.email_confirmed_at ? "تأیید شده" : "تأیید نشده",
          status: user?.email_confirmed_at ? "success" : "warning",
          disabled: true
        },
      ]
    },
    {
      title: "تنظیمات اپلیکیشن",
      items: [
        { 
          icon: isNotificationsEnabled ? Bell : BellOff, 
          label: "اعلان‌ها", 
          value: isNotificationsEnabled ? "فعال" : "غیرفعال",
          onClick: isPushSupported ? toggleNotifications : undefined,
          status: isNotificationsEnabled ? "success" : undefined
        },
        { 
          icon: Download, 
          label: "نصب اپلیکیشن", 
          value: isInstalled ? "نصب شده" : canInstall ? "نصب کنید" : "نصب نشده",
          onClick: canInstall ? handleInstall : undefined,
          status: isInstalled ? "success" : undefined
        },
        { 
          icon: isOnline ? Wifi : WifiOff, 
          label: "وضعیت اتصال", 
          value: isOnline ? "آنلاین" : "آفلاین",
          status: isOnline ? "success" : "error",
          disabled: true
        },
      ]
    },
    {
      title: "پشتیبانی",
      items: [
        { 
          icon: HelpCircle, 
          label: "راهنما و سوالات متداول", 
          onClick: () => toast.info("به زودی...")
        },
        { 
          icon: Info, 
          label: "درباره نئوهوش", 
          value: "نسخه ۱.۰.۰",
          onClick: () => navigate("/about")
        },
      ]
    },
  ];

  return (
    <MainLayout>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />

      <div className="pb-24">
        {/* Profile Header - Telegram Style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative bg-gradient-to-b from-primary/10 to-background pt-6 pb-8 px-4"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <motion.div 
              whileTap={{ scale: 0.95 }}
              className="relative cursor-pointer mb-4"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-lg" 
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-3xl font-bold border-4 border-background shadow-lg">
                  {displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full border-3 border-background flex items-center justify-center shadow-md">
                {uploadingAvatar ? (
                  <Loader2 className="w-4 h-4 text-primary-foreground animate-spin" />
                ) : (
                  <Camera className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
            </motion.div>

            {/* Name */}
            <h1 className="text-xl font-bold mb-1">{displayName || "کاربر نئوهوش"}</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 mt-5">
              <div className="text-center">
                <div className="text-lg font-bold">{stats.messages}</div>
                <div className="text-xs text-muted-foreground">پیام</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-lg font-bold">{stats.conversations}</div>
                <div className="text-xs text-muted-foreground">گفتگو</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Edit Name Modal */}
        {isEditingName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => setIsEditingName(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card rounded-2xl p-6 w-full max-w-sm space-y-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-center">ویرایش نام</h3>
              <Input 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                placeholder="نام نمایشی"
                className="h-12 rounded-xl text-center"
                autoFocus
              />
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-11 rounded-xl"
                  onClick={() => setIsEditingName(false)}
                >
                  انصراف
                </Button>
                <Button 
                  className="flex-1 h-11 rounded-xl"
                  onClick={handleUpdateName}
                  disabled={saving || !displayName.trim()}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 ml-2" />}
                  ذخیره
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Menu Sections */}
        <div className="px-4 space-y-6 mt-6">
          {menuSections.map((section, sectionIdx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIdx * 0.1 }}
            >
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                {section.title}
              </h3>
              <div className="bg-card rounded-2xl border border-border/50 overflow-hidden divide-y divide-border/50">
                {section.items.map((item) => (
                  <div 
                    key={item.label}
                    onClick={item.onClick}
                    className={cn(
                      "flex items-center justify-between p-4 transition-colors",
                      item.onClick && "cursor-pointer active:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center",
                        item.status === "success" ? "bg-green-500/10" :
                        item.status === "warning" ? "bg-amber-500/10" :
                        item.status === "error" ? "bg-red-500/10" :
                        "bg-muted"
                      )}>
                        <item.icon className={cn(
                          "w-[18px] h-[18px]",
                          item.status === "success" ? "text-green-500" :
                          item.status === "warning" ? "text-amber-500" :
                          item.status === "error" ? "text-red-500" :
                          "text-muted-foreground"
                        )} />
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.value && (
                        <span className={cn(
                          "text-sm",
                          item.status === "success" ? "text-green-500" :
                          item.status === "warning" ? "text-amber-500" :
                          item.status === "error" ? "text-red-500" :
                          "text-muted-foreground"
                        )}>
                          {item.value}
                        </span>
                      )}
                      {item.onClick && (
                        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Sign Out Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              onClick={handleSignOut} 
              variant="ghost" 
              className="w-full h-14 rounded-2xl text-destructive hover:text-destructive hover:bg-destructive/10 font-medium"
            >
              <LogOut className="w-5 h-5 ml-2" />
              خروج از حساب کاربری
            </Button>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;