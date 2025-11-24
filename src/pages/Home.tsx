import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Star,
  MessageSquare,
  Share2,
  Image as ImageIcon,
  Video,
  Globe,
  Code,
  FileText,
  Wand2,
  Languages,
  Send,
  Calendar,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/neohoosh-logo-new.png";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image_url: string | null;
  created_at: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar_url: string | null;
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
  features_list: any; // JSON type from Supabase
}

interface Tool {
  id: string;
  title: string;
  icon_name: string;
  color: string;
  link_url: string;
}

const Home = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [articlesData, testimonialsData, statsData, featuresData, toolsData] = await Promise.all([
        supabase.from("articles").select("*").order("created_at", { ascending: false }).limit(3),
        supabase.from("testimonials").select("*").eq("approved", true).order("display_order"),
        supabase.from("homepage_stats").select("*").eq("is_active", true).order("display_order"),
        supabase.from("homepage_features").select("*").eq("is_active", true).order("display_order"),
        supabase.from("homepage_tools").select("*").eq("is_active", true).order("display_order")
      ]);
      
      setArticles(articlesData.data || []);
      setTestimonials(testimonialsData.data || []);
      setStats(statsData.data || []);
      setFeatures(featuresData.data || []);
      setTools(toolsData.data || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Optimized for Mobile */}
      <section className="relative pt-16 sm:pt-20 md:pt-24 pb-20 sm:pb-28 md:pb-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0" style={{ background: 'var(--gradient-mesh)' }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(76,139,245,0.1),transparent_50%)]" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-6xl mx-auto text-center space-y-6 sm:space-y-8"
          >
            {/* Logo Removed - Clean Design */}

            {/* Badge - Responsive */}
            <motion.div variants={fadeInUp} className="flex justify-center">
              <Badge className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base shadow-glow bg-primary/10 border-primary/30 text-primary hover:bg-primary/20">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-2 animate-pulse" />
                نسل جدید هوش مصنوعی
              </Badge>
            </motion.div>

            {/* Main Heading - Mobile Optimized */}
            <motion.h1 
              variants={fadeInUp}
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-[1.4] font-display px-2"
            >
              <span className="bg-gradient-to-l from-primary via-secondary to-accent bg-clip-text text-transparent block mb-4 sm:mb-6 pb-2">
                نسل جدید هوش مصنوعی
              </span>
              <span className="text-foreground block">
                در ایران، همیشه کنار تو
              </span>
            </motion.h1>

            {/* Sub Heading - Readable on Mobile */}
            <motion.p 
              variants={fadeInUp}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light px-2"
            >
              ابزارها، چت‌بات و کامیونیتی قدرتمند برای خلق، یادگیری و رشد
            </motion.p>

            {/* Chat Preview - Compact on Mobile */}
            <motion.div 
              variants={fadeInUp}
              className="max-w-md mx-auto px-2"
            >
              <Card className="bg-card/50 backdrop-blur-xl border-primary/20 shadow-glow">
                <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <div className="flex gap-2 sm:gap-3 items-start">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    </div>
                    <div className="flex-1 bg-primary/5 rounded-2xl rounded-tr-sm p-2.5 sm:p-3 text-xs sm:text-sm text-right">
                      سلام! چطور می‌تونم کمکت کنم؟
                    </div>
                  </div>
                  <div className="flex gap-2 sm:gap-3 items-start flex-row-reverse">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                    </div>
                    <div className="flex-1 bg-accent/5 rounded-2xl rounded-tl-sm p-2.5 sm:p-3 text-xs sm:text-sm text-right">
                      می‌خوام یک استراتژی بازاریابی بنویسم
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA Buttons - Mobile Friendly */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center pt-4 sm:pt-6 px-2"
            >
              <Link to="/chat" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 shadow-glow-strong hover:shadow-glow-accent-strong transition-all group">
                  <MessageCircle className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
                  شروع گفتگو با AI
                  <ArrowLeft className="mr-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/profile" className="w-full sm:w-auto">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5"
                >
                  <Rocket className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                  ورود به پروفایل
                </Button>
              </Link>
            </motion.div>

            {/* Stats - Mobile Optimized Grid */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 pt-12 sm:pt-16 max-w-3xl mx-auto px-2"
            >
              {stats.map((stat, i) => (
                <div key={stat.stat_key} className="text-center p-4 sm:p-5 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/50">
                  <div className={`text-3xl sm:text-4xl md:text-5xl font-bold ${i === 0 ? 'text-primary' : i === 1 ? 'text-secondary' : 'text-accent'} mb-2`}>
                    {stat.stat_value}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{stat.stat_label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Mobile First */}
      <section className="py-16 sm:py-20 md:py-24 relative">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14 md:mb-16 px-2"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 font-display">
              امکانات نئوهوش
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              سه ستون اصلی پلتفرم هوش مصنوعی نئوهوش
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            {features.map((item, i) => {
              const iconMap: { [key: string]: any } = {
                'MessageCircle': MessageCircle,
                'Wand2': Wand2,
                'BookOpen': BookOpen,
                'Sparkles': Sparkles,
                'Brain': Brain,
                'Zap': Zap
              };
              const Icon = iconMap[item.icon_name] || MessageCircle;
              
              return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-2 border-border/50 hover:border-primary/50 hover:shadow-xl transition-all group">
                  <CardHeader className="pb-4">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
                    </div>
                    <CardTitle className="text-lg sm:text-xl md:text-2xl mb-2 sm:mb-3">{item.title}</CardTitle>
                    <CardDescription className="text-sm sm:text-base leading-relaxed">{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 sm:space-y-3">
                      {item.features_list?.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 sm:gap-3">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-primary" />
                          </div>
                          <span className="text-xs sm:text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            );
            })}
          </div>
        </div>
      </section>

      {/* NEOHI Section - Mobile Optimized */}
      <section className="py-20 sm:py-28 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(76,139,245,0.15),transparent_70%)]" />
        
        <div className="container mx-auto px-4 sm:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            <Card className="border-2 border-primary/30 shadow-glow-strong bg-card/80 backdrop-blur-xl overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Content - Mobile First */}
                <div className="p-6 sm:p-10 md:p-12 lg:p-16 space-y-6 sm:space-y-8 order-2 md:order-1">
                  <div>
                    <Badge className="mb-4 sm:mb-6 text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-2 animate-pulse" />
                      معرفی NEOHI
                    </Badge>
                    
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
                      <span className="bg-gradient-to-l from-primary via-secondary to-accent bg-clip-text text-transparent">
                        NEOHI
                      </span>
                    </h2>
                    
                    <p className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground mb-3 sm:mb-4">
                      جایی برای گفتگو، یادگیری و شبکه‌سازی
                    </p>
                    
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
                      کامیونیتی اختصاصی نئوهوش با تجربه کاربری سریع و روان؛
                      برای گفتگو، همکاری و رشد در دنیای هوش مصنوعی.
                    </p>
                  </div>

                  {/* Features - Compact Mobile Grid */}
                  <div className="grid grid-cols-2 gap-4 sm:gap-5 md:gap-6">
                    {[
                      { icon: Users, label: "گروه‌های تخصصی" },
                      { icon: MessageSquare, label: "کانال‌ها" },
                      { icon: Share2, label: "پرسش و پاسخ" },
                      { icon: ImageIcon, label: "اشتراک رسانه" },
                      { icon: Globe, label: "دسترسی آسان" },
                      { icon: Video, label: "پخش زنده" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 sm:p-3.5 md:p-4 rounded-xl bg-background/50 border border-border/50">
                        <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6 text-primary" />
                        </div>
                        <span className="text-xs sm:text-sm font-medium leading-tight">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link to="/neohi" className="block">
                    <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-glow-strong group">
                      <Send className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                      عضویت در NEOHI
                      <ArrowLeft className="mr-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>

                {/* Right Side - UI Mockup */}
                <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-8 lg:p-12 flex items-center justify-center">
                  <div className="w-full max-w-sm">
                    {/* Chat Interface Mockup */}
                    <div className="bg-background rounded-2xl shadow-2xl overflow-hidden border-2 border-border/50">
                      {/* Header */}
                      <div className="bg-primary p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-semibold">گروه هوش مصنوعی</div>
                          <div className="text-white/70 text-xs">۲۴۳ عضو آنلاین</div>
                        </div>
                      </div>
                      
                      {/* Messages */}
                      <div className="p-4 space-y-3 h-64 bg-muted/30">
                        <div className="flex gap-2 items-start">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0" />
                          <div className="bg-card rounded-2xl rounded-tr-sm p-3 text-sm max-w-[70%] shadow-sm">
                            آیا کسی تجربه کار با GPT-5 داره؟
                          </div>
                        </div>
                        <div className="flex gap-2 items-start">
                          <div className="w-8 h-8 rounded-full bg-secondary/20 flex-shrink-0" />
                          <div className="bg-card rounded-2xl rounded-tr-sm p-3 text-sm max-w-[70%] shadow-sm">
                            بله! من یک چت‌بات ساختم باهاش
                          </div>
                        </div>
                        <div className="flex gap-2 items-start">
                          <div className="w-8 h-8 rounded-full bg-accent/20 flex-shrink-0" />
                          <div className="bg-card rounded-2xl rounded-tr-sm p-3 text-sm max-w-[70%] shadow-sm">
                            می‌تونی کدشو به اشتراک بذاری؟
                          </div>
                        </div>
                      </div>
                      
                      {/* Input */}
                      <div className="p-3 bg-background border-t border-border/50 flex gap-2">
                        <div className="flex-1 bg-muted/50 rounded-full px-4 py-2 text-sm text-muted-foreground">
                          پیام خود را بنویسید...
                        </div>
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                          <Send className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* AI Tools - Mobile Grid */}
      <section className="py-16 sm:py-20 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14 md:mb-16 px-2"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 font-display">
              ابزارهای AI در نئوهوش
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              مجموعه کاملی از ابزارهای هوش مصنوعی برای نیازهای مختلف
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 max-w-6xl mx-auto">
            {tools.map((tool, i) => {
              const iconMap: { [key: string]: any } = {
                'MessageCircle': MessageCircle,
                'FileText': FileText,
                'Wand2': Wand2,
                'Languages': Languages,
                'Image': ImageIcon,
                'Code': Code,
                'TrendingUp': TrendingUp,
                'Sparkles': Sparkles
              };
              const ToolIcon = iconMap[tool.icon_name] || MessageCircle;
              
              return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <Link to={tool.link_url || "/tools"}>
                  <Card className="p-4 sm:p-5 md:p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all group border-border/50 hover:border-primary/50 cursor-pointer">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-${tool.color}/10 flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                      <ToolIcon className={`w-6 h-6 sm:w-7 sm:h-7 text-${tool.color}`} />
                    </div>
                    <h3 className="font-semibold text-xs sm:text-sm mb-1">{tool.title}</h3>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">شروع کنید</p>
                  </Card>
                </Link>
              </motion.div>
            );
            })}
          </div>
        </div>
      </section>

      {/* Chatbot Preview Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left - Content */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <Badge className="bg-primary/10 text-primary border-primary/30">
                  چت‌بات پیشرفته
                </Badge>
                
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  هوش مصنوعی همراه
                  <br />
                  <span className="text-primary">همیشه کنار توست</span>
                </h2>
                
                <div className="space-y-4">
                  {[
                    { icon: Zap, text: "سرعت بالا و پاسخ‌گویی فوری" },
                    { icon: Languages, text: "پشتیبانی کامل از زبان فارسی" },
                    { icon: Users, text: "قابلیت شخصی‌سازی و حافظه" },
                    { icon: Brain, text: "دسترسی به مدل‌های مختلف AI" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-lg">{item.text}</p>
                    </div>
                  ))}
                </div>

                <Link to="/chat">
                  <Button size="lg" className="gap-2 shadow-glow">
                    <MessageCircle className="w-5 h-5" />
                    شروع گفتگو
                    <ArrowLeft className="w-4 w-4" />
                  </Button>
                </Link>
              </motion.div>

              {/* Right - Chat Preview */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card className="border-2 border-border/50 shadow-xl">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex gap-3 items-start">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 bg-accent/5 rounded-2xl rounded-tl-sm p-4">
                        <p className="text-right">می‌خوام یک استراتژی بازاریابی برای محصول جدیدم بنویسم</p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 bg-primary/5 rounded-2xl rounded-tr-sm p-4">
                        <p className="text-right leading-relaxed">
                          عالیه! برای نوشتن یک استراتژی بازاریابی موثر، بهتره اول محصولت رو بهتر بشناسیم. می‌تونی بهم بگی:
                          <br />
                          <br />
                          ۱. محصول چیه؟
                          <br />
                          ۲. مخاطب هدفت کیه؟
                          <br />
                          ۳. بودجه‌ات چقدره؟
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground pr-14">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-100" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-200" />
                      <span className="mr-2">در حال تایپ...</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Articles - Mobile Optimized */}
      {!loading && articles.length > 0 && (
        <section className="py-16 sm:py-20 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-10 sm:mb-14 md:mb-16 px-2"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 font-display">
                آخرین مقالات
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
                با جدیدترین مطالب و آموزش‌های AI آشنا شوید
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
              {articles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link to={`/articles/${article.id}`}>
                    <Card className="overflow-hidden group cursor-pointer h-full hover:shadow-xl hover:shadow-primary/10 transition-all">
                      {article.image_url && (
                        <div className="relative overflow-hidden h-44 sm:h-48">
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute top-3 right-3">
                            <span className="px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-semibold shadow-lg">
                              {article.category}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="p-4 sm:p-5 space-y-3">
                        <h3 className="text-base sm:text-lg font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {article.title}
                        </h3>
                        
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                          {article.excerpt}
                        </p>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border/50">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" />
                            {new Date(article.created_at).toLocaleDateString("fa-IR")}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials - Mobile Cards */}
      <section className="py-16 sm:py-20 md:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14 md:mb-16 px-2"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 font-display">
              کاربران راضی نئوهوش
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto">
              تجربه هزاران کاربر از استفاده پلتفرم هوش مصنوعی نئوهوش
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all border-border/50 p-5 sm:p-6">
                  <div className="flex gap-1 mb-3 sm:mb-4">
                    {[...Array(testimonial.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 sm:w-5 sm:h-5 fill-warning text-warning" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed mb-4 sm:mb-5 text-muted-foreground">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-3 pt-3 sm:pt-4 border-t border-border/50">
                    {testimonial.avatar_url ? (
                      <img 
                        src={testimonial.avatar_url} 
                        alt={testimonial.name}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-sm sm:text-base">{testimonial.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Mobile Optimized */}
      <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="max-w-4xl mx-auto p-6 sm:p-10 md:p-12 lg:p-16 text-center border-2 border-primary/30 shadow-glow-strong bg-card/80 backdrop-blur-xl">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
                آماده شروع هستید؟
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
                همین امروز به هزاران کاربر راضی بپیوندید و قدرت هوش مصنوعی را تجربه کنید
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link to="/chat" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 shadow-glow-strong group">
                    <MessageCircle className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-12 transition-transform" />
                    شروع رایگان
                    <ArrowLeft className="mr-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/contact" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 border-2">
                    تماس با ما
                  </Button>
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Floating Chat Button */}
      <Link to="/chat">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1, type: "spring" }}
          className="fixed bottom-8 left-8 z-50"
        >
          <Button 
            size="icon"
            className="h-16 w-16 rounded-full shadow-glow-strong hover:shadow-glow-accent-strong hover:scale-110 transition-all"
          >
            <MessageCircle className="h-8 w-8" />
          </Button>
        </motion.div>
      </Link>
    </div>
  );
};

export default Home;
