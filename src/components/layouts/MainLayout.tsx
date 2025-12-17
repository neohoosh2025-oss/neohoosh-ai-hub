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
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
  headerTitle?: string;
  showBackButton?: boolean;
  backPath?: string;
}

// Only chat is accessible, others are locked
const navItems = [
  { icon: MessageCircle, label: "چت‌بات", href: "/chat", path: "/chat", locked: false },
  { icon: BookOpen, label: "مقالات", href: "/articles", path: "/articles", locked: true },
  { icon: Home, label: "خانه", href: "/", path: "/", locked: false },
  { icon: Users, label: "نئوهای", href: "/neohi", path: "/neohi", locked: true },
  { icon: Settings, label: "تنظیمات", href: "/settings", path: "/settings", locked: true },
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
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Calm Header - Minimal */}
      {showHeader && (
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/20">
          <div className="flex items-center justify-center px-4 h-14 relative">
            {/* Back Button */}
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => backPath ? navigate(backPath) : navigate(-1)}
                className="rounded-full h-9 w-9 absolute left-4 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}

            {/* Brand Name - Calm Typography */}
            <Link to="/" className="flex items-center gap-2">
              <motion.span 
                className="text-lg font-medium text-foreground/90"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                نئوهوش
              </motion.span>
            </Link>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1",
        showHeader && "pt-14",
        showNav && "pb-20"
      )}>
        {children}
      </main>

      {/* Bottom Navigation - Calm Design with Locked States */}
      {showNav && (
        <nav 
          className="fixed left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/20"
          style={{ bottom: 0, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
            {navItems.map((item) => {
              const isActive = item.path === "/" 
                ? location.pathname === "/" 
                : location.pathname.startsWith(item.path);
              const Icon = item.icon;
              
              // If locked, show disabled state
              if (item.locked) {
                return (
                  <div
                    key={item.href}
                    className="relative flex flex-col items-center justify-center py-2 px-4 min-w-[56px] opacity-40 cursor-not-allowed"
                  >
                    <div className="relative flex flex-col items-center">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-muted/30">
                        <Icon className="w-[20px] h-[20px] text-muted-foreground/50" strokeWidth={1.5} />
                      </div>
                      <span className="text-[10px] mt-0.5 font-medium text-muted-foreground/50">
                        {item.label}
                      </span>
                      {/* Lock indicator */}
                      <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-muted flex items-center justify-center">
                        <Lock className="w-2 h-2 text-muted-foreground/60" />
                      </div>
                    </div>
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="relative flex flex-col items-center justify-center py-2 px-4 min-w-[56px]"
                >
                  <motion.div
                    className="relative flex flex-col items-center"
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300",
                      isActive && "bg-primary/10"
                    )}>
                      <Icon 
                        className={cn(
                          "w-[20px] h-[20px] transition-all duration-200",
                          isActive 
                            ? "text-primary" 
                            : "text-muted-foreground"
                        )} 
                        strokeWidth={isActive ? 2.2 : 1.8}
                      />
                    </div>
                    
                    <span className={cn(
                      "text-[10px] mt-0.5 font-medium transition-colors duration-200",
                      isActive 
                        ? "text-primary" 
                        : "text-muted-foreground"
                    )}>
                      {item.label}
                    </span>
                  </motion.div>
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