import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageCircle, 
  Sparkles,
  Image,
  Mic,
  Volume2,
  Code,
  Users,
  ArrowLeft,
  Zap,
  TrendingUp,
  Star,
  Award,
  Target
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SplashScreen } from "@/components/SplashScreen";
import { OfflinePage } from "@/components/OfflinePage";
import { usePWA } from "@/hooks/usePWA";
import { MainLayout } from "@/components/layouts/MainLayout";
import { cn } from "@/lib/utils";

const Index = () => {
  const { isOnline } = usePWA();
  const [showSplash, setShowSplash] = useState(() => {
    const hasSeenSplash = sessionStorage.getItem('neohoosh_splash_seen');
    return !hasSeenSplash;
  });
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ messages: 0, conversations: 0 });

  const handleSplashComplete = () => {
    sessionStorage.setItem('neohoosh_splash_seen', 'true');
    setShowSplash(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
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
      }
    };
    fetchData();
  }, []);

  const tools = [
    { icon: MessageCircle, title: "دستیار AI", desc: "گفتگو با هوش مصنوعی", path: "/chat", color: "bg-blue-500" },
    { icon: Image, title: "تولید تصویر", desc: "خلق تصاویر با AI", path: "/tools/image-generator", color: "bg-purple-500" },
    { icon: Mic, title: "صدا به متن", desc: "تبدیل گفتار", path: "/tools/voice-to-text", color: "bg-emerald-500" },
    { icon: Volume2, title: "متن به صدا", desc: "تبدیل متن", path: "/tools/text-to-voice", color: "bg-cyan-500" },
    { icon: Code, title: "تولید کد", desc: "برنامه‌نویسی", path: "/tools/code-generator", color: "bg-orange-500" },
    { icon: Users, title: "NEOHI", desc: "شبکه اجتماعی", path: "/neohi", color: "bg-pink-500" },
  ];

  const features = [
    { icon: Zap, title: "سریع و قدرتمند", desc: "پاسخ‌های فوری با بهترین مدل‌ها" },
    { icon: Target, title: "دقت بالا", desc: "نتایج حرفه‌ای و دقیق" },
    { icon: Award, title: "کیفیت برتر", desc: "خروجی‌های با کیفیت بالا" },
  ];

  if (!isOnline) {
    return <OfflinePage />;
  }

  return (
    <MainLayout>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      <div className="px-4 py-6 space-y-6 pb-24">
        {/* Welcome Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-muted-foreground text-sm mb-1">
            {new Date().toLocaleDateString('fa-IR', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-2xl font-bold">
            {user ? `سلام ${user.user_metadata?.display_name || 'کاربر'}` : 'به نئوهوش خوش آمدید'} 👋
          </h1>
        </motion.section>

        {/* Hero Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Link to="/chat">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 text-primary-foreground">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                    نسل جدید AI
                  </span>
                </div>
                
                <div>
                  <h2 className="text-xl font-bold mb-1">شروع گفتگو با هوش مصنوعی</h2>
                  <p className="text-sm text-primary-foreground/80">
                    سوالات خود را بپرسید و پاسخ دریافت کنید
                  </p>
                </div>
                
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>همین الان شروع کن</span>
                  <ArrowLeft className="w-4 h-4" />
                </div>
              </div>
            </div>
          </Link>
        </motion.section>

        {/* User Stats - Only if logged in */}
        {user && (stats.messages > 0 || stats.conversations > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="p-4 rounded-2xl bg-card border border-border/50 text-center">
              <div className="text-2xl font-bold text-primary">{stats.messages}</div>
              <div className="text-xs text-muted-foreground mt-1">پیام ارسال شده</div>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border/50 text-center">
              <div className="text-2xl font-bold text-primary">{stats.conversations}</div>
              <div className="text-xs text-muted-foreground mt-1">گفتگو</div>
            </div>
          </motion.section>
        )}

        {/* Tools Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">ابزارها</h2>
            <Link to="/tools" className="text-sm text-primary">مشاهده همه</Link>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            {tools.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                >
                  <Link to={tool.path}>
                    <div className="p-4 rounded-2xl bg-card border border-border/50 text-center hover:border-primary/30 hover:shadow-md transition-all group">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center",
                        tool.color
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm mb-0.5 group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-[10px] text-muted-foreground">
                        {tool.desc}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-bold">چرا نئوهوش؟</h2>
          
          <div className="space-y-3">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Platform Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { icon: Star, value: "۱۰۰+", label: "مدل AI", color: "text-amber-500" },
            { icon: Users, value: "۵K+", label: "کاربر", color: "text-blue-500" },
            { icon: TrendingUp, value: "۹۹%", label: "رضایت", color: "text-green-500" },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-2xl bg-muted/50 text-center">
              <stat.icon className={cn("w-5 h-5 mx-auto mb-2", stat.color)} />
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.section>
      </div>
    </MainLayout>
  );
};

export default Index;