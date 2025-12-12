import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { 
  Bot, 
  Wand2, 
  BookOpen, 
  Settings
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
  { icon: Bot, label: "چت", href: "/chat", path: "/chat" },
  { icon: Wand2, label: "ابزارها", href: "/tools", path: "/tools" },
  { icon: BookOpen, label: "مقالات", href: "/articles", path: "/articles" },
  { icon: Settings, label: "تنظیمات", href: "/profile", path: "/profile" },
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

      {/* Telegram-style Bottom Navigation */}
      {showBottomNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 safe-area-bottom">
          <div className="flex items-center justify-around h-16 px-4 max-w-lg mx-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[64px] relative"
                  )}
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="relative"
                  >
                    <Icon className={cn(
                      "w-6 h-6 transition-colors",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                  </motion.div>
                  <span className={cn(
                    "text-[11px] mt-1 font-medium transition-colors",
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

export default PWALayout;
