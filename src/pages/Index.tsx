import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Image as ImageIcon,
  Mic,
  Code,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bot,
  Wand2,
  BookOpen,
  Users,
  Volume2,
  User,
  Bell,
  WifiOff,
  Download
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import logo from "@/assets/neohoosh-logo-new.png";

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // Check if first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('neohoosh_visited');
    if (!hasVisited) {
      setShowOnboarding(true);
      localStorage.setItem('neohoosh_visited', 'true');
    }
  }, []);

  // Listen for install prompt and show as toast notification
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install toast notification
      toast(
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm">نصب نئوهوش</p>
            <p className="text-xs text-muted-foreground">برای دسترسی سریع‌تر نصب کنید</p>
          </div>
        </div>,
        {
          action: {
            label: "نصب",
            onClick: async () => {
              if (e) {
                await (e as any).prompt();
                setDeferredPrompt(null);
              }
            }
          },
          duration: 10000,
        }
      );
    };
    window.addEventListener('beforeinstallprompt', handler);
    
    const installedHandler = () => {
      setDeferredPrompt(null);
      toast.success("نئوهوش با موفقیت نصب شد!");
    };
    window.addEventListener('appinstalled', installedHandler);

    // Network status
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("اتصال به اینترنت برقرار شد");
    };
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("شما آفلاین هستید");
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Onboarding slides
  const onboardingSlides = [
    {
      icon: Bot,
      title: "به نئوهوش خوش آمدید",
      description: "سوپراپلیکیشن هوش مصنوعی برای همه! اینجا می‌تونی با AI گفتگو کنی، تصویر بسازی، صدا به متن تبدیل کنی و خیلی کارهای دیگه انجام بدی.",
      color: "from-primary to-secondary"
    },
    {
      icon: MessageCircle,
      title: "چت‌بات هوشمند",
      description: "با دستیار هوشمند ما گفتگو کن. جواب سوالاتت رو بگیر، ایده بگیر، متن بنویس و هر کاری که نیاز داری انجام بده.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: ImageIcon,
      title: "تولید تصویر با AI",
      description: "با چند کلمه توضیح، تصاویر حرفه‌ای و خلاقانه بساز. برای اینستاگرام، وبسایت یا هر جای دیگه.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Mic,
      title: "تبدیل صدا به متن",
      description: "فایل صوتی یا ویس رو آپلود کن و متن دقیقش رو دریافت کن. پشتیبانی از فارسی و انگلیسی.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Code,
      title: "تولید کد",
      description: "از طراحی تا برنامه‌نویسی! کد HTML، CSS، JavaScript و زبان‌های دیگه رو سریع تولید کن.",
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: Sparkles,
      title: "آماده شروع؟",
      description: "حالا می‌تونی از همه امکانات استفاده کنی. برای دسترسی سریع‌تر، اپلیکیشن رو روی گوشیت نصب کن!",
      color: "from-primary to-accent"
    }
  ];

  // Quick Actions for Super App style
  const quickActions = [
    { icon: MessageCircle, label: "چت با AI", href: "/chat", gradient: "from-blue-500 to-cyan-500", description: "گفتگوی هوشمند" },
    { icon: ImageIcon, label: "تولید تصویر", href: "/tools/image-generator", gradient: "from-purple-500 to-pink-500", description: "ساخت تصویر با AI" },
    { icon: Mic, label: "صدا به متن", href: "/tools/voice-to-text", gradient: "from-green-500 to-emerald-500", description: "تبدیل ویس به متن" },
    { icon: Volume2, label: "متن به صدا", href: "/tools/text-to-voice", gradient: "from-teal-500 to-cyan-500", description: "تبدیل متن به صوت" },
    { icon: Code, label: "تولید کد", href: "/tools/code-generator", gradient: "from-orange-500 to-amber-500", description: "کدنویسی با AI" },
    { icon: Users, label: "NEOHI", href: "/neohi", gradient: "from-pink-500 to-rose-500", description: "شبکه اجتماعی" },
    { icon: BookOpen, label: "مقالات", href: "/articles", gradient: "from-indigo-500 to-blue-500", description: "آموزش و دانش" },
    { icon: Wand2, label: "ابزارها", href: "/tools", gradient: "from-amber-500 to-yellow-500", description: "همه ابزارها" },
  ];

  // Featured services
  const featuredServices = [
    {
      title: "NEOHI",
      description: "شبکه اجتماعی هوشمند",
      icon: Users,
      href: "/neohi",
      gradient: "from-pink-600 via-rose-500 to-red-500"
    },
    {
      title: "چت‌بات",
      description: "گفتگو با هوش مصنوعی",
      icon: MessageCircle,
      href: "/chat",
      gradient: "from-blue-600 via-cyan-500 to-teal-500"
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-24 safe-area-inset">
      {/* Offline Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[60] bg-warning p-3 safe-area-top"
          >
            <div className="flex items-center justify-center gap-2 text-warning-foreground text-sm">
              <WifiOff className="w-4 h-4" />
              <span>شما آفلاین هستید - برخی امکانات محدود است</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background flex flex-col"
          >
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <motion.div
                key={onboardingStep}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="text-center max-w-sm"
              >
                <motion.div 
                  className={`w-28 h-28 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${onboardingSlides[onboardingStep].color} flex items-center justify-center shadow-2xl`}
                  animate={{ 
                    boxShadow: [
                      "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                      "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
                      "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {(() => {
                    const IconComponent = onboardingSlides[onboardingStep].icon;
                    return <IconComponent className="w-14 h-14 text-white" />;
                  })()}
                </motion.div>
                <h2 className="text-3xl font-bold mb-4">{onboardingSlides[onboardingStep].title}</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">{onboardingSlides[onboardingStep].description}</p>
              </motion.div>

              {/* Progress Dots */}
              <div className="flex gap-2 mt-12">
                {onboardingSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setOnboardingStep(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === onboardingStep ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="p-6 flex gap-4">
              {onboardingStep > 0 && (
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14 text-lg"
                  onClick={() => setOnboardingStep(s => s - 1)}
                >
                  <ChevronRight className="w-5 h-5 ml-2" />
                  قبلی
                </Button>
              )}
              {onboardingStep < onboardingSlides.length - 1 ? (
                <Button
                  size="lg"
                  className="flex-1 h-14 text-lg"
                  onClick={() => setOnboardingStep(s => s + 1)}
                >
                  بعدی
                  <ChevronLeft className="w-5 h-5 mr-2" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="flex-1 h-14 text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                  onClick={() => setShowOnboarding(false)}
                >
                  <Sparkles className="w-5 h-5 ml-2" />
                  شروع کنید
                </Button>
              )}
            </div>

            {/* Skip Button */}
            {onboardingStep < onboardingSlides.length - 1 && (
              <button
                onClick={() => setShowOnboarding(false)}
                className="absolute top-6 left-6 text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                رد شدن
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 safe-area-top">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <motion.img 
              src={logo} 
              alt="NeoHoosh" 
              className="w-11 h-11"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            />
            <div>
              <h1 className="font-bold text-lg">نئوهوش</h1>
              <p className="text-xs text-muted-foreground">سوپراپلیکیشن AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-6 space-y-8">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-primary via-secondary to-accent text-white overflow-hidden relative border-0 shadow-xl">
            <CardContent className="p-6 relative z-10">
              <Badge className="bg-white/20 text-white border-none mb-4 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 ml-1" />
                جدید
              </Badge>
              <h2 className="text-2xl font-bold mb-2">با AI گفتگو کن</h2>
              <p className="text-white/80 text-sm mb-5">
                دستیار هوشمند ۲۴ ساعته در خدمت شماست
              </p>
              <Link to="/chat">
                <Button className="bg-white text-primary hover:bg-white/90 shadow-lg">
                  <MessageCircle className="w-4 h-4 ml-2" />
                  شروع گفتگو
                </Button>
              </Link>
            </CardContent>
            {/* Decorative circles */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full" />
          </Card>
        </motion.div>

        {/* Quick Actions Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">ابزارهای سریع</h3>
            <Link to="/tools" className="text-primary text-sm flex items-center gap-1 hover:underline">
              همه
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={action.href}>
                  <div className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-muted/50 transition-all duration-300 group">
                    <motion.div 
                      className={`w-14 h-14 bg-gradient-to-br ${action.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <action.icon className="w-7 h-7 text-white" />
                    </motion.div>
                    <span className="text-xs font-medium text-center group-hover:text-primary transition-colors">{action.label}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Services */}
        <section>
          <h3 className="font-bold text-lg mb-4">سرویس‌های ویژه</h3>
          <div className="grid grid-cols-2 gap-4">
            {featuredServices.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Link to={service.href}>
                  <Card className={`bg-gradient-to-br ${service.gradient} text-white border-none overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300`}>
                    <CardContent className="p-5">
                      <motion.div 
                        className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3"
                        whileHover={{ scale: 1.1, rotate: -5 }}
                      >
                        <service.icon className="w-6 h-6" />
                      </motion.div>
                      <h4 className="font-bold text-lg">{service.title}</h4>
                      <p className="text-white/80 text-sm">{service.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {[
            { icon: Bot, label: "هوش", href: "/chat", active: false },
            { icon: Wand2, label: "ابزارها", href: "/tools", active: false },
            { icon: BookOpen, label: "مقالات", href: "/articles", active: false },
            { icon: User, label: "پروفایل", href: "/profile", active: false },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[60px] text-muted-foreground hover:text-primary hover:bg-primary/5"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
