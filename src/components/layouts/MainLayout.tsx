import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home,
  BookOpen,
  Settings,
  User,
  LogIn,
  ChevronLeft
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
  { icon: Home, label: "خانه", href: "/", path: "/" },
  { icon: BookOpen, label: "مقالات", href: "/articles", path: "/articles" },
  { icon: Settings, label: "تنظیمات", href: "/profile", path: "/profile" },
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
        <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/40 shadow-sm">
          <div className="flex items-center justify-between px-4 h-14">
            {/* Left Side */}
            <div className="w-20 flex items-center">
              {showBackButton ? (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => backPath ? navigate(backPath) : navigate(-1)}
                  className="rounded-full h-9 w-9"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              ) : null}
            </div>

            {/* Center - Brand Name */}
            <div className="flex-1 flex items-center justify-center">
              <Link to="/" className="flex items-center gap-2">
                <motion.span 
                  className="text-2xl font-pacifico bg-gradient-to-l from-primary via-secondary to-accent bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  NeoHoosh
                </motion.span>
              </Link>
            </div>

            {/* Right Side - Auth */}
            <div className="w-20 flex items-center justify-end">
              {user ? (
                <Link to="/profile">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-sm font-bold shadow-md cursor-pointer"
                  >
                    {user.user_metadata?.display_name?.charAt(0)?.toUpperCase() || 
                     user.email?.charAt(0)?.toUpperCase() || 'U'}
                  </motion.div>
                </Link>
              ) : (
                <Link to="/auth">
                  <Button 
                    size="sm" 
                    className="rounded-full h-9 px-4 text-xs gap-1.5 shadow-md bg-gradient-to-r from-primary to-primary/90"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    ورود
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
        showNav && "pb-16"
      )}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/40 shadow-lg">
          <div className="flex items-center justify-around h-14 px-4 max-w-lg mx-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== "/" && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[60px]"
                >
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    className="relative"
                  >
                    <Icon className={cn(
                      "w-5 h-5 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                    {isActive && (
                      <motion.div
                        layoutId="main-nav-indicator"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary"
                      />
                    )}
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
      )}
    </div>
  );
}

export default MainLayout;
