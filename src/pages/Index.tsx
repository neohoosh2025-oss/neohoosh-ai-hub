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
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Bot,
  Wand2,
  BookOpen,
  Users,
  Volume2,
  Zap,
  Phone,
  User,
  Bell,
  Home,
  Compass,
  WifiOff,
  BellRing
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "@/assets/neohoosh-logo-new.png";
import { usePWA } from "@/hooks/usePWA";

const Index = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  
  const { 
    isOnline, 
    canInstall, 
    installPrompt, 
    notificationPermission,
    requestPermission,
    isPushSupported 
  } = usePWA();

  // Check if first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('neohoosh_visited');
    if (!hasVisited) {
      setShowOnboarding(true);
      localStorage.setItem('neohoosh_visited', 'true');
    }
  }, []);

  // Show install banner when install is available
  useEffect(() => {
    if (canInstall) {
      setShowInstallBanner(true);
    }
  }, [canInstall]);

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt();
      setShowInstallBanner(false);
    }
  };

  const handleEnableNotifications = async () => {
    if (isPushSupported && notificationPermission === 'default') {
      await requestPermission();
    }
  };

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
    { icon: MessageCircle, label: "چت با AI", href: "/chat", color: "bg-blue-500", description: "گفتگوی هوشمند" },
    { icon: ImageIcon, label: "تولید تصویر", href: "/tools/image-generator", color: "bg-purple-500", description: "ساخت تصویر با AI" },
    { icon: Mic, label: "صدا به متن", href: "/tools/voice-to-text", color: "bg-green-500", description: "تبدیل ویس به متن" },
    { icon: Volume2, label: "متن به صدا", href: "/tools/text-to-voice", color: "bg-teal-500", description: "تبدیل متن به صوت" },
    { icon: Code, label: "تولید کد", href: "/tools/code-generator", color: "bg-orange-500", description: "کدنویسی با AI" },
    { icon: Phone, label: "تماس صوتی", href: "/voice-call", color: "bg-pink-500", description: "مکالمه با AI" },
    { icon: BookOpen, label: "مقالات", href: "/articles", color: "bg-indigo-500", description: "آموزش و دانش" },
    { icon: Wand2, label: "ابزارها", href: "/tools", color: "bg-amber-500", description: "همه ابزارها" },
  ];

  // Featured services (without NeoForge)
  const featuredServices = [
    {
      title: "NEOHI",
      description: "شبکه اجتماعی هوشمند",
      icon: Users,
      href: "/neohi",
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      title: "تماس صوتی",
      description: "مکالمه زنده با AI",
      icon: Phone,
      href: "/voice-call",
      gradient: "from-pink-600 to-rose-600"
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
            className="fixed top-0 left-0 right-0 z-[60] bg-amber-500 p-3 safe-area-top"
          >
            <div className="flex items-center justify-center gap-2 text-white text-sm">
              <WifiOff className="w-4 h-4" />
              <span>شما آفلاین هستید - برخی امکانات محدود است</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA Install Banner */}
      <AnimatePresence>
        {showInstallBanner && isOnline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-secondary p-4 safe-area-top"
          >
            <div className="flex items-center justify-between max-w-lg mx-auto">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">نصب نئوهوش</p>
                  <p className="text-white/80 text-xs">دسترسی سریع‌تر از صفحه اصلی</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white text-primary hover:bg-white/90"
                  onClick={handleInstall}
                >
                  نصب
                </Button>
                <button onClick={() => setShowInstallBanner(false)} className="p-2 text-white/80 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
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
                <div className={`w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-br ${onboardingSlides[onboardingStep].color} flex items-center justify-center shadow-2xl`}>
                  {(() => {
                    const IconComponent = onboardingSlides[onboardingStep].icon;
                    return <IconComponent className="w-12 h-12 text-white" />;
                  })()}
                </div>
                <h2 className="text-2xl font-bold mb-4">{onboardingSlides[onboardingStep].title}</h2>
                <p className="text-muted-foreground leading-relaxed">{onboardingSlides[onboardingStep].description}</p>
              </motion.div>

              {/* Progress Dots */}
              <div className="flex gap-2 mt-10">
                {onboardingSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setOnboardingStep(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === onboardingStep ? 'w-6 bg-primary' : 'bg-muted-foreground/30'
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
                  className="flex-1"
                  onClick={() => setOnboardingStep(s => s - 1)}
                >
                  <ChevronRight className="w-5 h-5 ml-2" />
                  قبلی
                </Button>
              )}
              {onboardingStep < onboardingSlides.length - 1 ? (
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={() => setOnboardingStep(s => s + 1)}
                >
                  بعدی
                  <ChevronLeft className="w-5 h-5 mr-2" />
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="flex-1"
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
                className="absolute top-6 left-6 text-muted-foreground hover:text-foreground text-sm"
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
            <img src={logo} alt="NeoHoosh" className="w-10 h-10" />
            <div>
              <h1 className="font-bold text-lg">نئوهوش</h1>
              <p className="text-xs text-muted-foreground">سوپراپلیکیشن AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
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
        >
          <Card className="bg-gradient-to-br from-primary via-secondary to-accent text-white overflow-hidden relative">
            <CardContent className="p-6 relative z-10">
              <Badge className="bg-white/20 text-white border-none mb-4">
                <Sparkles className="w-3 h-3 ml-1" />
                جدید
              </Badge>
              <h2 className="text-2xl font-bold mb-2">با AI گفتگو کن</h2>
              <p className="text-white/80 text-sm mb-4">
                دستیار هوشمند ۲۴ ساعته در خدمت شماست
              </p>
              <Link to="/chat">
                <Button className="bg-white text-primary hover:bg-white/90">
                  <MessageCircle className="w-4 h-4 ml-2" />
                  شروع گفتگو
                </Button>
              </Link>
            </CardContent>
            {/* Decorative circles */}
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full" />
          </Card>
        </motion.div>

        {/* Quick Actions Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">ابزارهای سریع</h3>
            <Link to="/tools" className="text-primary text-sm flex items-center gap-1">
              همه
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {quickActions.map((action, i) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={action.href}>
                  <div className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-muted/50 transition-colors">
                    <div className={`w-14 h-14 ${action.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <action.icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-xs font-medium text-center">{action.label}</span>
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
                  <Card className={`bg-gradient-to-br ${service.gradient} text-white border-none overflow-hidden group`}>
                    <CardContent className="p-5">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <service.icon className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-lg">{service.title}</h4>
                      <p className="text-white/80 text-sm">{service.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Install App Section (for manual install) */}
        {!showInstallBanner && (
          <section>
            <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Download className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">نصب اپلیکیشن</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  برای دسترسی سریع‌تر، نئوهوش رو روی صفحه اصلی گوشیت نصب کن
                </p>
                <div className="text-xs text-muted-foreground space-y-2">
                  <p className="flex items-center justify-center gap-2">
                    <span className="font-bold">iOS:</span>
                    از منوی Share گزینه Add to Home Screen
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span className="font-bold">Android:</span>
                    از منوی مرورگر گزینه Install App
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Quick Tips */}
        <section>
          <h3 className="font-bold text-lg mb-4">نکات کاربردی</h3>
          <div className="space-y-3">
            {[
              { icon: Zap, text: "برای نتیجه بهتر، سوالات واضح و دقیق بپرسید" },
              { icon: MessageCircle, text: "هم فارسی و هم انگلیسی پشتیبانی می‌شه" },
              { icon: Sparkles, text: "از پرامپت‌های خلاقانه استفاده کنید" }
            ].map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <tip.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm">{tip.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Reset Onboarding Button (for testing) */}
        <div className="text-center">
          <button
            onClick={() => {
              localStorage.removeItem('neohoosh_visited');
              setShowOnboarding(true);
              setOnboardingStep(0);
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            مشاهده مجدد راهنما
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom z-40">
        <div className="flex items-center justify-around py-2">
          {[
            { icon: Home, label: "خانه", href: "/", active: true },
            { icon: Compass, label: "کاوش", href: "/tools" },
            { icon: MessageCircle, label: "چت", href: "/chat", primary: true },
            { icon: BookOpen, label: "مقالات", href: "/articles" },
            { icon: User, label: "پروفایل", href: "/profile" }
          ].map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                item.primary 
                  ? 'bg-primary text-white -mt-4 shadow-lg' 
                  : item.active 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className={`${item.primary ? 'w-6 h-6' : 'w-5 h-5'}`} />
              <span className={`text-xs ${item.primary ? 'font-medium' : ''}`}>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
