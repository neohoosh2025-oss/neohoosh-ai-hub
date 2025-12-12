import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Settings,
  WifiOff,
  Download,
  Heart,
  MessageSquare,
  Share2,
  Plus,
  Camera,
  Search
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/neohoosh-logo-new.png";
import { cn } from "@/lib/utils";

const Index = () => {
  const location = useLocation();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [stories, setStories] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  
  // Check if first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('neohoosh_visited');
    if (!hasVisited) {
      setShowOnboarding(true);
      localStorage.setItem('neohoosh_visited', 'true');
    }
  }, []);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Fetch featured content
  useEffect(() => {
    const fetchContent = async () => {
      // Get latest articles as posts
      const { data: articles } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (articles) {
        setPosts(articles.map(a => ({
          id: a.id,
          user: { name: 'نئوهوش', avatar: logo },
          image: a.image_url,
          caption: a.title,
          likes: Math.floor(Math.random() * 500),
          comments: Math.floor(Math.random() * 50),
          timeAgo: 'اخیراً'
        })));
      }
      
      // Mock stories for quick actions
      setStories([
        { id: 'chat', name: 'چت AI', image: null, icon: MessageCircle, gradient: 'from-blue-500 to-cyan-500', href: '/chat' },
        { id: 'image', name: 'تصویر', image: null, icon: ImageIcon, gradient: 'from-purple-500 to-pink-500', href: '/tools/image-generator' },
        { id: 'voice', name: 'صدا', image: null, icon: Mic, gradient: 'from-green-500 to-emerald-500', href: '/tools/voice-to-text' },
        { id: 'code', name: 'کد', image: null, icon: Code, gradient: 'from-orange-500 to-amber-500', href: '/tools/code-generator' },
        { id: 'neohi', name: 'نئوهای', image: null, icon: Users, gradient: 'from-pink-500 to-rose-500', href: '/neohi' },
      ]);
    };
    fetchContent();
  }, []);

  // Listen for install prompt and show as toast notification
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
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
    { icon: Bot, title: "به نئوهوش خوش آمدید", description: "سوپراپلیکیشن هوش مصنوعی برای همه!", color: "from-primary to-secondary" },
    { icon: MessageCircle, title: "چت‌بات هوشمند", description: "با دستیار هوشمند ما گفتگو کن.", color: "from-blue-500 to-cyan-500" },
    { icon: ImageIcon, title: "تولید تصویر با AI", description: "با چند کلمه توضیح، تصاویر خلاقانه بساز.", color: "from-purple-500 to-pink-500" },
    { icon: Sparkles, title: "آماده شروع؟", description: "حالا می‌تونی از همه امکانات استفاده کنی.", color: "from-primary to-accent" }
  ];

  // Navigation items for bottom nav
  const navItems = [
    { icon: Bot, label: "چت", href: "/chat", path: "/chat" },
    { icon: Users, label: "نئوهای", href: "/neohi", path: "/neohi" },
    { icon: Wand2, label: "ابزارها", href: "/tools", path: "/tools" },
    { icon: BookOpen, label: "مقالات", href: "/articles", path: "/articles" },
    { icon: Settings, label: "تنظیمات", href: "/profile", path: "/profile" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 safe-area-inset">
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
              <span>شما آفلاین هستید</span>
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
                  className={`w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${onboardingSlides[onboardingStep].color} flex items-center justify-center shadow-2xl`}
                >
                  {(() => {
                    const IconComponent = onboardingSlides[onboardingStep].icon;
                    return <IconComponent className="w-12 h-12 text-white" />;
                  })()}
                </motion.div>
                <h2 className="text-2xl font-bold mb-3">{onboardingSlides[onboardingStep].title}</h2>
                <p className="text-muted-foreground">{onboardingSlides[onboardingStep].description}</p>
              </motion.div>

              <div className="flex gap-2 mt-10">
                {onboardingSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setOnboardingStep(i)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      i === onboardingStep ? 'w-6 bg-primary' : 'w-2 bg-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="p-6 flex gap-4">
              {onboardingStep > 0 && (
                <Button variant="outline" size="lg" className="flex-1 h-12" onClick={() => setOnboardingStep(s => s - 1)}>
                  <ChevronRight className="w-5 h-5 ml-1" />
                  قبلی
                </Button>
              )}
              {onboardingStep < onboardingSlides.length - 1 ? (
                <Button size="lg" className="flex-1 h-12" onClick={() => setOnboardingStep(s => s + 1)}>
                  بعدی
                  <ChevronLeft className="w-5 h-5 mr-1" />
                </Button>
              ) : (
                <Button size="lg" className="flex-1 h-12 bg-gradient-to-r from-primary to-secondary" onClick={() => setShowOnboarding(false)}>
                  <Sparkles className="w-5 h-5 ml-2" />
                  شروع کنید
                </Button>
              )}
            </div>

            {onboardingStep < onboardingSlides.length - 1 && (
              <button onClick={() => setShowOnboarding(false)} className="absolute top-6 left-6 text-muted-foreground text-sm">
                رد شدن
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instagram-style Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 safe-area-top">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <motion.img 
              src={logo} 
              alt="NeoHoosh" 
              className="w-8 h-8"
              whileTap={{ scale: 0.95 }}
            />
            <span className="font-bold text-lg">نئوهوش</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/chat">
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <MessageCircle className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Stories / Quick Actions - Instagram Style */}
      <div className="px-4 py-4 border-b border-border/30">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {/* Your Story / Add Story */}
          <Link to="/chat" className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </div>
            </div>
            <span className="text-xs text-muted-foreground">شروع</span>
          </Link>

          {/* Quick Action Stories */}
          {stories.map((story) => {
            const Icon = story.icon;
            return (
              <Link key={story.id} to={story.href} className="flex flex-col items-center gap-1 flex-shrink-0">
                <motion.div 
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "w-16 h-16 rounded-full p-[2px] bg-gradient-to-br",
                    story.gradient
                  )}
                >
                  <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                </motion.div>
                <span className="text-xs text-muted-foreground">{story.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Feed / Content */}
      <main className="divide-y divide-border/30">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4"
        >
          <Card className="bg-gradient-to-br from-primary via-secondary to-accent text-white overflow-hidden relative border-0 shadow-lg">
            <CardContent className="p-5 relative z-10">
              <Badge className="bg-white/20 text-white border-none mb-3 text-xs">
                <Sparkles className="w-3 h-3 ml-1" />
                جدید
              </Badge>
              <h2 className="text-xl font-bold mb-1">با AI گفتگو کن</h2>
              <p className="text-white/80 text-sm mb-4">دستیار هوشمند ۲۴ ساعته</p>
              <Link to="/chat">
                <Button className="bg-white text-primary hover:bg-white/90 shadow-md h-10">
                  <MessageCircle className="w-4 h-4 ml-2" />
                  شروع گفتگو
                </Button>
              </Link>
            </CardContent>
            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
          </Card>
        </motion.div>

        {/* Instagram-style Posts / Articles */}
        {posts.map((post, idx) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-background"
          >
            {/* Post Header */}
            <div className="flex items-center justify-between p-3">
              <Link to={`/articles/${post.id}`} className="flex items-center gap-3">
                <Avatar className="w-9 h-9">
                  <AvatarImage src={post.user.avatar} />
                  <AvatarFallback>ن</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{post.user.name}</p>
                  <p className="text-xs text-muted-foreground">{post.timeAgo}</p>
                </div>
              </Link>
            </div>

            {/* Post Image */}
            {post.image && (
              <Link to={`/articles/${post.id}`}>
                <div className="relative aspect-square bg-muted">
                  <img 
                    src={post.image} 
                    alt={post.caption}
                    className="w-full h-full object-cover"
                  />
                </div>
              </Link>
            )}

            {/* Post Actions */}
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.button whileTap={{ scale: 0.9 }}>
                    <Heart className="w-6 h-6" />
                  </motion.button>
                  <Link to={`/articles/${post.id}`}>
                    <MessageSquare className="w-6 h-6" />
                  </Link>
                  <motion.button whileTap={{ scale: 0.9 }}>
                    <Share2 className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">{post.likes} پسندیدند</p>
                <p className="text-sm">
                  <span className="font-medium">{post.user.name}</span>{' '}
                  <span className="text-muted-foreground">{post.caption}</span>
                </p>
                <Link to={`/articles/${post.id}`} className="text-xs text-muted-foreground">
                  مشاهده {post.comments} نظر
                </Link>
              </div>
            </div>
          </motion.article>
        ))}

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Camera className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">هنوز محتوایی منتشر نشده</p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
        <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname === "/" && item.path === "/chat";
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[56px]"
              >
                <motion.div whileTap={{ scale: 0.9 }} className="relative">
                  <Icon className={cn(
                    "w-6 h-6 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                </motion.div>
                <span className={cn(
                  "text-[10px] mt-1 font-medium transition-colors",
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
