import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Brain, Trash2, Edit2, Plus, Save, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Memory {
  id: string;
  key: string;
  value: string;
  memory_type: string;
  created_at: string;
  updated_at: string;
}

const MemoryManagement = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKey, setEditKey] = useState("");
  const [editValue, setEditValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    checkUser();
    loadMemories();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadMemories = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data, error } = await supabase
        .from('user_memory')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setMemories(data || []);
    } catch (error) {
      console.error("Error loading memories:", error);
      toast.error("خطا در بارگذاری حافظه");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (memory: Memory) => {
    setEditingId(memory.id);
    setEditKey(memory.key);
    setEditValue(memory.value);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditKey("");
    setEditValue("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editKey.trim() || !editValue.trim()) {
      toast.error("کلید و مقدار نمی‌توانند خالی باشند");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_memory')
        .update({
          key: editKey.trim(),
          value: editValue.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("حافظه با موفقیت به‌روزرسانی شد");
      setEditingId(null);
      setEditKey("");
      setEditValue("");
      loadMemories();
    } catch (error) {
      console.error("Error updating memory:", error);
      toast.error("خطا در به‌روزرسانی حافظه");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این حافظه را حذف کنید؟")) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_memory')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("حافظه با موفقیت حذف شد");
      loadMemories();
    } catch (error) {
      console.error("Error deleting memory:", error);
      toast.error("خطا در حذف حافظه");
    }
  };

  const handleAddMemory = async () => {
    if (!newKey.trim() || !newValue.trim()) {
      toast.error("کلید و مقدار نمی‌توانند خالی باشند");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_memory')
        .insert({
          user_id: user.id,
          memory_type: 'profile',
          key: newKey.trim(),
          value: newValue.trim()
        });

      if (error) throw error;

      toast.success("حافظه جدید اضافه شد");
      setIsAdding(false);
      setNewKey("");
      setNewValue("");
      loadMemories();
    } catch (error: any) {
      console.error("Error adding memory:", error);
      if (error.code === '23505') {
        toast.error("این کلید قبلاً استفاده شده است");
      } else {
        toast.error("خطا در افزودن حافظه");
      }
    }
  };

  const handleClearAll = async () => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید تمام حافظه‌ها را حذف کنید؟ این عمل قابل بازگشت نیست!")) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_memory')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("تمام حافظه‌ها پاک شدند");
      loadMemories();
    } catch (error) {
      console.error("Error clearing memories:", error);
      toast.error("خطا در پاک کردن حافظه‌ها");
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4" dir="rtl">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">مدیریت حافظه</h1>
              <p className="text-muted-foreground">اطلاعات ذخیره شده در چت‌بات</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAdding(true)}
              className="gap-2"
              disabled={isAdding}
            >
              <Plus className="h-4 w-4" />
              افزودن حافظه
            </Button>
            {memories.length > 0 && (
              <Button
                onClick={handleClearAll}
                variant="destructive"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                پاک کردن همه
              </Button>
            )}
          </div>
        </div>

        {/* Add New Memory Card */}
        {isAdding && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle>افزودن حافظه جدید</CardTitle>
              <CardDescription>اطلاعات جدیدی که می‌خواهید ذخیره شود</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-key">کلید (مثلاً: name, age, job)</Label>
                <Input
                  id="new-key"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="نام کلید..."
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-value">مقدار</Label>
                <Input
                  id="new-value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="مقدار..."
                  maxLength={255}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddMemory} className="gap-2">
                  <Save className="h-4 w-4" />
                  ذخیره
                </Button>
                <Button
                  onClick={() => {
                    setIsAdding(false);
                    setNewKey("");
                    setNewValue("");
                  }}
                  variant="outline"
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  انصراف
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Memories List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">در حال بارگذاری...</p>
          </div>
        ) : memories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">هیچ حافظه‌ای ذخیره نشده</h3>
              <p className="text-muted-foreground mb-4">
                وقتی در چت اطلاعات شخصی خود را به اشتراک بگذارید، آن‌ها اینجا ذخیره می‌شوند
              </p>
              <Button onClick={() => setIsAdding(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                افزودن اولین حافظه
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {memories.map((memory) => (
              <Card key={memory.id}>
                <CardContent className="pt-6">
                  {editingId === memory.id ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>کلید</Label>
                        <Input
                          value={editKey}
                          onChange={(e) => setEditKey(e.target.value)}
                          maxLength={50}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>مقدار</Label>
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          maxLength={255}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSaveEdit(memory.id)}
                          size="sm"
                          className="gap-2"
                        >
                          <Save className="h-4 w-4" />
                          ذخیره
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          variant="outline"
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          انصراف
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-mono px-2 py-1 bg-primary/10 text-primary rounded">
                            {memory.key}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(memory.updated_at).toLocaleDateString("fa-IR")}
                          </span>
                        </div>
                        <p className="text-lg">{memory.value}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEdit(memory)}
                          size="sm"
                          variant="ghost"
                          className="gap-2"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(memory.id)}
                          size="sm"
                          variant="ghost"
                          className="gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemoryManagement;
