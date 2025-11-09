import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, FileText, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  pages: string;
  file_url: string | null;
  created_at: string;
  author_id: string;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching product:", error);
      } else {
        setProduct(data);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="h-96" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">محصول یافت نشد</h1>
          <Link to="/products">
            <Button variant="outline" className="gap-2">
              بازگشت به محصولات
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        <Link to="/products">
          <Button variant="ghost" className="gap-2 mb-8">
            <ArrowRight className="h-4 w-4" />
            بازگشت به محصولات
          </Button>
        </Link>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Product Image/Preview */}
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <FileText className="h-32 w-32 text-primary/40" />
                </div>
              </Card>

              {/* Product Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      {product.pages}
                    </div>
                    <div className="text-sm text-muted-foreground">صفحه</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(product.created_at).toLocaleDateString("fa-IR")}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
                <div className="text-3xl font-bold text-primary mb-6">
                  {product.price}
                </div>
              </div>

              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">توضیحات محصول</h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {product.description}
                  </p>
                </CardContent>
              </Card>

              {product.file_url && (
                <Button
                  size="lg"
                  className="w-full gap-2"
                  asChild
                >
                  <a href={product.file_url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-5 w-5" />
                    دانلود محصول
                  </a>
                </Button>
              )}

              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">💡 نکته:</h3>
                  <p className="text-sm text-muted-foreground">
                    بعد از دانلود، فایل PDF را در مرورگر یا برنامه‌های مخصوص PDF باز کنید.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
