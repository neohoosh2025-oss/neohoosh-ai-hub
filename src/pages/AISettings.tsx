import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Sparkles, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AISettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState({
    personality: "friendly",
    tone: "casual",
    language_style: "modern",
    creativity: "balanced",
    response_length: "medium",
    custom_prompt: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase
        .from("user_memory")
        .select("*")
        .eq("user_id", user.id)
        .eq("memory_type", "ai_settings");

      if (data && data.length > 0) {
        const loadedSettings: any = {};
        data.forEach(item => {
          loadedSettings[item.key] = item.value;
        });
        setSettings(prev => ({ ...prev, ...loadedSettings }));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete existing settings
      await supabase
        .from("user_memory")
        .delete()
        .eq("user_id", user.id)
        .eq("memory_type", "ai_settings");

      // Insert new settings
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        user_id: user.id,
        memory_type: "ai_settings",
        key,
        value: String(value),
      }));

      const { error } = await supabase
        .from("user_memory")
        .insert(settingsArray);

      if (error) throw error;

      toast({
        title: "✅ ذخیره شد",
        description: "تنظیمات AI با موفقیت ذخیره شد",
      });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "خطا",
        description: "مشکلی در ذخیره تنظیمات پیش آمد",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      personality: "friendly",
      tone: "casual",
      language_style: "modern",
      creativity: "balanced",
      response_length: "medium",
      custom_prompt: "",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neohi-bg-main flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-3 border-neohi-accent border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neohi-bg-main via-neohi-bg-chat to-neohi-bg-main">
      {/* Header */}
      <div className="bg-neohi-bg-sidebar/95 backdrop-blur-lg border-b border-neohi-border sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-neohi-bg-hover"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neohi-text-primary">تنظیمات AI Assistant</h1>
              <p className="text-sm text-neohi-text-secondary">سفارشی‌سازی رفتار NEOHi Assistant</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Personality Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-neohi-bg-sidebar border-neohi-border space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-neohi-text-primary mb-2">شخصیت Assistant</h2>
              <p className="text-sm text-neohi-text-secondary">نحوه تعامل AI با شما را تعیین کنید</p>
            </div>
            <Separator className="bg-neohi-border" />
            
            <div className="space-y-4">
              <div>
                <Label className="text-neohi-text-primary mb-2 block">شخصیت اصلی</Label>
                <Select value={settings.personality} onValueChange={(value) => setSettings(prev => ({ ...prev, personality: value }))}>
                  <SelectTrigger className="bg-neohi-bg-hover border-neohi-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">دوستانه و صمیمی</SelectItem>
                    <SelectItem value="professional">حرفه‌ای و رسمی</SelectItem>
                    <SelectItem value="creative">خلاق و هنری</SelectItem>
                    <SelectItem value="analytical">تحلیلی و دقیق</SelectItem>
                    <SelectItem value="humorous">شوخ‌طبع و سرگرم‌کننده</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-neohi-text-primary mb-2 block">لحن صحبت</Label>
                <Select value={settings.tone} onValueChange={(value) => setSettings(prev => ({ ...prev, tone: value }))}>
                  <SelectTrigger className="bg-neohi-bg-hover border-neohi-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">معمولی</SelectItem>
                    <SelectItem value="formal">رسمی</SelectItem>
                    <SelectItem value="enthusiastic">پرانرژی</SelectItem>
                    <SelectItem value="calm">آرام</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-neohi-text-primary mb-2 block">سبک زبان</Label>
                <Select value={settings.language_style} onValueChange={(value) => setSettings(prev => ({ ...prev, language_style: value }))}>
                  <SelectTrigger className="bg-neohi-bg-hover border-neohi-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">مدرن و روزمره</SelectItem>
                    <SelectItem value="formal">ادبی و رسمی</SelectItem>
                    <SelectItem value="simple">ساده و روان</SelectItem>
                    <SelectItem value="technical">فنی و تخصصی</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Response Settings Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 bg-neohi-bg-sidebar border-neohi-border space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-neohi-text-primary mb-2">تنظیمات پاسخ</h2>
              <p className="text-sm text-neohi-text-secondary">نحوه پاسخ‌دهی AI را شخصی‌سازی کنید</p>
            </div>
            <Separator className="bg-neohi-border" />
            
            <div className="space-y-4">
              <div>
                <Label className="text-neohi-text-primary mb-2 block">میزان خلاقیت</Label>
                <Select value={settings.creativity} onValueChange={(value) => setSettings(prev => ({ ...prev, creativity: value }))}>
                  <SelectTrigger className="bg-neohi-bg-hover border-neohi-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">محافظه‌کارانه</SelectItem>
                    <SelectItem value="balanced">متعادل</SelectItem>
                    <SelectItem value="creative">خلاقانه</SelectItem>
                    <SelectItem value="very_creative">بسیار خلاق</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-neohi-text-primary mb-2 block">طول پاسخ</Label>
                <Select value={settings.response_length} onValueChange={(value) => setSettings(prev => ({ ...prev, response_length: value }))}>
                  <SelectTrigger className="bg-neohi-bg-hover border-neohi-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">کوتاه و مختصر</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="long">بلند و جامع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Custom Prompt Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 bg-neohi-bg-sidebar border-neohi-border space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-neohi-text-primary mb-2">دستورات سفارشی</h2>
              <p className="text-sm text-neohi-text-secondary">راهنمایی‌های اختصاصی برای AI بنویسید</p>
            </div>
            <Separator className="bg-neohi-border" />
            
            <div>
              <Label className="text-neohi-text-primary mb-2 block">پرامپت سفارشی (اختیاری)</Label>
              <Textarea
                value={settings.custom_prompt}
                onChange={(e) => setSettings(prev => ({ ...prev, custom_prompt: e.target.value }))}
                placeholder="مثال: همیشه در پاسخ‌هایت از ایموجی استفاده کن و موضوعات فنی را ساده توضیح بده..."
                className="min-h-[120px] bg-neohi-bg-hover border-neohi-border text-neohi-text-primary"
              />
              <p className="text-xs text-neohi-text-secondary mt-2">
                این دستورات به AI کمک می‌کند بهتر به سبک مورد نظر شما پاسخ دهد
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3"
        >
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="flex-1 bg-neohi-accent hover:bg-neohi-accent/90 text-white"
            size="lg"
          >
            {saving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
                در حال ذخیره...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 ml-2" />
                ذخیره تنظیمات
              </>
            )}
          </Button>
          
          <Button
            onClick={resetToDefaults}
            variant="outline"
            className="border-neohi-border hover:bg-neohi-bg-hover"
            size="lg"
          >
            <RefreshCw className="h-4 w-4 ml-2" />
            بازگردانی به پیش‌فرض
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
