import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  User, Mail, LogOut, Loader2, 
  Calendar, ChevronRight, Camera, Save,
  Wifi, WifiOff, Download, Bell, BellOff, Shield, MessageSquare, TrendingUp
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
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({ messages: 0, conversations: 0, growth: 0 });

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
            growth: 12
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

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.auth.updateUser({ data: { display_name: displayName } });
      await supabase.from('neohi_users').update({ display_name: displayName }).eq('id', user.id);
      toast.success("پروفایل به‌روز شد");
      setIsEditing(false);
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

  const menuItems = [
    {
      title: "اطلاعات حساب",
      items: [
        { icon: Mail, label: "ایمیل", value: user?.email, disabled: true },
        { icon: Calendar, label: "عضویت", value: new Date(user?.created_at).toLocaleDateString('fa-IR'), disabled: true },
        { icon: Shield, label: "تأیید ایمیل", value: user?.email_confirmed_at ? "تأیید شده" : "تأیید نشده", status: user?.email_confirmed_at ? "success" : "warning" },
      ]
    },
    {
      title: "وضعیت اپلیکیشن",
      items: [
        { icon: isOnline ? Wifi : WifiOff, label: "اتصال", value: isOnline ? "آنلاین" : "آفلاین", status: isOnline ? "success" : "error" },
        { icon: isNotificationsEnabled ? Bell : BellOff, label: "اعلان‌ها", value: isNotificationsEnabled ? "فعال" : "غیرفعال", action: isPushSupported ? toggleNotifications : undefined },
        { icon: Download, label: "نصب اپلیکیشن", value: isInstalled ? "نصب شده" : "نصب نشده", action: canInstall ? handleInstall : undefined },
      ]
    }
  ];

  return (
    <MainLayout>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />

      <div className="px-4 py-6 space-y-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-2xl font-bold">تنظیمات</h1>
          <p className="text-sm text-muted-foreground">مدیریت حساب و تنظیمات</p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          
          <div className="relative flex items-center gap-4">
            <motion.div 
              whileTap={{ scale: 0.95 }}
              className="relative cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" className="w-20 h-20 rounded-2xl object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-2xl font-bold">
                  {displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary rounded-full border-2 border-background flex items-center justify-center">
                {uploadingAvatar ? <Loader2 className="w-3.5 h-3.5 text-primary-foreground animate-spin" /> : <Camera className="w-3.5 h-3.5 text-primary-foreground" />}
              </div>
            </motion.div>

            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex gap-2">
                  <Input 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    placeholder="نام نمایشی"
                    className="h-10"
                  />
                  <Button onClick={handleUpdateProfile} disabled={saving} size="icon" className="h-10 w-10 flex-shrink-0">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  </Button>
                </div>
              ) : (
                <div onClick={() => setIsEditing(true)} className="cursor-pointer">
                  <h2 className="text-lg font-bold truncate">{displayName || "کاربر نئوهوش"}</h2>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { icon: MessageSquare, value: stats.messages, label: "پیام" },
            { icon: User, value: stats.conversations, label: "گفتگو" },
            { icon: TrendingUp, value: `+${stats.growth}%`, label: "رشد" },
          ].map((stat, i) => (
            <div key={stat.label} className="p-4 rounded-2xl bg-muted/50 text-center">
              <stat.icon className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Menu Sections */}
        {menuItems.map((section, sectionIdx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + sectionIdx * 0.05 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-muted-foreground px-1">{section.title}</h3>
            <div className="rounded-2xl bg-card border border-border/50 divide-y divide-border/50 overflow-hidden">
              {section.items.map((item, i) => (
                <div 
                  key={item.label}
                  onClick={item.action}
                  className={cn(
                    "flex items-center justify-between p-4",
                    item.action && "cursor-pointer hover:bg-muted/50 transition-colors"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-muted/80 flex items-center justify-center">
                      <item.icon className="w-4.5 h-4.5 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm",
                      item.status === "success" && "text-green-500",
                      item.status === "warning" && "text-amber-500",
                      item.status === "error" && "text-red-500",
                      !item.status && "text-muted-foreground"
                    )}>
                      {item.value}
                    </span>
                    {item.action && <ChevronRight className="w-4 h-4 text-muted-foreground rotate-180" />}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Button 
            onClick={handleSignOut} 
            variant="outline" 
            className="w-full h-12 rounded-2xl text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4 ml-2" />
            خروج از حساب
          </Button>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Settings;
