import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, Share, PlusSquare, Check, Monitor, Tablet, ArrowLeft, Sparkles, Zap, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePWA } from '@/hooks/usePWA';
import { useNavigate } from 'react-router-dom';

const Install = () => {
  const { isInstalled, canInstall, installPrompt, isOnline } = usePWA();
  const navigate = useNavigate();
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));
  }, []);

  const features = [
    { icon: Zap, title: 'سریع و روان', description: 'بارگذاری فوری و بدون تأخیر' },
    { icon: WifiOff, title: 'حالت آفلاین', description: 'کار با اپ حتی بدون اینترنت' },
    { icon: Sparkles, title: 'تجربه اپ واقعی', description: 'مانند اپ‌های موبایل واقعی' },
  ];

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt();
    }
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">اپ نصب شده است!</h1>
          <p className="text-muted-foreground mb-6">نئوهوش روی دستگاه شما نصب شده.</p>
          <Button onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            ورود به اپ
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold text-foreground">نصب اپلیکیشن</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="container max-w-lg mx-auto px-4 py-8">
        {/* App Info */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <img src="/favicon.png" alt="نئوهوش" className="w-16 h-16 rounded-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">نئوهوش</h2>
          <p className="text-muted-foreground">پلتفرم هوش مصنوعی فارسی</p>
          
          {/* Online Status */}
          <div className={`inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-xs ${isOnline ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'آنلاین' : 'آفلاین'}
          </div>
        </motion.div>

        {/* Features */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid gap-3 mb-8"
        >
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/50 border-border/50">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Device-specific instructions */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Direct Install Button (Chrome/Edge on Desktop/Android) */}
          {canInstall && (
            <Button 
              onClick={handleInstall}
              className="w-full h-14 text-lg gap-3 bg-primary hover:bg-primary/90"
            >
              <Download className="w-6 h-6" />
              نصب اپلیکیشن
            </Button>
          )}

          {/* iOS Guide */}
          {isIOS && !canInstall && (
            <Card className="bg-card/50 border-border/50 overflow-hidden">
              <button 
                onClick={() => setShowIOSGuide(!showIOSGuide)}
                className="w-full p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-semibold text-foreground">راهنمای نصب در iOS</span>
                </div>
                <motion.div animate={{ rotate: showIOSGuide ? 180 : 0 }}>
                  <ArrowLeft className="w-5 h-5 text-muted-foreground rotate-90" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {showIOSGuide && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center shrink-0 text-sm font-bold">۱</div>
                        <div>
                          <p className="text-foreground">روی دکمه <Share className="w-4 h-4 inline mx-1" /> Share کلیک کنید</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center shrink-0 text-sm font-bold">۲</div>
                        <div>
                          <p className="text-foreground">گزینه <PlusSquare className="w-4 h-4 inline mx-1" /> Add to Home Screen را انتخاب کنید</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center shrink-0 text-sm font-bold">۳</div>
                        <div>
                          <p className="text-foreground">روی Add بزنید</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          )}

          {/* Android Guide (if install prompt not available) */}
          {isAndroid && !canInstall && (
            <Card className="bg-card/50 border-border/50 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <span className="font-semibold text-foreground">راهنمای نصب در اندروید</span>
              </div>
              <p className="text-muted-foreground text-sm">
                از منوی مرورگر (⋮) گزینه "Add to Home screen" یا "نصب اپلیکیشن" را انتخاب کنید.
              </p>
            </Card>
          )}

          {/* Desktop Guide */}
          {!isIOS && !isAndroid && !canInstall && (
            <Card className="bg-card/50 border-border/50 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-primary" />
                </div>
                <span className="font-semibold text-foreground">نصب روی دسکتاپ</span>
              </div>
              <p className="text-muted-foreground text-sm">
                در نوار آدرس مرورگر Chrome یا Edge روی آیکون نصب کلیک کنید.
              </p>
            </Card>
          )}

          {/* Skip Button */}
          <Button 
            variant="ghost" 
            className="w-full text-muted-foreground"
            onClick={() => navigate('/')}
          >
            بعداً نصب می‌کنم
          </Button>
        </motion.div>

        {/* Supported Devices */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground mb-3">پشتیبانی از همه دستگاه‌ها</p>
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Smartphone className="w-4 h-4" />
              <span className="text-xs">موبایل</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Tablet className="w-4 h-4" />
              <span className="text-xs">تبلت</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Monitor className="w-4 h-4" />
              <span className="text-xs">دسکتاپ</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Install;
