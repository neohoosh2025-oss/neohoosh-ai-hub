import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home,
  BookOpen,
  Settings,
  MessageCircle,
  Users,
  ChevronLeft,
  LogIn
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
  headerTitle?: string;
  showBackButton?: boolean;
  backPath?: string;
}

const navItems = [
  { icon: MessageCircle, label: "چت‌بات", href: "/chat", path: "/chat" },
  { icon: BookOpen, label: "مقالات", href: "/articles", path: "/articles" },
  { icon: Home, label: "خانه", href: "/", path: "/" },
  { icon: Users, label: "نئوهای", href: "/neohi", path: "/neohi" },
  { icon: Settings, label: "تنظیمات", href: "/settings", path: "/settings" },
];

export function MainLayout({ 
  children, 
  showHeader = true, 
  showNav = true,
  headerTitle,
  showBackButton = false,
  backPath
}: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Modern Header */}
      {showHeader && (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/30">
          <div className="flex items-center justify-between px-4 h-14">
            {/* Left Side */}
            <div className="w-12 flex items-center">
              {showBackButton ? (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => backPath ? navigate(backPath) : navigate(-1)}
                  className="rounded-full h-9 w-9"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              ) : user ? (
                <Link to="/settings">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-sm font-bold shadow-sm cursor-pointer"
                  >
                    {user.user_metadata?.display_name?.charAt(0)?.toUpperCase() || 
                     user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </motion.div>
                </Link>
              ) : null}
            </div>

            {/* Center - Brand Name */}
            <div className="flex-1 flex items-center justify-center">
              <Link to="/" className="flex items-center gap-2">
                <motion.span 
                  className="text-xl font-pacifico bg-gradient-to-l from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  NeoHoosh
                </motion.span>
              </Link>
            </div>

            {/* Right Side */}
            <div className="w-12 flex items-center justify-end">
              {!user && (
                <Link to="/auth">
                  <Button 
                    size="icon" 
                    variant="ghost"
                    className="rounded-full h-9 w-9"
                  >
                    <LogIn className="w-5 h-5" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1",
        showNav && "pb-20"
      )}>
        {children}
      </main>

      {/* Bottom Navigation - 5 Items */}
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border/30 safe-area-bottom">
          <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
            {navItems.map((item) => {
              const isActive = item.path === "/" 
                ? location.pathname === "/" 
                : location.pathname.startsWith(item.path);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 min-w-[56px]"
                >
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className="relative"
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                      isActive 
                        ? "bg-primary/10" 
                        : "bg-transparent"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5 transition-colors",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
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
      )}
    </div>
  );
}

export default MainLayout;
