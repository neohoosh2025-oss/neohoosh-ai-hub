import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Sparkles, 
  Settings, 
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  X,
  Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingTourProps {
  onComplete: () => void;
}

const tourSteps = [
  {
    id: "welcome",
    title: "به نئوهوش خوش آمدی!",
    description: "من دستیار هوشمند فارسی تو هستم. بیا با هم یه دور کوتاه بزنیم.",
    icon: Sparkles,
    gradient: "from-primary to-primary/60"
  },
  {
    id: "chat",
    title: "گفتگوی هوشمند",
    description: "هر سوالی داری بپرس! از نوشتن متن تا تحلیل داده، همه چیز در دسترسه.",
    icon: MessageSquare,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: "image",
    title: "تولید تصویر",
    description: "با نوشتن یک توضیح، تصاویر خلاقانه بساز. کافیه بنویسی 'یک تصویر از...'",
    icon: ImageIcon,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    id: "settings",
    title: "تنظیمات شخصی",
    description: "لحن، سبک و نحوه پاسخگویی من رو از تنظیمات شخصی‌سازی کن.",
    icon: Settings,
    gradient: "from-orange-500 to-red-500"
  },
  {
    id: "tips",
    title: "نکات کاربردی",
    description: "برای بهترین نتیجه، سوالاتت رو واضح و دقیق بپرس. من هر چی بیشتر توضیح بدی، بهتر کمکت می‌کنم!",
    icon: Lightbulb,
    gradient: "from-yellow-500 to-orange-500"
  }
];

export const OnboardingTour = ({ onComplete }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('neohoosh_onboarding_completed', 'true');
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = tourSteps[currentStep];
  const Icon = step.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-background/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Content */}
          <motion.div
            className="relative w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
          >
            {/* Skip Button */}
            <button
              onClick={handleSkip}
              className="absolute -top-12 left-0 text-muted-foreground hover:text-foreground transition-colors text-sm flex items-center gap-1"
            >
              رد شدن
              <X className="w-4 h-4" />
            </button>

            <div className="bg-card rounded-3xl border border-border/50 shadow-2xl overflow-hidden">
              {/* Icon Section */}
              <div className="p-8 pb-4 text-center">
                <motion.div
                  key={step.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 15 }}
                  className={cn(
                    "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6",
                    `bg-gradient-to-br ${step.gradient}`
                  )}
                >
                  <Icon className="w-10 h-10 text-white" />
                </motion.div>

                <motion.div
                  key={`content-${step.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-2xl font-bold text-foreground mb-3">
                    {step.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 py-4">
                {tourSteps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      i === currentStep 
                        ? "w-6 bg-primary" 
                        : i < currentStep 
                          ? "bg-primary/50" 
                          : "bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="p-6 pt-2 flex items-center justify-between gap-4">
                <Button
                  variant="ghost"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="rounded-xl"
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                  قبلی
                </Button>

                <Button
                  onClick={handleNext}
                  className="rounded-xl flex-1 max-w-[140px]"
                >
                  {currentStep === tourSteps.length - 1 ? "شروع کنیم!" : "بعدی"}
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OnboardingTour;
