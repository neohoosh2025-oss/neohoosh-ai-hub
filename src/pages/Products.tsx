import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

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
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {t("products.header")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("products.headerDesc")}
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">{t("products.loading")}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">{t("products.noProducts")}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
              <Link key={product.id} to={`/products/${product.id}`}>
                <Card
                  className="p-6 border-border hover:border-primary/50 transition-all group cursor-pointer h-full flex flex-col"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all">
                    <FileText className="h-8 w-8 text-primary" />
                  </div>

                  <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {product.title}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-3 flex-1">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-6 pb-6 border-b border-border">
                    <span>{t("products.format")}</span>
                    <span>{product.pages} {t("products.pages")}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {product.price}
                    </span>
                    <Button variant="outline" size="sm" className="gap-2 group-hover:border-primary group-hover:text-primary">
                      {t("products.viewDetails")}
                      <ArrowLeft className="h-3 w-3" />
                    </Button>
                  </div>
                </Card>
              </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;
