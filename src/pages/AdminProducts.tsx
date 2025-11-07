import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2 } from "lucide-react";

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  pages: string;
  file_url: string | null;
  created_at: string;
}

export const AdminProducts = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    price: "",
    pages: "",
    file_url: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "خطا",
        description: "خطا در بارگذاری محصولات",
        variant: "destructive",
      });
    } else {
      setProducts(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("products").insert({
      ...productForm,
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
        description: "محصول با موفقیت ذخیره شد",
      });
      setProductForm({
        title: "",
        description: "",
        price: "",
        pages: "",
        file_url: "",
      });
      fetchProducts();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast({
        title: "خطا",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "موفق",
        description: "محصول حذف شد",
      });
      fetchProducts();
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">افزودن محصول جدید</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="product-title">عنوان محصول</Label>
            <Input
              id="product-title"
              value={productForm.title}
              onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="product-description">توضیحات</Label>
            <Textarea
              id="product-description"
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="product-price">قیمت (تومان)</Label>
              <Input
                id="product-price"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="product-pages">تعداد صفحات</Label>
              <Input
                id="product-pages"
                value={productForm.pages}
                onChange={(e) => setProductForm({ ...productForm, pages: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="product-file">URL فایل PDF</Label>
            <Input
              id="product-file"
              value={productForm.file_url}
              onChange={(e) => setProductForm({ ...productForm, file_url: e.target.value })}
              placeholder="https://example.com/file.pdf"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "در حال ذخیره..." : "ذخیره محصول"}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">محصولات موجود ({products.length})</h2>
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-semibold">{product.title}</h3>
                <p className="text-sm text-muted-foreground">{product.price} تومان - {product.pages}</p>
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleDelete(product.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {products.length === 0 && (
            <p className="text-center text-muted-foreground py-8">هنوز محصولی ثبت نشده است</p>
          )}
        </div>
      </Card>
    </div>
  );
};
