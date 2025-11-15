import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Mail, LogOut, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);
      setEmail(user.email || "");
      setDisplayName(user.user_metadata?.display_name || "");
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });

      if (error) throw error;

      toast.success(t("profile.updateSuccess") || "پروفایل با موفقیت به‌روز شد");
    } catch (error: any) {
      toast.error(error.message || "خطا در به‌روزرسانی پروفایل");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-6 w-6" />
              {t("profile.title") || "پروفایل کاربری"}
            </CardTitle>
            <CardDescription>
              {t("profile.description") || "اطلاعات حساب کاربری خود را مدیریت کنید"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {t("profile.email") || "ایمیل"}
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-sm text-muted-foreground">
                {t("profile.emailNote") || "ایمیل قابل تغییر نیست"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">
                {t("profile.displayName") || "نام نمایشی"}
              </Label>
              <Input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t("profile.displayNamePlaceholder") || "نام خود را وارد کنید"}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleUpdateProfile}
                disabled={saving}
                className="flex-1"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                {t("profile.save") || "ذخیره تغییرات"}
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                {t("logout")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
