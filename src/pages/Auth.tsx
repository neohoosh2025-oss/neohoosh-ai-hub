import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { Phone, Cpu, Orbit, Sparkles } from "lucide-react";

const Auth = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Format phone number to E.164 format if needed
    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+98' + formattedPhone; // Default Iran country code
    }

    const { error } = await supabase.auth.signInWithOtp({
      phone: formattedPhone,
    });

    if (error) {
      toast({
        title: t("contact.error") || "خطا",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setOtpSent(true);
      toast({
        title: t("contact.success") || "موفق",
        description: "کد تایید به شماره شما ارسال شد",
      });
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let formattedPhone = phoneNumber.trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+98' + formattedPhone;
    }

    const { error } = await supabase.auth.verifyOtp({
      phone: formattedPhone,
      token: otp,
      type: 'sms',
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

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  شماره تلفن
                </Label>
                <div className="flex gap-2" dir="ltr">
                  <div className="flex items-center px-3 py-2 bg-muted rounded-md border border-input">
                    <span className="text-sm text-muted-foreground">+98</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="9123456789"
                    required
                    disabled={loading}
                    className="bg-background/50 flex-1"
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-muted-foreground" dir="rtl">
                  شماره تلفن همراه خود را بدون صفر وارد کنید
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading || phoneNumber.length !== 10}>
                {loading ? "در حال ارسال..." : "ارسال کد تایید"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  کد تایید
                </Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  required
                  disabled={loading}
                  className="bg-background/50 text-center text-2xl tracking-widest"
                  maxLength={6}
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground text-center" dir="rtl">
                  کد 6 رقمی ارسال شده به شماره +98{phoneNumber} را وارد کنید
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={loading || otp.length !== 6}>
                {loading ? "در حال تایید..." : "تایید و ورود"}
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full"
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
              >
                ویرایش شماره تلفن
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
