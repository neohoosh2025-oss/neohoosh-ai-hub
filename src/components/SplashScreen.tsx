import { motion } from "framer-motion";

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
      className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="text-center"
      >
        {/* Brand Name */}
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-brand font-semibold text-foreground tracking-tight"
        >
          NeoHoosh
        </motion.h1>

        {/* Subtle line */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "100%", opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-4 mx-auto max-w-[100px]"
        />
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
