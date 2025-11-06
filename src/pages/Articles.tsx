import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import aiBasicsImage from "@/assets/article-ai-basics.jpg";
import chatgptImage from "@/assets/article-chatgpt.jpg";
import imageGenImage from "@/assets/article-image-gen.jpg";

const articles = [
  {
    id: 1,
    title: "مقدمه‌ای بر هوش مصنوعی",
    excerpt: "در این مقاله با مفاهیم پایه هوش مصنوعی آشنا می‌شوید و یاد می‌گیرید که AI چگونه کار می‌کند.",
    image: aiBasicsImage,
    date: "۱۴۰۳/۰۸/۱۵",
    readTime: "۵ دقیقه",
    category: "آموزش پایه",
  },
  {
    id: 2,
    title: "راهنمای کامل استفاده از ChatGPT",
    excerpt: "نحوه استفاده حرفه‌ای از ChatGPT برای کارهای روزمره، تولید محتوا و افزایش بهره‌وری.",
    image: chatgptImage,
    date: "۱۴۰۳/۰۸/۱۰",
    readTime: "۸ دقیقه",
    category: "ابزارها",
  },
  {
    id: 3,
    title: "تولید تصویر با هوش مصنوعی",
    excerpt: "آموزش کامل ساخت تصاویر حرفه‌ای با ابزارهای هوش مصنوعی مانند Midjourney و DALL-E.",
    image: imageGenImage,
    date: "۱۴۰۳/۰۸/۰۵",
    readTime: "۱۰ دقیقه",
    category: "طراحی",
  },
];

const Articles = () => {
  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              مقالات <span className="text-primary glow-neon">آموزشی</span>
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
        </div>
      </section>
    </div>
  );
};

export default Articles;
