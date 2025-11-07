import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string | null;
  created_at: string;
}

export const AdminArticles = () => {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [articleForm, setArticleForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    image_url: "",
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "خطا",
        description: "خطا در بارگذاری مقالات",
        variant: "destructive",
      });
    } else {
      setArticles(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("articles").insert({
      ...articleForm,
      author_id: user.id,
    });

    if (error) {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "موفق",
        description: "مقاله با موفقیت ذخیره شد",
      });
      setArticleForm({
        title: "",
        excerpt: "",
        content: "",
        category: "",
        image_url: "",
      });
      fetchArticles();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("articles").delete().eq("id", id);

    if (error) {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "موفق",
        description: "مقاله حذف شد",
      });
      fetchArticles();
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">افزودن مقاله جدید</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="article-title">عنوان مقاله</Label>
            <Input
              id="article-title"
              value={articleForm.title}
              onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="article-category">دسته‌بندی</Label>
            <Input
              id="article-category"
              value={articleForm.category}
              onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="article-excerpt">خلاصه مقاله</Label>
            <Textarea
              id="article-excerpt"
              value={articleForm.excerpt}
              onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="article-content">محتوای مقاله</Label>
            <Textarea
              id="article-content"
              value={articleForm.content}
              onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
              rows={10}
              required
            />
          </div>

          <div>
            <Label htmlFor="article-image">URL تصویر شاخص</Label>
            <Input
              id="article-image"
              value={articleForm.image_url}
              onChange={(e) => setArticleForm({ ...articleForm, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "در حال ذخیره..." : "ذخیره مقاله"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">مقالات موجود ({articles.length})</h2>
        <div className="space-y-4">
          {articles.map((article) => (
            <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold">{article.title}</h3>
                <p className="text-sm text-muted-foreground">{article.category}</p>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDelete(article.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {articles.length === 0 && (
            <p className="text-center text-muted-foreground py-8">هنوز مقاله‌ای ثبت نشده است</p>
          )}
        </div>
      </Card>
    </div>
  );
};
