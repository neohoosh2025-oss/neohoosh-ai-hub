import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  User, Mail, LogOut, Loader2, Settings, Shield, Award, 
  Calendar, Activity, TrendingUp, Zap, ChevronRight,
  Smartphone, Clock, CheckCircle2, AlertCircle, Edit2,
  CreditCard, Crown, BarChart3, MessageSquare, Sparkles,
  Globe, Moon, Sun, Bell, Wifi, WifiOff, Download,
  ChevronLeft, X, Save
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import { usePWA } from "@/hooks/usePWA";
import { PWALayout } from "@/components/layouts/PWALayout";

interface UserStats {
  totalMessages: number;
  conversationsCount: number;
  activeToday: boolean;
  memberSince: string;
  lastActivity: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { isInstalled, canInstall, installPrompt, isOnline, notificationPermission, requestPermission } = usePWA();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
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

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });
      if (error) throw error;
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
    if (email) c += 40;
    if (displayName) c += 30;
    if (user?.email_confirmed_at) c += 30;
    return c;
  };

  const maxMessages = Math.max(...weeklyActivity.map(d => d.messages), 1);

  if (loading) {
    return (
      <PWALayout>
        <div className="flex-1 flex items-center justify-center">
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
      </PWALayout>
    );
  }

  return (
    <PWALayout>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50"
        >
          <div className="flex items-center justify-between px-4 h-14">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="font-semibold">پروفایل</h1>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-full"
            >
              {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
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
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-3xl" />
            
            <div className="relative flex flex-col items-center text-center space-y-4">
              {/* Avatar */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {displayName?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full border-4 border-background flex items-center justify-center"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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

          {/* Settings Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-muted-foreground px-1">تنظیمات</h3>
            
            <div className="rounded-2xl bg-card border border-border/50 overflow-hidden divide-y divide-border/50">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    {theme === 'dark' ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">حالت تاریک</p>
                    <p className="text-xs text-muted-foreground">تغییر تم رنگی</p>
                  </div>
                </div>
                <Switch 
                  checked={theme === 'dark'}
                  onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                />
              </div>

              {/* Language */}
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">زبان</p>
                    <p className="text-xs text-muted-foreground">{language === 'fa' ? 'فارسی' : 'English'}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
                  className="rounded-full"
                >
                  {language === 'fa' ? 'EN' : 'FA'}
                </Button>
              </div>

              {/* Notifications */}
              <button 
                onClick={async () => {
                  if (notificationPermission !== 'granted') {
                    await requestPermission();
                    toast.success('اعلان‌ها فعال شد');
                  }
                }}
                className="flex items-center justify-between p-4 w-full hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">اعلان‌ها</p>
                    <p className="text-xs text-muted-foreground">
                      {notificationPermission === 'granted' ? 'فعال' : 'غیرفعال'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </motion.div>

          {/* PWA Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-muted-foreground px-1">امنیت</h3>
            
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
                    <p className="font-medium text-sm">عضویت</p>
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
            </div>
          </motion.div>

          {/* Sign Out */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
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
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-muted-foreground px-1">دستاوردها</h3>
            
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: Sparkles, label: 'تازه‌وارد', active: true, color: 'from-blue-500' },
                { icon: Crown, label: 'حرفه‌ای', active: false, color: 'from-amber-500' },
                { icon: Award, label: 'خالق', active: false, color: 'from-purple-500' },
                { icon: Zap, label: 'فعال', active: false, color: 'from-green-500' },
              ].map((badge, i) => (
                <motion.div
                  key={badge.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  className={`p-3 rounded-2xl text-center transition-all ${
                    badge.active 
                      ? `bg-gradient-to-br ${badge.color}/10 to-transparent border border-${badge.color.replace('from-', '')}/30` 
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
    </PWALayout>
  );
};

export default Profile;
