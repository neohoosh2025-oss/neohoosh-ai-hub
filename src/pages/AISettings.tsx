import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Sparkles, Save, RefreshCw, User, Heart, Briefcase, X, Plus, Brain, Zap, Settings2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserMemory {
  id: string;
  key: string;
  value: string;
  memory_type: string;
}

export default function AISettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [memories, setMemories] = useState<UserMemory[]>([]);
  const [newMemoryKey, setNewMemoryKey] = useState("");
  const [newMemoryValue, setNewMemoryValue] = useState("");
  
  const [settings, setSettings] = useState({
    personality: "friendly",
    tone: "casual",
    language_style: "modern",
    creativity: "balanced",
    response_length: "medium",
    custom_prompt: "",
  });

  const toneOptions = [
    { value: "friendly", label: "دوستانه و صمیمی", emoji: "😊" },
    { value: "professional", label: "حرفه‌ای و رسمی", emoji: "💼" },
    { value: "humorous", label: "بانمک و شوخ", emoji: "😄" },
    { value: "sarcastic", label: "تیکه‌انداز", emoji: "😏" },
    { value: "tough", label: "خشن و جدی", emoji: "💪" },
    { value: "caring", label: "مهربان و دلسوز", emoji: "🤗" },
    { value: "enthusiastic", label: "پرانرژی و هیجانی", emoji: "🔥" },
    { value: "calm", label: "آرام و متین", emoji: "🧘" },
  ];

  useEffect(() => {
    loadSettings();
    loadMemories();
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

  const loadMemories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_memory")
        .select("*")
        .eq("user_id", user.id)
        .eq("memory_type", "user_info")
        .order("created_at", { ascending: false });

      if (data) {
        setMemories(data);
      }
    } catch (error) {
      console.error("Error loading memories:", error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("user_memory")
        .delete()
        .eq("user_id", user.id)
        .eq("memory_type", "ai_settings");

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

  const addMemory = async () => {
    if (!newMemoryKey.trim() || !newMemoryValue.trim()) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("user_memory")
        .insert({
          user_id: user.id,
          memory_type: "user_info",
          key: newMemoryKey.trim(),
          value: newMemoryValue.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setMemories(prev => [data, ...prev]);
      setNewMemoryKey("");
      setNewMemoryValue("");
      
      toast({
        title: "✅ اضافه شد",
        description: "اطلاعات جدید ذخیره شد",
      });
    } catch (error) {
      console.error("Error adding memory:", error);
      toast({
        title: "خطا",
        description: "مشکلی در اضافه کردن اطلاعات پیش آمد",
        variant: "destructive",
      });
    }
  };

  const deleteMemory = async (id: string) => {
    try {
      const { error } = await supabase
        .from("user_memory")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setMemories(prev => prev.filter(m => m.id !== id));
      
      toast({
        title: "حذف شد",
        description: "اطلاعات با موفقیت حذف شد",
      });
    } catch (error) {
      console.error("Error deleting memory:", error);
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

  const getMemoryIcon = (key: string) => {
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes("اسم") || lowerKey.includes("نام")) return <User className="w-3.5 h-3.5" />;
    if (lowerKey.includes("علاقه") || lowerKey.includes("دوست")) return <Heart className="w-3.5 h-3.5" />;
    if (lowerKey.includes("شغل") || lowerKey.includes("کار")) return <Briefcase className="w-3.5 h-3.5" />;
    return <Brain className="w-3.5 h-3.5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Settings2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">تنظیمات NeoHoosh</h1>
              <p className="text-xs text-muted-foreground">سفارشی‌سازی هوش مصنوعی</p>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-80px)]">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
          
          {/* User Memory Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-5 bg-card/50 backdrop-blur border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">حافظه AI</h2>
                  <p className="text-xs text-muted-foreground">اطلاعاتی که NeoHoosh درباره شما می‌داند</p>
                </div>
              </div>
              
              {/* Add new memory - removed manual input */}

              {/* Memory list */}
              <div className="space-y-2">
                <AnimatePresence>
                  {memories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">هنوز اطلاعاتی ذخیره نشده</p>
                      <p className="text-xs mt-1">با گفتگو با AI، اطلاعات مهم خودکار ذخیره می‌شود</p>
                    </div>
                  ) : (
                    memories.map((memory) => (
                      <motion.div
                        key={memory.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 group"
                      >
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          {getMemoryIcon(memory.key)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground">{memory.key}</p>
                          <p className="text-sm font-medium truncate">{memory.value}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMemory(memory.id)}
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </Card>
          </motion.div>

          {/* Tone Selection Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-5 bg-card/50 backdrop-blur border-border/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">لحن گفتگو</h2>
                  <p className="text-xs text-muted-foreground">چگونه NeoHoosh با شما صحبت کند</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {toneOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSettings(prev => ({ ...prev, tone: option.value }))}
                    className={`flex items-center gap-2 p-3 rounded-xl text-right transition-all ${
                      settings.tone === option.value
                        ? 'bg-primary/10 border-2 border-primary/50 text-primary'
                        : 'bg-muted/30 border-2 border-transparent hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-lg">{option.emoji}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Response Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-5 bg-card/50 backdrop-blur border-border/50 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">تنظیمات پاسخ</h2>
                  <p className="text-xs text-muted-foreground">نحوه پاسخ‌دهی AI</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm mb-2 block">میزان خلاقیت</Label>
                  <Select value={settings.creativity} onValueChange={(value) => setSettings(prev => ({ ...prev, creativity: value }))}>
                    <SelectTrigger className="bg-muted/30 border-border/50">
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
                  <Label className="text-sm mb-2 block">طول پاسخ</Label>
                  <Select value={settings.response_length} onValueChange={(value) => setSettings(prev => ({ ...prev, response_length: value }))}>
                    <SelectTrigger className="bg-muted/30 border-border/50">
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

          {/* Custom Prompt */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-5 bg-card/50 backdrop-blur border-border/50">
              <Label className="text-sm mb-2 block">دستورات سفارشی (اختیاری)</Label>
              <Textarea
                value={settings.custom_prompt}
                onChange={(e) => setSettings(prev => ({ ...prev, custom_prompt: e.target.value }))}
                placeholder="مثال: همیشه از ایموجی استفاده کن..."
                className="min-h-[80px] bg-muted/30 border-border/50 text-sm"
              />
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-2 pb-6"
          >
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="flex-1 h-11 rounded-xl"
              size="lg"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
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
              className="h-11 rounded-xl"
              size="lg"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
}