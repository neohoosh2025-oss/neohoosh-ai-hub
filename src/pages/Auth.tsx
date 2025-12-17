import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          navigate("/chat");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate("/chat");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth`,
        });

        if (error) throw error;

        toast.success("لینک بازیابی رمز عبور به ایمیل شما ارسال شد");
        setIsForgotPassword(false);
        setEmail("");
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        toast.success("حساب شما ایجاد شد. در حال ورود...");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
      }
    } catch (error: any) {
      toast.error(error.message || "مشکلی پیش آمد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      {/* Subtle Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-background via-background to-muted/20 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-sm z-10"
      >
        {/* Calm Logo */}
        <motion.div 
          className="flex flex-col items-center mb-12"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center mb-4">
            <span className="text-2xl font-light text-primary/80">N</span>
          </div>
          <h1 className="text-xl font-light text-foreground/90 tracking-wide">
            NeoHoosh
          </h1>
        </motion.div>

        {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-3xl p-8 shadow-sm"
        >
          {/* Title */}
          <div className="text-center mb-8">
            <h2 className="text-lg font-medium text-foreground/90 mb-2">
              {isForgotPassword ? "بازیابی رمز عبور" : (isSignUp ? "ایجاد حساب" : "خوش آمدید")}
            </h2>
            <p className="text-sm text-muted-foreground/70">
              {isForgotPassword 
                ? "ایمیل خود را وارد کنید"
                : isSignUp 
                  ? "برای شروع ثبت نام کنید"
                  : "وقتتون رو بگیرید"
              }
            </p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-5">
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label htmlFor="email" className="text-sm text-foreground/70 font-normal">
                ایمیل
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
                className="h-12 rounded-2xl bg-muted/30 border-border/30 focus:border-primary/40 focus:ring-primary/20 placeholder:text-muted-foreground/40"
                dir="ltr"
              />
            </motion.div>
            
            {!isForgotPassword && (
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm text-foreground/70 font-normal">
                    رمز عبور
                  </Label>
                  {!isSignUp && (
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0 text-xs text-primary/70 hover:text-primary"
                      onClick={() => setIsForgotPassword(true)}
                    >
                      فراموشی؟
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="h-12 pl-12 rounded-2xl bg-muted/30 border-border/30 focus:border-primary/40 focus:ring-primary/20 placeholder:text-muted-foreground/40"
                    dir="ltr"
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute left-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl hover:bg-muted/50"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground/60" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground/60" />
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="pt-2"
            >
              <Button 
                type="submit" 
                className="w-full h-12 text-sm font-medium rounded-2xl bg-primary/90 hover:bg-primary text-primary-foreground transition-all duration-300" 
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isForgotPassword ? "ارسال لینک" : 
                  isSignUp ? "ثبت نام" : "ورود"
                )}
              </Button>
            </motion.div>
          </form>
          
          {/* Switch Mode */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 pt-6 border-t border-border/20"
          >
            {!isForgotPassword ? (
              <button 
                type="button" 
                className="w-full text-sm text-muted-foreground/70 hover:text-foreground/80 transition-colors"
                onClick={() => setIsSignUp(!isSignUp)}
                disabled={loading}
              >
                {isSignUp ? "قبلاً حساب دارید؟ وارد شوید" : "حساب ندارید؟ ثبت نام کنید"}
              </button>
            ) : (
              <button 
                type="button" 
                className="w-full text-sm text-muted-foreground/70 hover:text-foreground/80 transition-colors"
                onClick={() => {
                  setIsForgotPassword(false);
                  setEmail("");
                }}
                disabled={loading}
              >
                بازگشت به ورود
              </button>
            )}
          </motion.div>
        </motion.div>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-xs text-muted-foreground/50 mt-8"
        >
          با ورود، شرایط استفاده را می‌پذیرید
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Auth;
