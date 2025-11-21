import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Mail, LogOut, Loader2, Brain, Activity, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface UserComment {
  id: string;
  message: string;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
  approved: boolean;
}

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [comments, setComments] = useState<UserComment[]>([]);

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
      
      // Fetch user's comments
      const { data: commentsData } = await supabase
        .from("comments")
        .select("*")
        .eq("email", user.email)
        .order("created_at", { ascending: false });
      
      if (commentsData) {
        setComments(commentsData);
      }
      
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
      <div className="container mx-auto px-4 max-w-2xl space-y-6">
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

            {/* Quick Access Links */}
            <div className="pt-6 border-t">
              <h3 className="font-semibold mb-4">{t("profile.quickAccess")}</h3>
              <div className="space-y-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{t("profile.userDashboard")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("profile.dashboardDescription")}
                    </p>
                  </div>
                </Link>
                <Link
                  to="/memory"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{t("profile.memoryManagement")}</p>
                    <p className="text-sm text-muted-foreground">
                      {t("profile.memoryDescription")}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              پیام‌های شما
            </CardTitle>
            <CardDescription>
              پیام‌هایی که برای ما ارسال کرده‌اید و پاسخ‌های دریافتی
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                شما هنوز هیچ پیامی ارسال نکرده‌اید
              </p>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id} className="p-4">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString("fa-IR")}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            comment.approved
                              ? "bg-green-500/10 text-green-500"
                              : "bg-yellow-500/10 text-yellow-500"
                          }`}
                        >
                          {comment.approved ? "تایید شده" : "در انتظار تایید"}
                        </span>
                      </div>
                      <p className="text-base">{comment.message}</p>
                    </div>
                    
                    {comment.reply && (
                      <div className="pr-4 border-r-2 border-primary/50 bg-primary/5 p-3 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-primary">پاسخ ادمین:</span>
                          <span className="text-xs text-muted-foreground">
                            {comment.replied_at && new Date(comment.replied_at).toLocaleDateString("fa-IR")}
                          </span>
                        </div>
                        <p className="text-base">{comment.reply}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
