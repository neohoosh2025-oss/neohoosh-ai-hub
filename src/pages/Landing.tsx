import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles,
  MessageSquare,
  Image,
  Mic,
  Volume2,
  Code,
  Zap,
  Shield,
  Globe,
  ArrowLeft,
  ChevronDown,
  Check,
  Star
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Landing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const features = [
    {
      icon: MessageSquare,
      title: "گفتگوی هوشمند",
      description: "دستیار هوشمند فارسی با درک عمیق زبان",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Image,
      title: "تولید تصویر",
      description: "ساخت تصاویر خلاقانه با هوش مصنوعی",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Mic,
      title: "صدا به متن",
      description: "تبدیل گفتار به نوشتار با دقت بالا",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Volume2,
      title: "متن به صدا",
      description: "تبدیل متن به صدای طبیعی فارسی",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Code,
      title: "کدنویسی",
      description: "کمک در برنامه‌نویسی و دیباگ کد",
      gradient: "from-indigo-500 to-violet-500"
    },
    {
      icon: Globe,
      title: "ترجمه",
      description: "ترجمه حرفه‌ای بین زبان‌های مختلف",
      gradient: "from-teal-500 to-cyan-500"
    }
  ];

  const stats = [
    { value: "۱۰۰K+", label: "کاربر فعال" },
    { value: "۵M+", label: "پیام روزانه" },
    { value: "۹۹.۹%", label: "آپتایم" },
    { value: "۴.۹", label: "امتیاز کاربران", icon: Star }
  ];

  const testimonials = [
    {
      name: "علی رضایی",
      role: "کارآفرین",
      content: "نئوهوش کار روزانه من رو متحول کرده. از نوشتن ایمیل تا تحلیل داده، همه جا همراهمه.",
      avatar: "A"
    },
    {
      name: "مریم احمدی",
      role: "نویسنده",
      content: "بهترین ابزار برای تولید محتوا. درک فوق‌العاده‌ای از زبان فارسی داره.",
      avatar: "M"
    },
    {
      name: "رضا کریمی",
      role: "برنامه‌نویس",
      content: "برای کدنویسی و دیباگ عالیه. سرعت کارم دو برابر شده.",
      avatar: "R"
    }
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold text-lg">نئوهوش</span>
          </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <Button onClick={() => navigate('/chat')} className="rounded-xl">
                رفتن به چت
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/auth')} className="rounded-xl">
                  ورود
                </Button>
                <Button onClick={() => navigate('/auth')} className="rounded-xl">
                  شروع رایگان
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              نسل جدید هوش مصنوعی فارسی
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              دستیار هوشمند
              <span className="block bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent">
                برای هر کاری
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              نئوهوش با درک عمیق زبان فارسی، همراه هوشمند شما در نوشتن، تحلیل، خلاقیت و کدنویسی است.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate(user ? '/chat' : '/auth')}
                className="rounded-2xl h-14 px-8 text-base font-medium shadow-lg shadow-primary/25"
              >
                {user ? 'رفتن به چت' : 'شروع رایگان'}
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-2xl h-14 px-8 text-base font-medium"
              >
                مشاهده امکانات
                <ChevronDown className="w-5 h-5 mr-2" />
              </Button>
            </div>
          </motion.div>

          {/* Hero Image/Preview */}
          <motion.div
            className="mt-16 relative"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-card rounded-3xl border border-border/50 shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-border/50 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-tr-none p-4 text-right max-w-md">
                    <p className="text-foreground">سلام! من نئوهوش هستم. چطور می‌تونم کمکت کنم؟</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-primary text-primary-foreground rounded-2xl rounded-tl-none p-4 max-w-md">
                    <p>یک متن تبلیغاتی برای استارتاپم بنویس</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-y border-border/30 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</span>
                  {stat.icon && <stat.icon className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
                </div>
                <p className="text-muted-foreground text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              همه ابزارها در یک پلتفرم
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              از گفتگوی هوشمند تا تولید تصویر، همه چیز در دسترس شماست
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-border hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                  `bg-gradient-to-br ${feature.gradient}`
                )}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                چرا نئوهوش؟
              </h2>
              <div className="space-y-4">
                {[
                  "درک عمیق زبان و فرهنگ فارسی",
                  "سرعت پاسخ‌دهی فوق‌العاده",
                  "امنیت و حریم خصوصی",
                  "بدون نیاز به VPN یا تحریم‌شکن",
                  "پشتیبانی ۲۴ ساعته"
                ].map((item, i) => (
                  <motion.div
                    key={item}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="p-6 rounded-2xl bg-card border border-border/50 text-center">
                <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-1">سریع</h4>
                <p className="text-xs text-muted-foreground">پاسخ در کسری از ثانیه</p>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border/50 text-center">
                <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-1">امن</h4>
                <p className="text-xs text-muted-foreground">رمزنگاری کامل</p>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border/50 text-center col-span-2">
                <Globe className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-semibold mb-1">بدون محدودیت</h4>
                <p className="text-xs text-muted-foreground">دسترسی مستقیم از ایران</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              نظر کاربران
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                className="p-6 rounded-2xl bg-card border border-border/50"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">{testimonial.content}</p>
                <div className="flex gap-0.5 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              آماده شروع هستی؟
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              همین الان به جمع هزاران کاربر نئوهوش بپیوند
            </p>
            <Button 
              size="lg"
              onClick={() => navigate(user ? '/chat' : '/auth')}
              className="rounded-2xl h-14 px-10 text-base font-medium shadow-lg shadow-primary/25"
            >
              {user ? 'رفتن به چت' : 'شروع رایگان'}
              <ArrowLeft className="w-5 h-5 mr-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/30">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium">نئوهوش</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © ۱۴۰۳ نئوهوش. تمامی حقوق محفوظ است.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
