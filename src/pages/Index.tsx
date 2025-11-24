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
  Send
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

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

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
      {/* Hero Section - Modern Futuristic */}
      <section className="relative pt-28 md:pt-32 pb-24 md:pb-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0" style={{ background: 'var(--gradient-mesh)' }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(76,139,245,0.1),transparent_50%)]" />
        </div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-6xl mx-auto text-center space-y-6 md:space-y-8"
          >
            {/* Logo */}
            <motion.div variants={fadeInUp} className="flex justify-center mb-2 md:mb-4">
              <div className="relative">
                <img 
                  src={logo} 
                  alt="NeoHoosh" 
                  className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 drop-shadow-2xl"
                />
                <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse"></div>
              </div>
            </motion.div>

            {/* Badge */}
            <motion.div variants={fadeInUp} className="flex justify-center">
              <Badge className="px-5 py-2 md:px-6 md:py-2.5 text-sm md:text-base shadow-glow bg-primary/10 border-primary/30 text-primary hover:bg-primary/20">
                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 ml-2 animate-pulse" />
                نسل جدید هوش مصنوعی
              </Badge>
            </motion.div>

            {/* Main Heading - Emotional & Powerful */}
            <motion.h1 
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight font-display px-4"
            >
              <span className="bg-gradient-to-l from-primary via-secondary to-accent bg-clip-text text-transparent">
                نسل جدید هوش مصنوعی
              </span>
              <br />
              <span className="text-foreground">
                در ایران. همیشه کنار تو.
              </span>
            </motion.h1>

            {/* Sub Heading */}
            <motion.p 
              variants={fadeInUp}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed font-light px-4"
            >
              ابزارها، چت‌بات و کامیونیتی قدرتمند برای خلق، یادگیری و رشد.
            </motion.p>

            {/* Chat Bot Preview Mini */}
            <motion.div 
              variants={fadeInUp}
              className="max-w-md mx-auto"
            >
              <Card className="bg-card/50 backdrop-blur-xl border-primary/20 shadow-glow">
                <CardContent className="p-4 space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 bg-primary/5 rounded-2xl rounded-tr-sm p-3 text-sm text-right">
                      سلام! چطور می‌تونم کمکت کنم؟
                    </div>
                  </div>
                  <div className="flex gap-3 items-start flex-row-reverse">
                    <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                      <Users className="w-4 h-4 text-accent" />
                    </div>
                    <div className="flex-1 bg-accent/5 rounded-2xl rounded-tl-sm p-3 text-sm text-right">
                      می‌خوام یک استراتژی بازاریابی بنویسم
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6"
            >
              <Link to="/chat">
                <Button size="lg" className="text-lg px-10 py-7 shadow-glow-strong hover:shadow-glow-accent-strong transition-all group">
                  <MessageCircle className="ml-2 group-hover:rotate-12 transition-transform" />
                  شروع گفتگو با AI
                  <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-10 py-7 border-2 border-border/50 hover:border-primary/50 hover:bg-primary/5"
                >
                  <Rocket className="ml-2" />
                  ورود به داشبورد
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={fadeInUp}
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-16 max-w-3xl mx-auto"
            >
              <div className="text-center p-4 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/50">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">+۶۰۰۰</div>
                <div className="text-sm text-muted-foreground">گفتگو در ماه اخیر</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/50">
                <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">۲۴/۷</div>
                <div className="text-sm text-muted-foreground">پشتیبانی آنلاین</div>
              </div>
              <div className="text-center p-4 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/50">
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">۱۰۰٪</div>
                <div className="text-sm text-muted-foreground">رضایت کاربران</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3 Main Features - Clean Cards */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              امکانات NeoHoosh
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              سه ستون اصلی پلتفرم هوش مصنوعی نئوهوش
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: MessageCircle,
                title: "چت‌بات هوشمند",
                desc: "پاسخ سریع، حافظه مکالمه و شخصی‌سازی رفتار برای تجربه‌ای منحصربه‌فرد",
                features: ["پاسخ سریع", "حافظه مکالمه", "شخصی‌سازی"],
                gradient: "from-primary/20 to-primary/5"
              },
              {
                icon: Wand2,
                title: "ابزارهای قدرتمند AI",
                desc: "تولید متن، خلاصه‌سازی، ترجمه و تحلیل با دقت و سرعت بالا",
                features: ["تولید متن", "خلاصه‌سازی", "ترجمه و تحلیل"],
                gradient: "from-secondary/20 to-secondary/5"
              },
              {
                icon: BookOpen,
                title: "آموزش‌های جامع",
                desc: "مقالات تخصصی، راهنمای پرامپت و آموزش‌های حرفه‌ای هوش مصنوعی",
                features: ["مقالات تخصصی", "راهنمای پرامپت", "آموزش حرفه‌ای"],
                gradient: "from-accent/20 to-accent/5"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-2 border-border/50 hover:border-primary/50 hover:shadow-xl transition-all group">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      <item.icon className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl mb-3">{item.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{item.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {item.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEOHI Community - SPECIAL HIGHLIGHT SECTION */}
      <section className="py-32 relative overflow-hidden">
        {/* Special Background for NEOHI */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(76,139,245,0.15),transparent_70%)]" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-6xl mx-auto"
          >
            {/* Main NEOHI Card */}
            <Card className="border-2 border-primary/30 shadow-glow-strong bg-card/80 backdrop-blur-xl overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left Side - Content */}
                <div className="p-12 lg:p-16 space-y-8">
                  <div>
                    <Badge className="mb-6 text-base px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
                      <Sparkles className="w-4 h-4 ml-2 animate-pulse" />
                      معرفی NEOHI
                    </Badge>
                    
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                      <span className="bg-gradient-to-l from-primary via-secondary to-accent bg-clip-text text-transparent">
                        NEOHI
                      </span>
                    </h2>
                    
                    <p className="text-2xl md:text-3xl font-semibold text-foreground mb-4">
                      جایی برای گفتگو، یادگیری و شبکه‌سازی
                    </p>
                    
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      کامیونیتی اختصاصی NeoHoosh، الهام‌گرفته از تجربه تلگرام؛
                      سریع، سبک، گروه‌محور و مخصوص کاربران AI.
                    </p>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Users, label: "گروه‌های تخصصی" },
                      { icon: MessageSquare, label: "کانال‌های کاربردی" },
                      { icon: Share2, label: "پرسش و پاسخ" },
                      { icon: ImageIcon, label: "اشتراک رسانه" },
                      { icon: Globe, label: "دسترسی چندپلتفرمی" },
                      { icon: Video, label: "پخش زنده" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link to="/neohi">
                    <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 shadow-glow-strong group">
                      <Send className="ml-2 group-hover:translate-x-1 transition-transform" />
                      عضویت در NEOHI
                      <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
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

      {/* AI Tools Showcase */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              ابزارهای AI در NeoHoosh
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              مجموعه کاملی از ابزارهای هوش مصنوعی برای نیازهای مختلف
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {[
              { icon: MessageCircle, title: "چت‌بات", color: "primary" },
              { icon: FileText, title: "تولید متن", color: "secondary" },
              { icon: Wand2, title: "بازنویسی", color: "accent" },
              { icon: Languages, title: "ترجمه", color: "primary" },
              { icon: ImageIcon, title: "تولید تصویر", color: "secondary" },
              { icon: Code, title: "کد نویسی", color: "accent" },
              { icon: TrendingUp, title: "تحلیل مقاله", color: "primary" },
              { icon: Sparkles, title: "ساخت پرامپت", color: "secondary" }
            ].map((tool, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <Link to="/tools">
                  <Card className="p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all group border-border/50 hover:border-primary/50 cursor-pointer">
                    <div className={`w-14 h-14 rounded-xl bg-${tool.color}/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <tool.icon className={`w-7 h-7 text-${tool.color}`} />
                    </div>
                    <h3 className="font-semibold text-sm">{tool.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">شروع کنید</p>
                  </Card>
                </Link>
              </motion.div>
            ))}
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
                    <ArrowLeft className="w-4 h-4" />
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

      {/* Latest Articles */}
      {!loading && articles.length > 0 && (
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">
                آخرین مقالات
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                با جدیدترین مطالب و آموزش‌های AI آشنا شوید
              </p>
            </motion.div>

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
                    <Card className="overflow-hidden h-full hover:shadow-xl hover:-translate-y-1 transition-all group border-2 border-border/50 hover:border-primary/50">
                      {article.image_url && (
                        <div className="aspect-video overflow-hidden bg-muted">
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <Badge className="mb-3 bg-primary/10 text-primary border-primary/30">
                          {article.category}
                        </Badge>
                        <h3 className="text-xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2 leading-relaxed text-sm">
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
                <Button size="lg" variant="outline" className="gap-2 border-2">
                  مشاهده همه مقالات
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Trust & Social Proof */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display">
              کاربران راضی NeoHoosh
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              تجربه هزاران کاربر از استفاده پلتفرم هوش مصنوعی نئوهوش
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "علی محمدی",
                role: "توسعه‌دهنده نرم‌افزار",
                content: "نئوهوش کار من رو خیلی راحت‌تر کرده. از چت‌بات برای کدنویسی و حل مشکلات استفاده می‌کنم.",
                rating: 5
              },
              {
                name: "سارا احمدی",
                role: "طراح گرافیک",
                content: "ابزارهای تولید محتوا و تصویر فوق‌العادست! کیفیت خروجی‌ها حرفه‌ای و متنوعه.",
                rating: 5
              },
              {
                name: "رضا کریمی",
                role: "بازاریاب دیجیتال",
                content: "برای تولید محتوا و تحلیل داده‌ها از نئوهوش استفاده می‌کنم. واقعاً عالیه!",
                rating: 5
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-all border-border/50">
                  <CardHeader>
                    <div className="flex gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, idx) => (
                        <Star key={idx} className="w-5 h-5 fill-warning text-warning" />
                      ))}
                    </div>
                    <CardDescription className="text-base leading-relaxed">
                      "{testimonial.content}"
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10" />
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card className="max-w-4xl mx-auto p-12 lg:p-16 text-center border-2 border-primary/30 shadow-glow-strong bg-card/80 backdrop-blur-xl">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                آماده شروع هستید؟
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                همین امروز به هزاران کاربر راضی بپیوندید و قدرت هوش مصنوعی را تجربه کنید
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/chat">
                  <Button size="lg" className="text-lg px-10 py-7 shadow-glow-strong group">
                    <MessageCircle className="ml-2 group-hover:rotate-12 transition-transform" />
                    شروع رایگان
                    <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="text-lg px-10 py-7 border-2">
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

export default Index;
