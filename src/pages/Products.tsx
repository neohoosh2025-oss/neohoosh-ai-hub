import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronLeft, ShoppingBag, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { MainLayout } from "@/components/layouts/MainLayout";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  pages: string;
  file_url: string | null;
  created_at: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    
    setProducts(data || []);
    setLoading(false);
  };

  return (
    <MainLayout>
      <div className="pb-6">
        {/* Hero Section */}
        <div className="px-4 pt-4 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent p-5"
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-secondary-foreground" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="w-3 h-3 ml-1" />
                  {t("productsPage.header")}
                </Badge>
              </div>
              <h1 className="text-xl font-bold mb-1">{t("productsPage.header")}</h1>
              <p className="text-sm text-muted-foreground">
                {t("productsPage.headerDesc")}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Products List */}
        <div className="px-4 space-y-3">
          {loading ? (
            // Loading Skeletons
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4 border-border/50">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-14 h-14 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              </Card>
            ))
          ) : products.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground">{t("productsPage.noProducts")}</p>
            </motion.div>
          ) : (
            products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/products/${product.id}`}>
                  <Card className="p-4 border-border/50 hover:border-primary/30 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <motion.div 
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FileText className="w-7 h-7 text-white" />
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[15px] group-hover:text-primary transition-colors line-clamp-1 mb-0.5">
                          {product.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="font-bold text-primary">{product.price}</span>
                          <span className="text-muted-foreground">{product.pages} {t("productsPage.pages")}</span>
                        </div>
                      </div>

                      {/* Arrow */}
                      <ChevronLeft className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Products;
