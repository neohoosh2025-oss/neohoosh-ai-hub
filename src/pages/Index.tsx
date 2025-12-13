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
  BookOpen,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SplashScreen } from "@/components/SplashScreen";
import { OfflinePage } from "@/components/OfflinePage";
import { usePWA } from "@/hooks/usePWA";
import { MainLayout } from "@/components/layouts/MainLayout";
import { cn } from "@/lib/utils";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image_url: string | null;
  created_at: string;
}

const Index = () => {
  const { isOnline } = usePWA();
  const [showSplash, setShowSplash] = useState(() => {
    const hasSeenSplash = sessionStorage.getItem('neohoosh_splash_seen');
    return !hasSeenSplash;
  });
  const [articles, setArticles] = useState<Article[]>([]);
  const [user, setUser] = useState<any>(null);

  const handleSplashComplete = () => {
    sessionStorage.setItem('neohoosh_splash_seen', 'true');
    setShowSplash(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const [articlesData, userData] = await Promise.all([
        supabase.from("articles").select("*").order("created_at", { ascending: false }).limit(3),
        supabase.auth.getUser()
      ]);
      
      setArticles(articlesData.data || []);
      setUser(userData.data.user);
    };
    fetchData();
  }, []);

  const quickActions = [
    { icon: MessageCircle, title: "دستیار AI", desc: "گفتگو با هوش مصنوعی", path: "/chat", gradient: "from-blue-500 to-cyan-500" },
    { icon: Image, title: "تولید تصویر", desc: "خلق تصاویر با AI", path: "/tools/image-generator", gradient: "from-purple-500 to-pink-500" },
    { icon: Mic, title: "صدا به متن", desc: "تبدیل گفتار به نوشتار", path: "/tools/voice-to-text", gradient: "from-green-500 to-emerald-500" },
    { icon: Volume2, title: "متن به صدا", desc: "تبدیل متن به گفتار", path: "/tools/text-to-voice", gradient: "from-teal-500 to-cyan-500" },
    { icon: Code, title: "تولید کد", desc: "برنامه‌نویسی با AI", path: "/tools/code-generator", gradient: "from-orange-500 to-amber-500" },
    { icon: Users, title: "NEOHI", desc: "شبکه اجتماعی", path: "/neohi", gradient: "from-pink-500 to-rose-500" },
  ];

  if (!isOnline) {
    return <OfflinePage />;
  }

  return (
    <MainLayout>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      <div className="px-4 py-6 space-y-8 pb-24">
        {/* Welcome Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <p className="text-muted-foreground text-sm">
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
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                    نسل جدید AI
                  </span>
                </div>
                
                <div className="space-y-1">
                  <h2 className="text-xl font-bold">شروع گفتگو با هوش مصنوعی</h2>
                  <p className="text-sm text-primary-foreground/80">
                    سوالات خود را بپرسید، کدنویسی کنید، محتوا تولید کنید
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

        {/* Quick Actions Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">ابزارها</h2>
            <Link to="/tools" className="text-sm text-primary flex items-center gap-1">
              همه
              <ChevronRight className="w-4 h-4 rotate-180" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                >
                  <Link to={action.path}>
                    <div className="p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all group">
                      <div className={cn(
                        "w-11 h-11 rounded-xl mb-3 flex items-center justify-center bg-gradient-to-br",
                        action.gradient
                      )}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {action.desc}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Stats Row */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { icon: Zap, value: "۱۰۰+", label: "مدل AI", color: "text-amber-500" },
            { icon: Users, value: "۵K+", label: "کاربر فعال", color: "text-blue-500" },
            { icon: TrendingUp, value: "۹۹%", label: "رضایت", color: "text-green-500" },
          ].map((stat, i) => (
            <div key={stat.label} className="p-4 rounded-2xl bg-muted/50 text-center">
              <stat.icon className={cn("w-5 h-5 mx-auto mb-2", stat.color)} />
              <div className="text-lg font-bold">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.section>

        {/* Latest Articles */}
        {articles.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold">آخرین مقالات</h2>
              </div>
              <Link to="/articles" className="text-sm text-primary flex items-center gap-1">
                همه
                <ChevronRight className="w-4 h-4 rotate-180" />
              </Link>
            </div>
            
            <div className="space-y-3">
              {articles.map((article, idx) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + idx * 0.05 }}
                >
                  <Link to={`/articles/${article.id}`}>
                    <div className="flex gap-3 p-3 rounded-2xl bg-card border border-border/50 hover:border-primary/30 transition-all group">
                      {article.image_url && (
                        <img 
                          src={article.image_url} 
                          alt={article.title}
                          className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0 py-1">
                        <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {article.excerpt}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </MainLayout>
  );
};

export default Index;
