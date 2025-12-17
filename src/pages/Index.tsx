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
  Lock,
  ArrowLeft
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SplashScreen } from "@/components/SplashScreen";
import { OfflinePage } from "@/components/OfflinePage";
import { usePWA } from "@/hooks/usePWA";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { isOnline } = usePWA();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(() => {
    const hasSeenSplash = sessionStorage.getItem('neohoosh_splash_seen');
    return !hasSeenSplash;
  });
  const [user, setUser] = useState<any>(null);
  const [inputValue, setInputValue] = useState("");

  const handleSplashComplete = () => {
    sessionStorage.setItem('neohoosh_splash_seen', 'true');
    setShowSplash(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchData();
  }, []);

  // Navigate to chat with message
  const handleStartChat = () => {
    if (inputValue.trim()) {
      navigate('/chat', { state: { initialMessage: inputValue } });
    } else {
      navigate('/chat');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStartChat();
    }
  };

  // Locked tools - visually disabled
  const lockedTools = [
    { icon: Image, title: "تولید تصویر", color: "bg-muted" },
    { icon: Mic, title: "صدا به متن", color: "bg-muted" },
    { icon: Volume2, title: "متن به صدا", color: "bg-muted" },
    { icon: Code, title: "تولید کد", color: "bg-muted" },
    { icon: Users, title: "NEOHI", color: "bg-muted" },
  ];

  if (!isOnline) {
    return <OfflinePage />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      </AnimatePresence>

      {/* Minimal Centered Layout */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div 
          className="w-full max-w-lg mx-auto space-y-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Logo & Welcome - Extremely Minimal */}
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {/* Subtle Logo Mark */}
            <motion.div 
              className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center"
              animate={{ 
                scale: [1, 1.02, 1],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-7 h-7 text-primary/80" />
            </motion.div>

            {/* Brand Name - Calm Typography */}
            <h1 className="text-2xl font-medium text-foreground/90 tracking-tight">
              نئوهوش
            </h1>

            {/* Welcome Text - Warm & Inviting */}
            <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
              {user 
                ? `سلام ${user.user_metadata?.display_name || 'دوست عزیز'}، چطور می‌تونم کمکت کنم؟` 
                : 'سلام، من اینجام تا کمکت کنم.'
              }
            </p>
          </motion.div>

          {/* Large Chat Input - The Star of the Show */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="relative bg-card rounded-2xl shadow-md border border-border/50 overflow-hidden">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="هر سوالی داری بپرس..."
                className="min-h-[120px] p-5 text-base resize-none border-0 focus:ring-0 focus-visible:ring-0 bg-transparent placeholder:text-muted-foreground/60"
                dir="rtl"
              />
              
              {/* Send Button */}
              <div className="absolute bottom-4 left-4">
                <Button
                  onClick={handleStartChat}
                  size="icon"
                  className={cn(
                    "w-11 h-11 rounded-xl transition-all duration-300",
                    inputValue.trim() 
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" 
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Subtle Helper Text */}
            <p className="text-center text-xs text-muted-foreground/60 mt-3">
              Enter بزن یا دکمه ارسال رو بزن
            </p>
          </motion.div>

          {/* Quick Start Link */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Link 
              to="/chat" 
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>یا مستقیم به چت برو</span>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Bottom Section - Locked Features (Visually Disabled) */}
      <motion.footer 
        className="py-8 px-6 border-t border-border/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="max-w-lg mx-auto">
          <p className="text-center text-xs text-muted-foreground/50 mb-4">
            امکانات بیشتر
          </p>
          
          {/* Locked Tools Grid - Visually Disabled */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {lockedTools.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 0.4, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.05 }}
                  className="relative group cursor-not-allowed"
                >
                  <div className="p-3 rounded-xl bg-muted/50 border border-border/30">
                    <Icon className="w-5 h-5 text-muted-foreground/50" />
                  </div>
                  {/* Lock Indicator */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                    <Lock className="w-2.5 h-2.5 text-muted-foreground/60" />
                  </div>
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded whitespace-nowrap shadow-sm">
                      {tool.title}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
