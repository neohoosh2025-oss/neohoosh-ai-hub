import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Lock, Cpu, Orbit, Sparkles, Chrome } from "lucide-react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast({
        title: t("contact.error") || "خطا",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("contact.success") || "موفق",
        description: t("auth.signupSuccess") || "حساب شما ایجاد شد. لطفا وارد شوید.",
      });
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: t("contact.error") || "خطا",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast({
        title: t("contact.error") || "خطا",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast({
        title: t("contact.error") || "خطا",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("contact.success") || "موفق",
        description: t("auth.resetSent") || "ایمیل بازیابی رمز عبور ارسال شد",
      });
      setShowReset(false);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Quantum Processor Background Animation */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neohoosh-blue/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Quantum Circuit Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--neohoosh-blue))" />
            </linearGradient>
          </defs>
          <g className="animate-pulse">
            <line x1="0" y1="200" x2="400" y2="200" stroke="url(#circuit-gradient)" strokeWidth="2" strokeDasharray="5,5" className="animate-dash" />
            <circle cx="200" cy="200" r="30" stroke="url(#circuit-gradient)" strokeWidth="2" fill="none" className="animate-spin-slow" />
            <line x1="600" y1="400" x2="1000" y2="400" stroke="url(#circuit-gradient)" strokeWidth="2" strokeDasharray="5,5" className="animate-dash" />
            <circle cx="800" cy="400" r="40" stroke="url(#circuit-gradient)" strokeWidth="2" fill="none" className="animate-spin-slow" />
          </g>
        </svg>
      </div>

      <div className="w-full max-w-md relative">
        {/* Quantum Processor Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-primary to-neohoosh-blue p-6 rounded-2xl">
              <Cpu className="h-12 w-12 text-white animate-pulse" />
              <Orbit className="h-6 w-6 text-white absolute top-2 right-2 animate-spin-slow" />
              <Sparkles className="h-4 w-4 text-white absolute bottom-2 left-2 animate-pulse" />
            </div>
          </div>
        </div>

        <div className="bg-background/80 backdrop-blur-xl border border-primary/20 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-neohoosh-blue bg-clip-text text-transparent">
            {t("auth.title") || "ورود به سیستم"}
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            {t("auth.subtitle") || "به دنیای هوش مصنوعی خوش آمدید"}
          </p>

          {!showReset ? (
            <Tabs defaultValue="signin" dir={language === "en" ? "ltr" : "rtl"}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="signin">{t("login") || "ورود"}</TabsTrigger>
                <TabsTrigger value="signup">{t("auth.signup") || "ثبت‌نام"}</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                    {t("contactPage.email") || "ایمیل"}
                    </Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {t("auth.password") || "رمز عبور"}
                    </Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-background/50"
                    />
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="link" 
                    className="text-sm px-0"
                    onClick={() => setShowReset(true)}
                  >
                    {t("auth.forgotPassword") || "رمز عبور را فراموش کرده‌اید"}
                  </Button>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t("auth.signingIn") || "در حال ورود..." : t("login") || "ورود"}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        {t("auth.orContinueWith") || "یا ادامه با"}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleGoogleSignIn}
                  >
                    <Chrome className="h-4 w-4" />
                    Google
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t("contactPage.email") || "ایمیل"}
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      {t("auth.password") || "رمز عبور"}
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-background/50"
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t("auth.signingUp") || "در حال ثبت‌نام..." : t("auth.signup") || "ثبت‌نام"}
                  </Button>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        {t("auth.orContinueWith") || "یا ادامه با"}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={handleGoogleSignIn}
                  >
                    <Chrome className="h-4 w-4" />
                    Google
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {t("contactPage.email") || "ایمیل"}
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="bg-background/50"
                  placeholder={t("auth.enterEmail") || "ایمیل خود را وارد کنید"}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("auth.sending") || "در حال ارسال..." : t("auth.sendReset") || "ارسال لینک بازیابی"}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full"
                onClick={() => setShowReset(false)}
              >
                {t("auth.backToLogin") || "بازگشت به ورود"}
              </Button>
            </form>
          )}
        </div>
      </div>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -100;
          }
        }
        .animate-dash {
          animation: dash 10s linear infinite;
        }
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, hsl(var(--primary) / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary) / 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
};

export default Auth;
