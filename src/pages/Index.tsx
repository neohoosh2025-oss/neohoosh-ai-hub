import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Sparkles,
  Bot,
  Wand2,
  BookOpen,
  Users,
  Settings,
  ArrowLeft,
  Brain,
  Rocket,
  Check,
  Send
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/neohoosh-logo-new.png";
import { cn } from "@/lib/utils";
import { SplashScreen } from "@/components/SplashScreen";
import { OfflinePage } from "@/components/OfflinePage";
import { usePWA } from "@/hooks/usePWA";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image_url: string | null;
  created_at: string;
}

interface Stat {
  stat_key: string;
  stat_value: string;
  stat_label: string;
}

interface Feature {
  id: string;
  title: string;
  description: string;
  icon_name: string;
  gradient: string;
  features_list: any;
}

const Index = () => {
  const location = useLocation();
  const { isOnline } = usePWA();
  const [showSplash, setShowSplash] = useState(() => {
    const hasSeenSplash = sessionStorage.getItem('neohoosh_splash_seen');
    return !hasSeenSplash;
  });
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [user, setUser] = useState<any>(null);

  const handleSplashComplete = () => {
    sessionStorage.setItem('neohoosh_splash_seen', 'true');
    setShowSplash(false);
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const [articlesData, statsData, featuresData] = await Promise.all([
        supabase.from("articles").select("*").order("created_at", { ascending: false }).limit(3),
        supabase.from("homepage_stats").select("*").eq("is_active", true).order("display_order"),
        supabase.from("homepage_features").select("*").eq("is_active", true).order("display_order")
      ]);
      
      setArticles(articlesData.data || []);
      setStats(statsData.data || []);
      setFeatures(featuresData.data || []);
    };
    fetchData();
  }, []);

  const navItems = [
    { icon: Bot, label: "چت", href: "/chat", path: "/chat" },
    { icon: Users, label: "نئوهای", href: "/neohi", path: "/neohi" },
    { icon: Wand2, label: "ابزارها", href: "/tools", path: "/tools" },
    { icon: BookOpen, label: "مقالات", href: "/articles", path: "/articles" },
    { icon: Settings, label: "تنظیمات", href: "/profile", path: "/profile" },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  // Show offline page
  if (!isOnline) {
    return <OfflinePage />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-12">
          <div className="flex items-center gap-2">
            <img src={logo} alt="NeoHoosh" className="w-7 h-7" />
            <span className="font-bold text-base">نئوهوش</span>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/profile">
                <Button variant="ghost" size="sm" className="rounded-full h-8 px-3 text-xs">
                  پروفایل
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="rounded-full h-8 px-4 text-xs">
                  ورود
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-16">
        {/* Hero Section */}
        <section className="relative pt-8 pb-12 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          </div>
          
          <div className="container mx-auto px-4">
            <motion.div
              initial="initial"
              animate="animate"
              className="max-w-2xl mx-auto text-center space-y-6"
            >
              <motion.div {...fadeInUp} className="flex justify-center">
                <Badge className="px-4 py-2 text-sm shadow-lg bg-primary/10 border-primary/30 text-primary">
                  <Sparkles className="w-3.5 h-3.5 ml-2" />
                  نسل جدید هوش مصنوعی
                </Badge>
              </motion.div>

              <motion.h1 
                {...fadeInUp}
                className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight"
              >
                <span className="bg-gradient-to-l from-primary via-secondary to-accent bg-clip-text text-transparent">
                  دنیای هوش مصنوعی
                </span>
                <br />
                <span className="text-foreground">همیشه کنار تو</span>
              </motion.h1>

              <motion.p 
                {...fadeInUp}
                className="text-sm sm:text-base text-muted-foreground leading-relaxed"
              >
                ابزارها، چت‌بات و کامیونیتی قدرتمند برای خلق، یادگیری و رشد
              </motion.p>

              <motion.div 
                {...fadeInUp}
                className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
              >
                <Link to="/chat">
                  <Button size="lg" className="w-full sm:w-auto h-12 px-6 rounded-xl shadow-lg">
                    <MessageCircle className="ml-2 w-5 h-5" />
                    شروع گفتگو با AI
                  </Button>
                </Link>
                <Link to="/tools">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-6 rounded-xl">
                    <Wand2 className="ml-2 w-5 h-5" />
                    ابزارهای AI
                  </Button>
                </Link>
              </motion.div>

              {/* Stats */}
              {stats.length > 0 && (
                <motion.div 
                  {...fadeInUp}
                  className="grid grid-cols-3 gap-4 pt-8"
                >
                  {stats.slice(0, 3).map((stat, i) => (
                    <div key={stat.stat_key} className="text-center p-3 rounded-xl bg-muted/30">
                      <div className={`text-xl font-bold ${i === 0 ? 'text-primary' : i === 1 ? 'text-secondary' : 'text-accent'}`}>
                        {stat.stat_value}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{stat.stat_label}</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        {features.length > 0 && (
          <section className="py-8 px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl font-bold text-center mb-6">امکانات نئوهوش</h2>
              <div className="grid gap-4">
                {features.map((item, i) => {
                  const iconMap: { [key: string]: any } = {
                    'MessageCircle': MessageCircle,
                    'Wand2': Wand2,
                    'BookOpen': BookOpen,
                    'Sparkles': Sparkles,
                    'Brain': Brain
                  };
                  const Icon = iconMap[item.icon_name] || MessageCircle;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <Card className="border border-border/50 hover:border-primary/30 transition-colors">
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{item.title}</CardTitle>
                              <CardDescription className="text-xs">{item.description}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        {item.features_list && (
                          <CardContent className="pt-0">
                            <div className="flex flex-wrap gap-2">
                              {item.features_list.slice(0, 3).map((feature: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-[10px]">
                                  <Check className="w-2.5 h-2.5 ml-1" />
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* NEOHI CTA */}
        <section className="py-8 px-4">
          <div className="max-w-lg mx-auto">
            <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-primary/20 overflow-hidden">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">NEOHI</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  کامیونیتی اختصاصی نئوهوش برای گفتگو و شبکه‌سازی
                </p>
                <Link to="/neohi">
                  <Button className="w-full h-10 rounded-xl">
                    <Send className="ml-2 w-4 h-4" />
                    عضویت در NEOHI
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Latest Articles */}
        {articles.length > 0 && (
          <section className="py-8 px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">آخرین مقالات</h2>
                <Link to="/articles">
                  <Button variant="ghost" size="sm" className="text-xs">
                    مشاهده همه
                    <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  </Button>
                </Link>
              </div>
              <div className="grid gap-3">
                {articles.map((article) => (
                  <Link key={article.id} to={`/articles/${article.id}`}>
                    <Card className="hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4 flex gap-4">
                        {article.image_url && (
                          <img 
                            src={article.image_url} 
                            alt={article.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm mb-1 line-clamp-1">{article.title}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">{article.excerpt}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50">
        <div className="flex items-center justify-around h-14 px-2 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === "/" && item.path === "/chat";
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex flex-col items-center justify-center p-1.5 rounded-xl transition-all duration-200 min-w-[52px]"
              >
                <motion.div whileTap={{ scale: 0.9 }} className="relative">
                  <Icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                </motion.div>
                <span className={cn(
                  "text-[10px] mt-0.5 font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
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

export default Index;
