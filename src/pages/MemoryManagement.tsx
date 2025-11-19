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
      toast.error(t("memory.error"));
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
      toast.error(t("memory.emptyError"));
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

      toast.success(t("memory.updateSuccess"));
      setEditingId(null);
      setEditKey("");
      setEditValue("");
      loadMemories();
    } catch (error) {
      console.error("Error updating memory:", error);
      toast.error(t("memory.error"));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("memory.deleteConfirm"))) {
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

      toast.success(t("memory.deleteSuccess"));
      loadMemories();
    } catch (error) {
      console.error("Error deleting memory:", error);
      toast.error(t("memory.error"));
    }
  };

  const handleAddMemory = async () => {
    if (!newKey.trim() || !newValue.trim()) {
      toast.error(t("memory.emptyError"));
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

      toast.success(t("memory.addSuccess"));
      setIsAdding(false);
      setNewKey("");
      setNewValue("");
      loadMemories();
    } catch (error: any) {
      console.error("Error adding memory:", error);
      if (error.code === '23505') {
        toast.error(t("memory.duplicateError"));
      } else {
        toast.error(t("memory.error"));
      }
    }
  };

  const handleClearAll = async () => {
    if (!confirm(t("memory.clearAllConfirm"))) {
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

      toast.success(t("memory.clearSuccess"));
      loadMemories();
    } catch (error) {
      console.error("Error clearing memories:", error);
      toast.error(t("memory.error"));
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t("memory.title")}</h1>
              <p className="text-muted-foreground">{t("memory.description")}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAdding(true)}
              className="gap-2"
              disabled={isAdding}
            >
              <Plus className="h-4 w-4" />
              {t("memory.addMemory")}
            </Button>
            {memories.length > 0 && (
              <Button
                onClick={handleClearAll}
                variant="destructive"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t("memory.clearAll")}
              </Button>
            )}
          </div>
        </div>

        {/* Add New Memory Card */}
        {isAdding && (
          <Card className="mb-6 border-primary">
            <CardHeader>
              <CardTitle>{t("memory.addNewTitle")}</CardTitle>
              <CardDescription>{t("memory.addNewDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-key">{t("memory.keyLabel")}</Label>
                <Input
                  id="new-key"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder={t("memory.keyPlaceholder")}
                  maxLength={50}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-value">{t("memory.valueLabel")}</Label>
                <Input
                  id="new-value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={t("memory.valuePlaceholder")}
                  maxLength={255}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddMemory} className="gap-2">
                  <Save className="h-4 w-4" />
                  {t("memory.save")}
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
                  {t("memory.cancel")}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Memories List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">{t("memory.loading")}</p>
          </div>
        ) : memories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">{t("memory.noMemories")}</h3>
              <p className="text-muted-foreground mb-4">
                {t("memory.noMemoriesDesc")}
              </p>
              <Button onClick={() => setIsAdding(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                {t("memory.addFirst")}
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
                        <Label>{t("memory.keyLabel")}</Label>
                        <Input
                          value={editKey}
                          onChange={(e) => setEditKey(e.target.value)}
                          maxLength={50}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("memory.valueLabel")}</Label>
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
                          {t("memory.save")}
                        </Button>
                        <Button
                          onClick={handleCancelEdit}
                          size="sm"
                          variant="outline"
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          {t("memory.cancel")}
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
