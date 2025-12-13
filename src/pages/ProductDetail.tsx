import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, FileText, Calendar, Share2, Copy, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { MainLayout } from "@/components/layouts/MainLayout";
import { motion } from "framer-motion";
import { toast } from "sonner";

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
  const [copied, setCopied] = useState(false);

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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("لینک کپی شد");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("خطا در کپی لینک");
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      handleCopyLink();
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="pb-6">
          <div className="px-4 pt-4">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-48 w-full rounded-2xl mb-4" />
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="pb-6 min-h-[60vh] flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center px-4"
          >
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h1 className="text-xl font-bold mb-2">محصول یافت نشد</h1>
            <p className="text-muted-foreground text-sm mb-4">این محصول وجود ندارد یا حذف شده است</p>
            <Link to="/products">
              <Button variant="outline" size="sm" className="gap-2">
                بازگشت به محصولات
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="pb-6">
        {/* Back Button */}
        <div className="px-4 pt-4 mb-4">
          <Link to="/products">
            <Button variant="ghost" size="sm" className="gap-2 -mr-2 text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
              بازگشت
            </Button>
          </Link>
        </div>

        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 mb-5"
        >
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 aspect-video flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            <FileText className="w-20 h-20 text-primary/40" />
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-4 space-y-4"
        >
          {/* Title & Price */}
          <div>
            <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary">{product.price}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(product.created_at).toLocaleDateString("fa-IR")}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-3">
            <Card className="flex-1 p-4 text-center bg-muted/30 border-border/50">
              <div className="text-2xl font-bold text-primary mb-1">{product.pages}</div>
              <div className="text-xs text-muted-foreground">صفحه</div>
            </Card>
            <Card className="flex-1 p-4 text-center bg-muted/30 border-border/50">
              <div className="text-2xl font-bold text-green-500 mb-1">رایگان</div>
              <div className="text-xs text-muted-foreground">دانلود</div>
            </Card>
          </div>

          {/* Description */}
          <Card className="p-4 bg-card border-border/50">
            <h2 className="font-semibold mb-2">توضیحات</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
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

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
                اشتراک‌گذاری
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={handleCopyLink}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                کپی لینک
              </Button>
            </div>
          </div>

          {/* Note */}
          <Card className="p-4 bg-primary/5 border-primary/20">
            <h3 className="font-semibold mb-1 text-sm">💡 نکته</h3>
            <p className="text-xs text-muted-foreground">
              بعد از دانلود، فایل PDF را در مرورگر یا برنامه‌های مخصوص PDF باز کنید.
            </p>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default ProductDetail;