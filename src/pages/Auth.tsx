import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Bot, Wand2, BookOpen, Users, Settings } from "lucide-react";
import logo from "@/assets/neohoosh-logo-new.png";
import { cn } from "@/lib/utils";
import type { Session, User } from "@supabase/supabase-js";

const Auth = () => {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const navItems = [
    { icon: Bot, label: "چت", href: "/chat", path: "/chat" },
    { icon: Users, label: "نئوهای", href: "/neohi", path: "/neohi" },
    { icon: Wand2, label: "ابزارها", href: "/tools", path: "/tools" },
    { icon: BookOpen, label: "مقالات", href: "/articles", path: "/articles" },
    { icon: Settings, label: "تنظیمات", href: "/profile", path: "/profile" },
  ];

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          navigate("/profile");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session) {
        navigate("/profile");
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 h-12">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="نئوهوش" className="w-7 h-7" />
            <span className="font-bold text-base">نئوهوش</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 pb-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="relative">
              <motion.div 
                className="absolute inset-0 bg-primary/20 rounded-full blur-2xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="relative bg-gradient-to-br from-primary to-secondary p-4 rounded-2xl shadow-xl">
                <img src={logo} alt="نئوهوش" className="w-10 h-10" />
              </div>
            </div>
          </motion.div>

          <Card className="border-border/50 shadow-xl backdrop-blur-sm bg-card/80">
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
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">ایمیل</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    disabled={loading}
                    className="h-11 rounded-xl"
                    dir="ltr"
                  />
                </div>
                
                {!isForgotPassword && (
                  <div className="space-y-2">
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
                        className="h-11 pl-10 rounded-xl"
                        dir="ltr"
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute left-0 top-0 h-full px-3 hover:bg-transparent"
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
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-11 text-sm rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90" 
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    isForgotPassword ? "ارسال لینک بازیابی" : 
                    isSignUp ? "ثبت نام" : "ورود"
                  )}
                </Button>
                
                {!isForgotPassword && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full text-sm"
                    onClick={() => setIsSignUp(!isSignUp)}
                    disabled={loading}
                  >
                    {isSignUp ? "قبلاً ثبت نام کرده‌اید؟ وارد شوید" : "حساب کاربری ندارید؟ ثبت نام کنید"}
                  </Button>
                )}
                
                {isForgotPassword && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full text-sm"
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
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50">
        <div className="flex items-center justify-around h-14 px-2 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex flex-col items-center justify-center p-1.5 rounded-xl transition-all duration-200 min-w-[52px]"
              >
                <motion.div whileTap={{ scale: 0.9 }} className="relative">
                  <Icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                </motion.div>
                <span className={cn(
                  "text-[10px] mt-0.5 font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Auth;
