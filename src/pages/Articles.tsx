import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface ArticleTranslation {
  language: string;
  title: string;
  excerpt: string;
  content: string;
}

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image_url: string | null;
  created_at: string;
  article_translations?: ArticleTranslation[];
}

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select(`
        *,
        article_translations (
          language,
          title,
          excerpt,
          content
        )
      `)
      .order("created_at", { ascending: false });
    
    setArticles(data || []);
    setLoading(false);
  };
  const getArticleText = (article: Article, field: 'title' | 'excerpt') => {
    const translation = article.article_translations?.find(t => t.language === language);
    return translation ? translation[field] : article[field];
  };

  return (
    <div className="min-h-screen pt-20">
      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              {t("articlesPage.title")}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t("articlesPage.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">{t("latestArticles.loading")}</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">{t("latestArticles.noArticles")}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
              <Link key={article.id} to={`/articles/${article.id}`}>
                <Card
                  className="overflow-hidden border-border hover:border-primary/50 transition-all group cursor-pointer h-full"
                >
                  {article.image_url && (
                    <div className="relative overflow-hidden">
                      <img
                        src={article.image_url}
                        alt={article.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium">
                          {article.category}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
                      {getArticleText(article, 'title')}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {getArticleText(article, 'excerpt')}
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(article.created_at).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-2 group-hover:text-primary">
                        {t("latestArticles.readMore")}
                        <ArrowLeft className="h-3 w-3" />
                      </Button>
                    </div>
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

export default Articles;
