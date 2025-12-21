import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, MessageSquare, Mic, Settings, History, Sparkles } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  position: 'center' | 'bottom';
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'به نئوهوش خوش آمدید! 🎉',
    description: 'دستیار هوشمند شما آماده کمک است. بیایید یک تور کوتاه از امکانات داشته باشیم.',
    icon: <Sparkles className="h-8 w-8" />,
    position: 'center',
  },
  {
    id: 'chat',
    title: 'چت هوشمند',
    description: 'هر سوالی دارید بپرسید! از نوشتن متن و کد گرفته تا ترجمه و خلاصه‌سازی.',
    icon: <MessageSquare className="h-8 w-8" />,
    position: 'center',
  },
  {
    id: 'models',
    title: 'انتخاب مدل هوش مصنوعی',
    description: 'از بالای صفحه می‌توانید مدل‌های مختلف AI مثل GPT-4 و Gemini را انتخاب کنید.',
    icon: <Sparkles className="h-8 w-8" />,
    position: 'center',
  },
  {
    id: 'voice',
    title: 'ورودی صوتی',
    description: 'با آیکون میکروفون می‌توانید به جای تایپ، صحبت کنید و پیام صوتی ارسال کنید.',
    icon: <Mic className="h-8 w-8" />,
    position: 'center',
  },
  {
    id: 'history',
    title: 'تاریخچه گفتگو',
    description: 'تمام مکالمات شما ذخیره می‌شود و می‌توانید هر زمان به آن‌ها دسترسی داشته باشید.',
    icon: <History className="h-8 w-8" />,
    position: 'center',
  },
  {
    id: 'settings',
    title: 'تنظیمات',
    description: 'از منوی تنظیمات می‌توانید تم، زبان و سایر گزینه‌ها را شخصی‌سازی کنید.',
    icon: <Settings className="h-8 w-8" />,
    position: 'center',
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
}

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
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
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            key={step.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-card border border-border/50 rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header with gradient */}
            <div className="relative h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent flex items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--primary)/0.3),transparent_70%)]" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="relative z-10 p-4 rounded-2xl bg-primary/10 text-primary"
              >
                {step.icon}
              </motion.div>
              
              {/* Close button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 left-4 p-2 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Step indicator */}
              <div className="absolute top-4 right-4 text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
                {currentStep + 1} / {tourSteps.length}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 text-center">
              <motion.h3
                key={`title-${step.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl font-bold text-foreground mb-3"
              >
                {step.title}
              </motion.h3>
              <motion.p
                key={`desc-${step.id}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-muted-foreground text-sm leading-relaxed"
              >
                {step.description}
              </motion.p>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 pb-4">
              {tourSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'w-6 bg-primary' 
                      : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between p-4 border-t border-border/50 bg-muted/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrev}
                disabled={isFirstStep}
                className="gap-1"
              >
                <ChevronRight className="h-4 w-4" />
                قبلی
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                رد شدن
              </Button>

              <Button
                size="sm"
                onClick={handleNext}
                className="gap-1 min-w-[80px]"
              >
                {isLastStep ? 'شروع کنید!' : 'بعدی'}
                {!isLastStep && <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
