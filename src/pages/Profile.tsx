import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  User, Mail, LogOut, Loader2, Settings, Shield, Award, 
  Calendar, Activity, TrendingUp, Zap, ChevronRight,
  Smartphone, Clock, CheckCircle2, AlertCircle, Edit2,
  CreditCard, Crown, BarChart3, MessageSquare, Sparkles,
  Globe, Moon, Sun
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

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

  // Mock data for charts
  const weeklyActivity = [
    { day: 'شنبه', messages: 12 },
    { day: 'یکشنبه', messages: 19 },
    { day: 'دوشنبه', messages: 15 },
    { day: 'سه‌شنبه', messages: 25 },
    { day: 'چهارشنبه', messages: 22 },
    { day: 'پنجشنبه', messages: 18 },
    { day: 'جمعه', messages: 8 },
  ];

  const usageData = [
    { month: 'فروردین', usage: 65 },
    { month: 'اردیبهشت', usage: 78 },
    { month: 'خرداد', usage: 92 },
  ];

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.log('No user found, redirecting to auth');
          navigate("/auth");
          return;
        }

        setUser(user);
        setEmail(user.email || "");
        setDisplayName(user.user_metadata?.display_name || "");
        
        // Load user statistics with error handling
        try {
          const { data: conversations, error: convError } = await supabase
            .from("conversations")
            .select("id, created_at, updated_at")
            .eq("user_id", user.id);
          
          if (convError) {
            console.error('Error loading conversations:', convError);
          }

          let messageCount = 0;
          
          // Only fetch messages if we have conversations
          if (conversations && conversations.length > 0) {
            const { count, error: msgError } = await supabase
              .from("messages")
              .select("id", { count: 'exact', head: true })
              .in("conversation_id", conversations.map(c => c.id));
            
            if (msgError) {
              console.error('Error loading messages:', msgError);
            } else {
              messageCount = count || 0;
            }
          }

          setStats({
            totalMessages: messageCount,
            conversationsCount: conversations?.length || 0,
            activeToday: true,
            memberSince: user.created_at,
            lastActivity: conversations?.[0]?.updated_at || user.created_at
          });
        } catch (statsError) {
          console.error('Error loading stats:', statsError);
          // Set default stats even if there's an error
          setStats({
            totalMessages: 0,
            conversationsCount: 0,
            activeToday: false,
            memberSince: user.created_at,
            lastActivity: user.created_at
          });
        }
      } catch (error) {
        console.error('Error in checkUser:', error);
        navigate("/auth");
      } finally {
        // Always set loading to false
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });

      if (error) throw error;

      toast.success("پروفایل با موفقیت به‌روز شد");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "خطا در به‌روزرسانی پروفایل");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const calculateProfileCompletion = () => {
    let completion = 0;
    if (email) completion += 40;
    if (displayName) completion += 30;
    if (user?.email_confirmed_at) completion += 30;
    return completion;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--chat-bg))]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="min-h-screen bg-[hsl(var(--chat-bg))] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero Section */}
        <div className="mb-8 scroll-fade-in">
          <Card className="border-border/60 shadow-lg overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>
            <CardContent className="relative -mt-16 pb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
                  {/* Avatar */}
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl ring-4 ring-background">
                      {displayName?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-success w-6 h-6 rounded-full border-4 border-background flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="text-center md:text-right space-y-2">
                    <div className="flex items-center gap-2 justify-center md:justify-start flex-wrap">
                      <h1 className="text-2xl font-bold">{displayName || "کاربر نئوهوش"}</h1>
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                        <Crown className="w-3 h-3 ml-1" />
                        Free Plan
                      </Badge>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-2 justify-center md:justify-start">
                      <Mail className="w-4 h-4" />
                      {email}
                    </p>
                    
                    {/* Completion Progress */}
                    <div className="space-y-1.5 max-w-xs">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">تکمیل پروفایل</span>
                        <span className="font-semibold text-primary-600">{profileCompletion}%</span>
                      </div>
                      <Progress value={profileCompletion} className="h-2" />
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 p-3 rounded-xl text-center">
                    <div className="text-2xl font-bold text-primary-600">{stats.conversationsCount}</div>
                    <div className="text-xs text-muted-foreground">گفتگوها</div>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-xl text-center">
                    <div className="text-2xl font-bold text-primary-600">{stats.totalMessages}</div>
                    <div className="text-xs text-muted-foreground">پیام‌ها</div>
                  </div>
                </div>
              </div>

              {/* Member Info */}
              <div className="mt-6 pt-6 border-t border-border/60 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>عضو از: {new Date(stats.memberSince).toLocaleDateString("fa-IR")}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>آخرین فعالیت: {new Date(stats.lastActivity).toLocaleDateString("fa-IR")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-success" />
                  <span className="text-success font-medium">فعال امروز</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Info Card */}
            <Card className="border-border/60 shadow-sm scroll-fade-in scroll-fade-in-delay-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary-500" />
                    اطلاعات حساب
                  </div>
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      ویرایش
                    </Button>
                  )}
                </CardTitle>
                <CardDescription>
                  مدیریت اطلاعات شخصی و تنظیمات حساب کاربری
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">نام نمایشی</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={!isEditing}
                      placeholder="نام خود را وارد کنید"
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">ایمیل</Label>
                    <Input
                      id="email"
                      value={email}
                      disabled
                      className="bg-muted/50"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={saving}
                      className="bg-primary-500 hover:bg-primary-600"
                    >
                      {saving && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                      ذخیره تغییرات
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setDisplayName(user?.user_metadata?.display_name || "");
                      }}
                    >
                      انصراف
                    </Button>
                  </div>
                )}

                <Separator />

                {/* Email Verification Status */}
                <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  {user?.email_confirmed_at ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">ایمیل تایید شده</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          حساب شما در {new Date(user.email_confirmed_at).toLocaleDateString("fa-IR")} تایید شد
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">ایمیل تایید نشده</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          لطفاً ایمیل خود را تایید کنید
                        </p>
                      </div>
                      <Button size="sm" variant="outline">ارسال مجدد</Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Activity Overview Card */}
            <Card className="border-border/60 shadow-sm scroll-fade-in scroll-fade-in-delay-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-500" />
                  فعالیت هفتگی
                </CardTitle>
                <CardDescription>
                  نمودار پیام‌های ارسالی در هفته اخیر
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyActivity}>
                    <XAxis 
                      dataKey="day" 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="messages" fill="hsl(var(--primary-500))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                    <MessageSquare className="w-5 h-5 text-primary-600 mx-auto mb-1" />
                    <div className="text-lg font-bold">{stats.totalMessages}</div>
                    <div className="text-xs text-muted-foreground">کل پیام‌ها</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-accent-50 dark:bg-accent-900/20">
                    <Activity className="w-5 h-5 text-accent-600 mx-auto mb-1" />
                    <div className="text-lg font-bold">12</div>
                    <div className="text-xs text-muted-foreground">امروز</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-secondary-50 dark:bg-secondary-900/20">
                    <TrendingUp className="w-5 h-5 text-secondary-600 mx-auto mb-1" />
                    <div className="text-lg font-bold">+24%</div>
                    <div className="text-xs text-muted-foreground">رشد هفتگی</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Card */}
            <Card className="border-border/60 shadow-sm scroll-fade-in scroll-fade-in-delay-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-500" />
                  اشتراک و پرداخت
                </CardTitle>
                <CardDescription>
                  مدیریت اشتراک و صورتحساب‌های شما
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Crown className="w-5 h-5 text-amber-600" />
                        <h4 className="font-semibold">پلن رایگان</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">استفاده محدود از امکانات</p>
                    </div>
                    <Badge variant="outline" className="border-amber-300">فعال</Badge>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 gap-2">
                    <Sparkles className="w-4 h-4" />
                    ارتقا به Pro
                  </Button>
                </div>

                {/* Usage Chart */}
                <div>
                  <h4 className="text-sm font-medium mb-3">مصرف ماهانه</h4>
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={usageData}>
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <YAxis 
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                      />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="usage" 
                        stroke="hsl(var(--primary-500))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary-500))' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Settings Card */}
            <Card className="border-border/60 shadow-sm scroll-fade-in scroll-fade-in-delay-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary-500" />
                  تنظیمات
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
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

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4" />
                    <div>
                      <p className="font-medium text-sm">زبان</p>
                      <p className="text-xs text-muted-foreground">فارسی / English</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setLanguage(language === 'fa' ? 'en' : 'fa')}
                  >
                    {language === 'fa' ? 'EN' : 'FA'}
                  </Button>
                </div>

                <Separator />

                <Button 
                  variant="outline" 
                  className="w-full gap-2 text-destructive hover:bg-destructive/10"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  خروج از حساب
                </Button>
              </CardContent>
            </Card>

            {/* Security Card */}
            <Card className="border-border/60 shadow-sm scroll-fade-in scroll-fade-in-delay-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary-500" />
                  امنیت
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Smartphone className="w-5 h-5 text-primary-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">دستگاه فعلی</p>
                      <p className="text-xs text-muted-foreground">آخرین ورود: همین الان</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                </div>

                <Button variant="outline" className="w-full justify-between">
                  <span>ورودهای اخیر</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>

                <Button variant="outline" className="w-full justify-between">
                  <span>فعال‌سازی احراز دو مرحله‌ای</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Achievements Card */}
            <Card className="border-border/60 shadow-sm scroll-fade-in scroll-fade-in-delay-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary-500" />
                  دستاوردها
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 text-center">
                    <Sparkles className="w-6 h-6 text-primary-600 mx-auto mb-1" />
                    <p className="text-xs font-medium">Early Member</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 text-center opacity-50">
                    <Crown className="w-6 h-6 text-accent-600 mx-auto mb-1" />
                    <p className="text-xs font-medium">Power User</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-900/20 dark:to-secondary-800/20 text-center opacity-50">
                    <Award className="w-6 h-6 text-secondary-600 mx-auto mb-1" />
                    <p className="text-xs font-medium">Creator</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 text-center opacity-50">
                    <Zap className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                    <p className="text-xs font-medium">Super Active</p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">1 از 4 دستاورد کسب شده</p>
                  <Progress value={25} className="h-2 mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;