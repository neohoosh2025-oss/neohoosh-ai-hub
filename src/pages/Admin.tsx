import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { toast } = useToast();
  const [articleForm, setArticleForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    image: null as File | null,
  });

  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    price: "",
    pages: "",
    file: null as File | null,
  });

  const handleArticleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "موفق",
      description: "مقاله با موفقیت ذخیره شد (نیاز به اتصال دیتابیس)",
    });
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "موفق",
      description: "محصول با موفقیت ذخیره شد (نیاز به اتصال دیتابیس)",
    });
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-foreground">پنل مدیریت</h1>

        <Tabs defaultValue="articles" dir="rtl">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="articles">مقالات</TabsTrigger>
            <TabsTrigger value="products">محصولات</TabsTrigger>
          </TabsList>

          <TabsContent value="articles">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">افزودن مقاله جدید</h2>
              <form onSubmit={handleArticleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="article-title">عنوان مقاله</Label>
                  <Input
                    id="article-title"
                    value={articleForm.title}
                    onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                    placeholder="عنوان مقاله را وارد کنید"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="article-category">دسته‌بندی</Label>
                  <Input
                    id="article-category"
                    value={articleForm.category}
                    onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                    placeholder="مثال: آموزش، ابزارها، طراحی"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="article-excerpt">خلاصه مقاله</Label>
                  <Textarea
                    id="article-excerpt"
                    value={articleForm.excerpt}
                    onChange={(e) => setArticleForm({ ...articleForm, excerpt: e.target.value })}
                    placeholder="خلاصه‌ای از مقاله..."
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
                    placeholder="محتوای کامل مقاله..."
                    rows={10}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="article-image">تصویر شاخص</Label>
                  <Input
                    id="article-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setArticleForm({ ...articleForm, image: e.target.files?.[0] || null })}
                  />
                </div>

                <Button type="submit" className="w-full">
                  ذخیره مقاله
                </Button>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">افزودن محصول جدید</h2>
              <form onSubmit={handleProductSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="product-title">عنوان محصول</Label>
                  <Input
                    id="product-title"
                    value={productForm.title}
                    onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
                    placeholder="عنوان محصول را وارد کنید"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="product-description">توضیحات</Label>
                  <Textarea
                    id="product-description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="توضیحات محصول..."
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
                      placeholder="۴۹,۰۰۰"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="product-pages">تعداد صفحات</Label>
                    <Input
                      id="product-pages"
                      value={productForm.pages}
                      onChange={(e) => setProductForm({ ...productForm, pages: e.target.value })}
                      placeholder="۳۵ صفحه"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="product-file">فایل PDF</Label>
                  <Input
                    id="product-file"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setProductForm({ ...productForm, file: e.target.files?.[0] || null })}
                  />
                </div>

                <Button type="submit" className="w-full">
                  ذخیره محصول
                </Button>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 p-4 bg-card border border-border rounded-lg">
          <p className="text-sm text-muted-foreground">
            ⚠️ توجه: برای فعال‌سازی کامل این پنل، نیاز به اتصال Cloud است. 
            لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
