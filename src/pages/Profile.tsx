import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  User, Mail, LogOut, Loader2, Shield, Award, 
  Calendar, Activity, TrendingUp, Zap, ChevronRight,
  Smartphone, Clock, CheckCircle2, AlertCircle, Edit2,
  Crown, BarChart3, MessageSquare, Sparkles,
  Wifi, WifiOff, Download, Camera, Save, Settings,
  Bot, Wand2, BookOpen
} from "lucide-react";
import { usePWA } from "@/hooks/usePWA";
import { Link, useLocation } from "react-router-dom";

interface UserStats {
  totalMessages: number;
  conversationsCount: number;
  activeToday: boolean;
  memberSince: string;
  lastActivity: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isInstalled, canInstall, installPrompt, isOnline, notificationPermission, requestPermission } = usePWA();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<UserStats>({
    totalMessages: 0,
    conversationsCount: 0,
    activeToday: false,
    memberSince: "",
    lastActivity: ""
  });
  const [weeklyActivity, setWeeklyActivity] = useState<Array<{ day: string; messages: number }>>([]);
  const [todayMessages, setTodayMessages] = useState(0);
  const [weeklyGrowth, setWeeklyGrowth] = useState(0);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          navigate("/auth");
          return;
        }

        setUser(user);
        setEmail(user.email || "");
        setDisplayName(user.user_metadata?.display_name || "");
        setAvatarUrl(user.user_metadata?.avatar_url || null);
        
        // Also check NeoHi profile for avatar
        const { data: neohiUser } = await supabase
          .from('neohi_users')
          .select('avatar_url, display_name')
          .eq('id', user.id)
          .single();
        
        if (neohiUser?.avatar_url) {
          setAvatarUrl(neohiUser.avatar_url);
        }
        if (neohiUser?.display_name && !user.user_metadata?.display_name) {
          setDisplayName(neohiUser.display_name);
        }
        
        try {
          const { data: conversations } = await supabase
            .from("conversations")
            .select("id, created_at, updated_at")
            .eq("user_id", user.id)
            .order('updated_at', { ascending: false });

          let messageCount = 0;
          let allMessages: any[] = [];
          let latestActivity = user.created_at;
          
          if (conversations && conversations.length > 0) {
            const { data: messages, count } = await supabase
              .from("messages")
              .select("id, created_at, conversation_id", { count: 'exact' })
              .in("conversation_id", conversations.map(c => c.id))
              .order('created_at', { ascending: false });
            
            messageCount = count || 0;
            allMessages = messages || [];
            if (messages && messages.length > 0) {
              latestActivity = messages[0].created_at;
            }
          }

          const weekDays = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
          const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return date;
          });

          const weeklyData = last7Days.map((date) => {
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));
            
            const messagesCount = allMessages.filter(msg => {
              const msgDate = new Date(msg.created_at);
              return msgDate >= dayStart && msgDate <= dayEnd;
            }).length;

            return {
              day: weekDays[date.getDay()],
              messages: messagesCount
            };
          });
          setWeeklyActivity(weeklyData);

          const today = new Date();
          const todayStart = new Date(today.setHours(0, 0, 0, 0));
          const todayEnd = new Date(today.setHours(23, 59, 59, 999));
          const todayCount = allMessages.filter(msg => {
            const msgDate = new Date(msg.created_at);
            return msgDate >= todayStart && msgDate <= todayEnd;
          }).length;
          setTodayMessages(todayCount);

          const thisWeekStart = new Date();
          thisWeekStart.setDate(thisWeekStart.getDate() - 7);
          const lastWeekStart = new Date();
          lastWeekStart.setDate(lastWeekStart.getDate() - 14);
          
          const thisWeekCount = allMessages.filter(msg => new Date(msg.created_at) >= thisWeekStart).length;
          const lastWeekCount = allMessages.filter(msg => {
            const d = new Date(msg.created_at);
            return d >= lastWeekStart && d < thisWeekStart;
          }).length;
          
          setWeeklyGrowth(lastWeekCount > 0 ? Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100) : 0);

          setStats({
            totalMessages: messageCount,
            conversationsCount: conversations?.length || 0,
            activeToday: todayCount > 0,
            memberSince: user.created_at,
            lastActivity: latestActivity
          });
        } catch {
          setStats({
            totalMessages: 0,
            conversationsCount: 0,
            activeToday: false,
            memberSince: user.created_at,
            lastActivity: user.created_at
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

    if (!file.type.startsWith('image/')) {
      toast.error('لطفاً یک فایل تصویری انتخاب کنید');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حداکثر حجم فایل ۵ مگابایت است');
      return;
    }

    setUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('neohi-avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('neohi-avatars')
        .getPublicUrl(fileName);

      // Update auth user metadata
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      // Update or insert NeoHi profile
      const { data: existingProfile } = await supabase
        .from('neohi_users')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        await supabase
          .from('neohi_users')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);
      } else {
        await supabase
          .from('neohi_users')
          .insert({
            id: user.id,
            username: user.email?.split('@')[0] || `user_${user.id.slice(0, 8)}`,
            avatar_url: publicUrl,
            display_name: displayName
          });
      }

      setAvatarUrl(publicUrl);
      toast.success('عکس پروفایل به‌روز شد');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('خطا در آپلود عکس');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });
      if (error) throw error;
      
      // Also update NeoHi profile
      await supabase
        .from('neohi_users')
        .update({ display_name: displayName })
        .eq('id', user.id);
      
      toast.success("پروفایل به‌روز شد");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "خطا در به‌روزرسانی");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const profileCompletion = () => {
    let c = 0;
    if (email) c += 30;
    if (displayName) c += 25;
    if (avatarUrl) c += 25;
    if (user?.email_confirmed_at) c += 20;
    return c;
  };

  const maxMessages = Math.max(...weeklyActivity.map(d => d.messages), 1);

  // Navigation items
  const navItems = [
    { icon: Bot, label: "چت", href: "/chat", path: "/chat" },
    { icon: Wand2, label: "ابزارها", href: "/tools", path: "/tools" },
    { icon: BookOpen, label: "مقالات", href: "/articles", path: "/articles" },
    { icon: Settings, label: "تنظیمات", href: "/profile", path: "/profile" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hidden file input for avatar upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarUpload}
        className="hidden"
      />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50"
        >
          <div className="flex items-center justify-between px-4 h-14">
            <div />
            <h1 className="font-semibold">تنظیمات</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-full"
            >
              {isEditing ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Edit2 className="w-5 h-5" />}
            </Button>
          </div>
        </motion.div>

        <div className="p-4 space-y-6 pb-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-6"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-3xl" />
            
            <div className="relative flex flex-col items-center text-center space-y-4">
              {/* Avatar with upload */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-3xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {displayName?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <motion.div 
                  className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full border-4 border-background flex items-center justify-center cursor-pointer"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-white" />
                  )}
                </motion.div>
              </motion.div>

              {/* Name & Email */}
              <div className="space-y-1">
                <AnimatePresence mode="wait">
                  {isEditing ? (
                    <motion.div
                      key="editing"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="space-y-3"
                    >
                      <Input
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="نام نمایشی"
                        className="text-center bg-background/50 border-border/50"
                      />
                      <Button
                        onClick={handleUpdateProfile}
                        disabled={saving}
                        size="sm"
                        className="gap-2"
                      >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        ذخیره
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="display"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <h2 className="text-xl font-bold">{displayName || "کاربر نئوهوش"}</h2>
                      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {email}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Badge */}
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-lg">
                <Crown className="w-3 h-3 ml-1" />
                پلن رایگان
              </Badge>

              {/* Completion */}
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">تکمیل پروفایل</span>
                  <span className="font-semibold text-primary">{profileCompletion()}%</span>
                </div>
                <Progress value={profileCompletion()} className="h-1.5" />
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { icon: MessageSquare, value: stats.totalMessages, label: 'پیام', color: 'from-blue-500/10 to-blue-500/5' },
              { icon: Activity, value: stats.conversationsCount, label: 'گفتگو', color: 'from-purple-500/10 to-purple-500/5' },
              { icon: TrendingUp, value: `${weeklyGrowth > 0 ? '+' : ''}${weeklyGrowth}%`, label: 'رشد', color: 'from-green-500/10 to-green-500/5' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} border border-border/30`}
              >
                <stat.icon className="w-5 h-5 text-muted-foreground mb-2" />
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Activity Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-2xl bg-card border border-border/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <span className="font-medium">فعالیت هفتگی</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {todayMessages} امروز
              </Badge>
            </div>
            
            <div className="flex items-end justify-between gap-1 h-24">
              {weeklyActivity.map((day, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${(day.messages / maxMessages) * 100}%` }}
                  transition={{ delay: 0.4 + i * 0.05, duration: 0.5, ease: "easeOut" }}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div 
                    className={`w-full rounded-t-lg transition-colors ${
                      day.messages > 0 
                        ? 'bg-gradient-to-t from-primary to-primary/70' 
                        : 'bg-muted/30'
                    }`}
                    style={{ minHeight: day.messages > 0 ? '8px' : '4px', height: '100%' }}
                  />
                </motion.div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {weeklyActivity.map((day, i) => (
                <span key={i} className="text-[10px] text-muted-foreground flex-1 text-center">
                  {day.day}
                </span>
              ))}
            </div>
          </motion.div>

          {/* PWA Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-muted-foreground px-1">وضعیت اپلیکیشن</h3>
            
            <div className="rounded-2xl bg-card border border-border/50 overflow-hidden divide-y divide-border/50">
              {/* Network Status */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isOnline ? 'bg-green-500/10' : 'bg-red-500/10'
                  }`}>
                    {isOnline ? <Wifi className="w-5 h-5 text-green-500" /> : <WifiOff className="w-5 h-5 text-red-500" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">وضعیت اتصال</p>
                    <p className="text-xs text-muted-foreground">{isOnline ? 'آنلاین' : 'آفلاین'}</p>
                  </div>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
              </div>

              {/* Install Status */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isInstalled ? 'bg-green-500/10' : 'bg-primary/10'
                  }`}>
                    <Download className={`w-5 h-5 ${isInstalled ? 'text-green-500' : 'text-primary'}`} />
                  </div>
                  <div>
                    <p className="font-medium text-sm">نصب اپلیکیشن</p>
                    <p className="text-xs text-muted-foreground">
                      {isInstalled ? 'نصب شده' : 'نصب نشده'}
                    </p>
                  </div>
                </div>
                {canInstall && (
                  <Button size="sm" onClick={installPrompt || undefined} className="rounded-full">
                    نصب
                  </Button>
                )}
                {isInstalled && (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                )}
              </div>
            </div>
          </motion.div>

          {/* Security & Account */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-muted-foreground px-1">اطلاعات حساب</h3>
            
            <div className="rounded-2xl bg-card border border-border/50 overflow-hidden divide-y divide-border/50">
              {/* Device */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">دستگاه فعلی</p>
                    <p className="text-xs text-muted-foreground">همین الان</p>
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>

              {/* Member Since */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">تاریخ عضویت</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(stats.memberSince).toLocaleDateString("fa-IR")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email Status */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    user?.email_confirmed_at ? 'bg-green-500/10' : 'bg-amber-500/10'
                  }`}>
                    {user?.email_confirmed_at ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">تایید ایمیل</p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email_confirmed_at ? 'تایید شده' : 'تایید نشده'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Last Activity */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <Clock className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">آخرین فعالیت</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(stats.lastActivity).toLocaleDateString("fa-IR")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sign Out */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button 
              variant="outline" 
              className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 rounded-xl h-12"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5" />
              خروج از حساب
            </Button>
          </motion.div>

          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-muted-foreground px-1">دستاوردها</h3>
            
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: Sparkles, label: 'تازه‌وارد', active: true, color: 'from-blue-500' },
                { icon: Crown, label: 'حرفه‌ای', active: stats.totalMessages > 100, color: 'from-amber-500' },
                { icon: Award, label: 'خالق', active: stats.conversationsCount > 10, color: 'from-purple-500' },
                { icon: Zap, label: 'فعال', active: stats.activeToday, color: 'from-green-500' },
              ].map((badge, i) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                  className={`p-3 rounded-2xl text-center transition-all ${
                    badge.active 
                      ? `bg-gradient-to-br ${badge.color}/10 to-transparent border border-primary/30` 
                      : 'bg-muted/30 opacity-50'
                  }`}
                >
                  <badge.icon className={`w-6 h-6 mx-auto mb-1 ${
                    badge.active ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <p className="text-[10px] font-medium">{badge.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Telegram-style Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-4 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[64px] relative"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="relative"
                >
                  <Icon className={`w-6 h-6 transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                </motion.div>
                <span className={`text-[11px] mt-1 font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Profile;
