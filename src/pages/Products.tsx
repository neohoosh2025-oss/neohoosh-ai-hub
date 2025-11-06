import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";

const products: any[] = [];

const Products = () => {
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              فروشگاه محتوا
            </h1>
            <p className="text-lg text-muted-foreground">
              کتاب‌ها و راهنماهای تخصصی هوش مصنوعی برای یادگیری سریع‌تر
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">محصولی هنوز منتشر نشده است</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
              <Card
                key={product.id}
                className="p-6 border-border hover:border-primary/50 transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 transition-all">
                  <FileText className="h-8 w-8 text-primary" />
                </div>

                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {product.title}
                </h3>

                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {product.description}
                </p>

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-6 pb-6 border-b border-border">
                  <span>فرمت: PDF</span>
                  <span>{product.pages}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    {product.price}
                  </span>
                  <Button className="gap-2">
                    <Download className="h-4 w-4" />
                    خرید و دانلود
                  </Button>
                </div>
              </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Products;
