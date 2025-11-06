import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import aiBasicsImage from "@/assets/article-ai-basics.jpg";
import chatgptImage from "@/assets/article-chatgpt.jpg";
import imageGenImage from "@/assets/article-image-gen.jpg";

const articles: any[] = [];

const Articles = () => {
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              مقالات آموزشی
            </h1>
            <p className="text-lg text-muted-foreground">
              دانش هوش مصنوعی را با مقالات جامع و کاربردی نئوهوش فرا بگیرید
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {articles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">مقاله‌ای هنوز منتشر نشده است</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
              <Card
                key={article.id}
                className="overflow-hidden border-border hover:border-primary/50 transition-all group cursor-pointer"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium">
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                    {article.title}
                  </h3>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {article.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </span>
                    </div>
                  </div>

                  <Link to={`/articles/${article.id}`}>
                    <Button variant="ghost" className="w-full gap-2 group-hover:text-primary">
                      ادامه مطلب
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </Link>
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

export default Articles;
