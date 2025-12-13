import { ReactNode } from "react";
import { motion } from "framer-motion";
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

      {/* Bottom Navigation - Clean Minimal Style */}
      {showNav && (
        <nav 
          className="fixed left-0 right-0 z-50 bg-background border-t border-border/50"
          style={{ bottom: 0, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
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
                  className="relative flex flex-col items-center justify-center py-2 px-4 min-w-[56px]"
                >
                  <motion.div
                    className="relative flex flex-col items-center"
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {/* Icon Container */}
                    <div className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300",
                      isActive && "bg-primary/10"
                    )}>
                      <Icon 
                        className={cn(
                          "w-[22px] h-[22px] transition-all duration-200",
                          isActive 
                            ? "text-primary" 
                            : "text-muted-foreground"
                        )} 
                        strokeWidth={isActive ? 2.5 : 1.8}
                      />
                    </div>
                    
                    {/* Label */}
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