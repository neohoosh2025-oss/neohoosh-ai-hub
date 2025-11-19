import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Languages } from "lucide-react";

const AdminTranslate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase.rpc("is_admin", { user_id: user.id });
      
      if (!data) {
        navigate("/");
        toast.error("شما دسترسی ادمین ندارید");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/");
    } finally {
      setChecking(false);
    }
  };

  const handleTranslate = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("translate-articles");

      if (error) throw error;

      toast.success(`ترجمه با موفقیت انجام شد! ${data.total_articles} مقاله بررسی شد`);
      console.log("Translation results:", data);
    } catch (error: any) {
      console.error("Error translating articles:", error);
      toast.error(`خطا در ترجمه: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <Languages className="h-8 w-8 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">ترجمه خودکار مقالات</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  ترجمه تمام مقالات به انگلیسی و عربی با هوش مصنوعی
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                نکات مهم:
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                <li>تمام مقالات موجود در دیتابیس ترجمه می‌شوند</li>
                <li>ترجمه‌های موجود رونویسی نمی‌شوند</li>
                <li>فقط زبان‌های انگلیسی و عربی اضافه می‌شوند</li>
                <li>این فرآیند ممکن است چند دقیقه طول بکشد</li>
              </ul>
            </div>

            <Button 
              onClick={handleTranslate} 
              disabled={loading}
              className="w-full gap-2"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  در حال ترجمه...
                </>
              ) : (
                <>
                  <Languages className="h-5 w-5" />
                  شروع ترجمه خودکار
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              این عملیات از هوش مصنوعی Lovable برای ترجمه استفاده می‌کند
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTranslate;