import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { MainLayout } from "@/components/layouts/MainLayout";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

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
          navigate("/settings");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        navigate("/settings");
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
    <MainLayout>
      <div className="flex-1 flex items-center justify-center px-4 py-8 min-h-[calc(100vh-140px)]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <motion.div 
            className="flex justify-center mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
          >
            <div className="relative">
              <motion.div 
                className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div 
                className="relative bg-gradient-to-br from-primary to-primary/70 p-6 rounded-3xl shadow-xl"
                whileHover={{ scale: 1.05, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-12 h-12 text-primary-foreground" />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50 shadow-xl bg-card">
              <CardHeader className="text-center pb-2 px-6 pt-6">
                <CardTitle className="text-xl font-bold">
                  {isForgotPassword ? "بازیابی رمز عبور" : (isSignUp ? "ثبت نام" : "ورود به نئوهوش")}
                </CardTitle>
                <CardDescription className="text-sm">
                  {isForgotPassword 
                    ? "ایمیل خود را وارد کنید"
                    : "به دنیای هوش مصنوعی خوش آمدید"
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="px-6 pb-6">
                <form onSubmit={handleAuth} className="space-y-4">
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Label htmlFor="email" className="text-sm">ایمیل</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      disabled={loading}
                      className="h-12 rounded-2xl"
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
                        <Label htmlFor="password" className="text-sm">رمز عبور</Label>
                        <Button
                          type="button"
                          variant="link"
                          className="h-auto p-0 text-xs text-primary"
                          onClick={() => setIsForgotPassword(true)}
                        >
                          فراموشی رمز عبور؟
                        </Button>
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
                          className="h-12 pl-12 rounded-2xl"
                          dir="ltr"
                          minLength={6}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute left-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-xl hover:bg-muted"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-sm rounded-2xl" 
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        isForgotPassword ? "ارسال لینک بازیابی" : 
                        isSignUp ? "ثبت نام" : "ورود"
                      )}
                    </Button>
                  </motion.div>
                  
                  {!isForgotPassword && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="w-full text-sm rounded-2xl"
                        onClick={() => setIsSignUp(!isSignUp)}
                        disabled={loading}
                      >
                        {isSignUp ? "قبلاً ثبت نام کرده‌اید؟ وارد شوید" : "حساب کاربری ندارید؟ ثبت نام کنید"}
                      </Button>
                    </motion.div>
                  )}
                  
                  {isForgotPassword && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full text-sm rounded-2xl"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setEmail("");
                      }}
                      disabled={loading}
                    >
                      بازگشت به صفحه ورود
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Auth;