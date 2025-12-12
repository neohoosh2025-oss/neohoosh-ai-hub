import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowRight, Search, MessageCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* Animated 404 */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="relative mb-8"
        >
          <span className="text-[150px] font-bold bg-gradient-to-br from-primary via-secondary to-accent bg-clip-text text-transparent leading-none">
            404
          </span>
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              y: [0, -5, 5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary/10 rounded-full blur-2xl"
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold mb-3">صفحه پیدا نشد</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            صفحه‌ای که دنبالش می‌گردید وجود نداره یا منتقل شده.
            می‌تونید به صفحه اصلی برگردید یا با AI چت کنید.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link to="/">
            <Button size="lg" className="w-full sm:w-auto gap-2">
              <Home className="w-4 h-4" />
              صفحه اصلی
            </Button>
          </Link>
          <Link to="/chat">
            <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
              <MessageCircle className="w-4 h-4" />
              چت با AI
            </Button>
          </Link>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 pt-8 border-t border-border"
        >
          <p className="text-sm text-muted-foreground mb-4">لینک‌های مفید:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { label: "ابزارها", href: "/tools" },
              { label: "مقالات", href: "/articles" },
              { label: "درباره ما", href: "/about" },
              { label: "تماس", href: "/contact" },
            ].map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="px-4 py-2 rounded-full bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
