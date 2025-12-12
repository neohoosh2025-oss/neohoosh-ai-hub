import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { 
  MessageCircle, 
  Wand2, 
  BookOpen, 
  User,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PWALayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
  showHeader?: boolean;
  headerTitle?: string;
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
}

const navItems = [
  { icon: Home, label: "خانه", href: "/", path: "/" },
  { icon: MessageCircle, label: "چت", href: "/chat", path: "/chat" },
  { icon: Wand2, label: "ابزار", href: "/tools", path: "/tools" },
  { icon: BookOpen, label: "مقالات", href: "/articles", path: "/articles" },
  { icon: User, label: "پروفایل", href: "/profile", path: "/profile" },
];

export function PWALayout({ 
  children, 
  showBottomNav = true, 
  showHeader = false,
  headerTitle,
  headerLeft,
  headerRight 
}: PWALayoutProps) {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Optional Header */}
      {showHeader && (
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 safe-area-top">
          <div className="flex items-center justify-between px-4 h-14">
            <div className="flex items-center gap-3">
              {headerLeft}
            </div>
            {headerTitle && (
              <h1 className="font-semibold text-lg absolute left-1/2 -translate-x-1/2">
                {headerTitle}
              </h1>
            )}
            <div className="flex items-center gap-2">
              {headerRight}
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1",
        showBottomNav && "pb-20"
      )}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
          <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[60px] relative",
                    isActive 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="relative"
                  >
                    <Icon className={cn(
                      "w-5 h-5 transition-all",
                      isActive && "scale-110"
                    )} />
                    {isActive && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                      />
                    )}
                  </motion.div>
                  <span className={cn(
                    "text-[10px] mt-1 font-medium transition-all",
                    isActive ? "opacity-100" : "opacity-70"
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

export default PWALayout;
