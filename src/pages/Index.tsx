import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Sparkles,
  Wand2,
  BookOpen,
  Users,
  ArrowLeft,
  Brain,
  Rocket,
  Check,
  Send,
  Image,
  Mic,
  Volume2,
  Code,
  Zap,
  TrendingUp,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SplashScreen } from "@/components/SplashScreen";
import { OfflinePage } from "@/components/OfflinePage";
import { usePWA } from "@/hooks/usePWA";
import { MainLayout } from "@/components/layouts/MainLayout";

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
  const { isOnline } = usePWA();
  const [showSplash, setShowSplash] = useState(() => {
    const hasSeenSplash = sessionStorage.getItem('neohoosh_splash_seen');
    return !hasSeenSplash;
  });
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);

  const handleSplashComplete = () => {
    sessionStorage.setItem('neohoosh_splash_seen', 'true');
    setShowSplash(false);
  };

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

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const tools = [
    { icon: MessageCircle, title: "دستیار AI", path: "/chat", gradient: "from-blue-500 to-cyan-500" },
    { icon: Image, title: "تولید تصویر", path: "/tools/image-generator", gradient: "from-purple-500 to-pink-500" },
    { icon: Mic, title: "صدا به متن", path: "/tools/voice-to-text", gradient: "from-green-500 to-emerald-500" },
    { icon: Volume2, title: "متن به صدا", path: "/tools/text-to-voice", gradient: "from-teal-500 to-cyan-500" },
    { icon: Code, title: "تولید کد", path: "/tools/code-generator", gradient: "from-orange-500 to-amber-500" },
    { icon: Users, title: "NEOHI", path: "/neohi", gradient: "from-pink-500 to-rose-500" },
  ];

  // Show offline page
  if (!isOnline) {
    return <OfflinePage />;
  }

  return (
    <MainLayout>
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-8 pb-12 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-secondary/3 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(76,139,245,0.1),transparent_50%)]" />
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
              className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
            >
              <span className="bg-gradient-to-l from-primary via-secondary to-accent bg-clip-text text-transparent">
                دنیای هوش مصنوعی
              </span>
              <br />
              <span className="text-foreground">همیشه کنار تو</span>
            </motion.h1>

            <motion.p 
              {...fadeInUp}
              className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto"
            >
              ابزارها، چت‌بات و کامیونیتی قدرتمند برای خلق، یادگیری و رشد
            </motion.p>

            <motion.div 
              {...fadeInUp}
              className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
            >
              <Link to="/chat">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 rounded-xl shadow-lg gap-2">
                  <MessageCircle className="w-5 h-5" />
                  شروع گفتگو با AI
                </Button>
              </Link>
              <Link to="/tools">
                <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 rounded-xl gap-2">
                  <Wand2 className="w-5 h-5" />
                  ابزارهای AI
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            {stats.length > 0 && (
              <motion.div 
                {...fadeInUp}
                className="grid grid-cols-3 gap-3 pt-8"
              >
                {stats.slice(0, 3).map((stat, i) => (
                  <div key={stat.stat_key} className="text-center p-4 rounded-2xl bg-card/50 border border-border/30 backdrop-blur-sm">
                    <div className={`text-2xl font-bold ${i === 0 ? 'text-primary' : i === 1 ? 'text-secondary' : 'text-accent'}`}>
                      {stat.stat_value}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{stat.stat_label}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Quick Tools Grid */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">ابزارهای محبوب</h2>
            <Link to="/tools">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                همه ابزارها
                <ArrowLeft className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {tools.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Link to={tool.path}>
                    <Card className="p-4 h-full border-border/50 hover:border-primary/30 hover:shadow-lg transition-all group text-center">
                      <motion.div 
                        className={`w-12 h-12 mx-auto rounded-xl mb-3 flex items-center justify-center bg-gradient-to-br ${tool.gradient}`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <h3 className="font-medium text-xs group-hover:text-primary transition-colors">
                        {tool.title}
                      </h3>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      {features.length > 0 && (
        <section className="py-8 px-4 bg-muted/20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-center mb-6">چرا نئوهوش؟</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {features.map((item, i) => {
                const iconMap: { [key: string]: any } = {
                  'MessageCircle': MessageCircle,
                  'Wand2': Wand2,
                  'BookOpen': BookOpen,
                  'Sparkles': Sparkles,
                  'Brain': Brain,
                  'Zap': Zap
                };
                const Icon = iconMap[item.icon_name] || Sparkles;
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="p-5 h-full border-border/50 hover:border-primary/30 transition-colors">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-bold text-base mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                      {item.features_list && (
                        <div className="flex flex-wrap gap-1.5">
                          {item.features_list.slice(0, 3).map((feature: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0.5">
                              <Check className="w-2.5 h-2.5 ml-1" />
                              {feature}
                            </Badge>
                          ))}
                        </div>
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
      <section className="py-10 px-4">
        <div className="max-w-lg mx-auto">
          <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-primary/20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
            <CardContent className="p-6 text-center relative">
              <motion.div 
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Users className="w-8 h-8 text-white" />
              </motion.div>
              <Badge className="mb-3 bg-accent/20 text-accent border-accent/30">
                <Star className="w-3 h-3 ml-1" />
                جدید
              </Badge>
              <h3 className="text-xl font-bold mb-2">NEOHI</h3>
              <p className="text-sm text-muted-foreground mb-5">
                کامیونیتی اختصاصی نئوهوش برای گفتگو، یادگیری و شبکه‌سازی
              </p>
              <Link to="/neohi">
                <Button className="w-full h-11 rounded-xl gap-2">
                  <Send className="w-4 h-4" />
                  عضویت در NEOHI
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Latest Articles */}
      {articles.length > 0 && (
        <section className="py-8 px-4 pb-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">آخرین مقالات</h2>
              <Link to="/articles">
                <Button variant="ghost" size="sm" className="text-xs gap-1">
                  مشاهده همه
                  <ArrowLeft className="w-3.5 h-3.5" />
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
    </MainLayout>
  );
};

export default Index;
