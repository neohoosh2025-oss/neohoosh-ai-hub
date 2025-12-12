import { motion } from "framer-motion";
import { WifiOff, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/neohoosh-logo-new.png";

interface OfflinePageProps {
  onRetry?: () => void;
}

export const OfflinePage = ({ onRetry }: OfflinePageProps) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="mb-8"
        >
          <img src={logo} alt="نئوهوش" className="w-20 h-20 mx-auto opacity-50" />
        </motion.div>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-muted/50 border border-border/50 flex items-center justify-center"
        >
          <WifiOff className="w-12 h-12 text-muted-foreground" />
        </motion.div>

        {/* Text */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold mb-3"
        >
          اتصال برقرار نیست
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-8 leading-relaxed"
        >
          اینترنت شما قطع است. لطفاً اتصال خود را بررسی کنید و دوباره تلاش کنید.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-3"
        >
          <Button
            onClick={handleRetry}
            size="lg"
            className="w-full h-12 rounded-xl gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            تلاش مجدد
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.href = '/'}
            className="w-full h-12 rounded-xl gap-2"
          >
            <Home className="w-5 h-5" />
            صفحه اصلی
          </Button>
        </motion.div>

        {/* Tip */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-muted-foreground mt-8"
        >
          برخی صفحات در حالت آفلاین در دسترس هستند
        </motion.p>
      </motion.div>
    </div>
  );
};

export default OfflinePage;
