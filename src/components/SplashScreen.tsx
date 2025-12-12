import { motion } from "framer-motion";
import logo from "@/assets/neohoosh-logo-new.png";

interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      onAnimationComplete={() => {
        setTimeout(() => onComplete?.(), 1200);
      }}
      className="fixed inset-0 z-[200] bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 2, opacity: 0.1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-primary"
        />
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 3, opacity: 0.05 }}
          transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-secondary"
        />
      </div>

      {/* Logo Container */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring",
          stiffness: 200,
          damping: 15,
          delay: 0.1 
        }}
        className="relative flex flex-col items-center gap-6"
      >
        {/* Glowing Ring */}
        <motion.div
          className="absolute inset-0 -m-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        >
          <div className="w-full h-full rounded-full border-2 border-primary/30 blur-sm" />
        </motion.div>

        {/* Logo */}
        <motion.div
          className="relative"
          animate={{ 
            rotateY: [0, 360],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            delay: 0.3
          }}
        >
          <motion.img
            src={logo}
            alt="نئوهوش"
            className="w-24 h-24 drop-shadow-2xl"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.5
            }}
          />
        </motion.div>

        {/* Brand Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center"
        >
          <motion.h1 
            className="text-3xl font-bold"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{ duration: 3, repeat: Infinity }}
            style={{
              background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--primary)))",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            نئوهوش
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-muted-foreground mt-2"
          >
            دنیای هوش مصنوعی
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Loading Bar */}
      <motion.div
        initial={{ opacity: 0, width: 0 }}
        animate={{ opacity: 1, width: "120px" }}
        transition={{ delay: 0.7 }}
        className="absolute bottom-24 h-1 bg-muted/30 rounded-full overflow-hidden"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ 
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
