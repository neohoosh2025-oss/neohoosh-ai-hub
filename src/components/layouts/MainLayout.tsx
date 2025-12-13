import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Home,
  BookOpen,
  Settings,
  MessageCircle,
  Users,
  ChevronLeft
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
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Modern Header */}
      {showHeader && (
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/30">
          <div className="flex items-center justify-center px-4 h-14 relative">
            {/* Left Side - Back Button */}
            {showBackButton && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => backPath ? navigate(backPath) : navigate(-1)}
                className="rounded-full h-9 w-9 absolute left-4"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}

            {/* Center - Brand Name */}
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
        </header>
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1",
        showNav && "pb-20"
      )}>
        {children}
      </main>

      {/* Bottom Navigation - Telegram Style with Better Animations */}
      {showNav && (
        <nav 
          className="fixed left-0 right-0 z-50 bg-background/98 backdrop-blur-xl border-t border-border/40"
          style={{ bottom: 0, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
            {navItems.map((item) => {
              const isActive = item.path === "/" 
                ? location.pathname === "/" 
                : location.pathname.startsWith(item.path);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className="relative flex flex-col items-center justify-center py-2 px-3 min-w-[60px] group"
                >
                  <motion.div
                    className="relative"
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {/* Active Background Pill */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="absolute inset-0 bg-primary/15 rounded-2xl -m-1.5"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>
                    
                    {/* Icon with Bounce Animation */}
                    <motion.div
                      className="relative z-10 w-10 h-10 flex items-center justify-center"
                      animate={isActive ? { y: [0, -3, 0] } : {}}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <Icon 
                        className={cn(
                          "w-[22px] h-[22px] transition-all duration-200",
                          isActive 
                            ? "text-primary" 
                            : "text-muted-foreground group-hover:text-foreground"
                        )} 
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </motion.div>
                  </motion.div>
                  
                  {/* Label with Fade Animation */}
                  <motion.span 
                    className={cn(
                      "text-[11px] mt-0.5 font-medium transition-colors duration-200",
                      isActive 
                        ? "text-primary" 
                        : "text-muted-foreground group-hover:text-foreground"
                    )}
                    animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {item.label}
                  </motion.span>
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