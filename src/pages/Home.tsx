import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Sparkles, 
  BookOpen, 
  MessageCircle, 
  Zap,
  Brain,
  Rocket,
  Shield,
  Users,
  TrendingUp,
  Check,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image_url: string | null;
  created_at: string;
}

const Home = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchArticles = async () => {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      
      setArticles(data || []);
      setLoading(false);
    };

    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section - Modern & Clean */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Background Gradient Mesh */}
        <div className="absolute inset-0 -z-10" style={{ background: 'var(--gradient-mesh)' }} />
        
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto text-center space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">پلتفرم هوش مصنوعی نئوهوش</span>
            </motion.div>
            
            {/* Main Heading */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold leading-tight"
            >
              <span className="bg-gradient-to-l from-primary via-secondary to-accent bg-clip-text text-transparent">
                آینده را با AI
              </span>
              <br />
              <span className="text-foreground">بسازید</span>
            </motion.h1>
            
            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            >
              ابزارهای پیشرفته هوش مصنوعی، آموزش جامع و پشتیبانی حرفه‌ای برای تحول کسب‌وکار شما
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-4 justify-center pt-4"
            >
              <Link to="/chat">
                <Button size="lg" className="gap-2 shadow-glow group">
                  <MessageCircle className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                  شروع رایگان
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              
              <Link to="/articles">
                <Button size="lg" variant="outline" className="gap-2 border-border/50 hover:border-primary/50">
                  <BookOpen className="h-5 w-5" />
                  مطالعه مقالات
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12"
            >
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary">۱۰۰+</div>
                <div className="text-sm text-muted-foreground mt-1">مقاله آموزشی</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-secondary">۲۴/۷</div>
                <div className="text-sm text-muted-foreground mt-1">پشتیبانی</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-accent">۱۰۰٪</div>
                <div className="text-sm text-muted-foreground mt-1">رضایت کاربران</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Card Based */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">چرا نئوهوش؟</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              ابزارها و امکاناتی که کسب‌وکار شما را متحول می‌کند
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: Brain,
                title: "هوش مصنوعی پیشرفته",
                desc: "دسترسی به جدیدترین مدل‌های AI مانند GPT-5، Gemini و Grok",
                color: "primary"
              },
              {
                icon: Zap,
                title: "سرعت بالا",
                desc: "پردازش فوری درخواست‌ها و پاسخ‌های لحظه‌ای",
                color: "accent"
              },
              {
                icon: Shield,
                title: "امنیت تضمین‌شده",
                desc: "حفاظت کامل از داده‌های شما با استانداردهای جهانی",
                color: "secondary"
              },
              {
                icon: Users,
                title: "پشتیبانی ۲۴/۷",
                desc: "تیم پشتیبانی حرفه‌ای همیشه در کنار شما",
                color: "primary"
              },
              {
                icon: Rocket,
                title: "به‌روزرسانی مداوم",
                desc: "دسترسی به آخرین فناوری‌ها و ابزارهای AI",
                color: "accent"
              },
              {
                icon: TrendingUp,
                title: "گزارش‌های پیشرفته",
                desc: "تحلیل و بررسی عملکرد با داشبوردهای کاربردی",
                color: "secondary"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="p-6 h-full border-border/50 hover:border-primary/50 hover:shadow-lg transition-all group">
                  <div className={`w-12 h-12 rounded-xl bg-${feature.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className={`h-6 w-6 text-${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">چگونه کار می‌کند؟</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              تنها سه مرحله تا تحول کسب‌وکار شما
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: "۱", title: "ثبت‌نام رایگان", desc: "در چند ثانیه حساب کاربری خود را بسازید" },
              { step: "۲", title: "انتخاب ابزار", desc: "از میان ابزارهای متنوع AI، ابزار موردنظر را انتخاب کنید" },
              { step: "۳", title: "شروع کار", desc: "بلافاصله شروع به استفاده از قدرت هوش مصنوعی کنید" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-6 shadow-glow">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      {!loading && articles.length > 0 && (
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">آخرین مقالات</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                با جدیدترین مطالب و آموزش‌های AI آشنا شوید
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {articles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/articles/${article.id}`}>
                    <Card className="overflow-hidden h-full hover:shadow-xl transition-all group border-border/50 hover:border-primary/50">
                      {article.image_url && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-3">
                          {article.category}
                        </span>
                        <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                          {article.excerpt}
                        </p>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/articles">
                <Button size="lg" variant="outline" className="gap-2">
                  مشاهده همه مقالات
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-12 text-center border-primary/20 shadow-glow" style={{ background: 'var(--gradient-mesh)' }}>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              آماده شروع هستید؟
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              همین امروز به هزاران کاربر راضی بپیوندید و قدرت هوش مصنوعی را تجربه کنید
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/chat">
                <Button size="lg" className="gap-2 shadow-glow-strong">
                  <MessageCircle className="h-5 w-5" />
                  شروع رایگان
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline">
                  تماس با ما
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Floating Chat Button */}
      <Link to="/chat">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-8 left-8 z-50"
        >
          <Button 
            size="icon"
            className="h-16 w-16 rounded-full shadow-glow-strong hover:shadow-glow-accent-strong transition-all"
          >
            <MessageCircle className="h-8 w-8" />
          </Button>
        </motion.div>
      </Link>
    </div>
  );
};

export default Home;
