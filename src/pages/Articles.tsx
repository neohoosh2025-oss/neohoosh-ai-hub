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
      {/* Hero Header */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,hsl(var(--primary)/0.1),transparent)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-display-xl font-bold mb-6 bg-gradient-to-l from-primary via-secondary to-accent bg-clip-text text-transparent animate-fade-in">
              {t("articlesPage.title")}
            </h1>
            <p className="text-body-lg text-muted-foreground animate-fade-in" style={{ animationDelay: "0.1s" }}>
              {t("articlesPage.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-12 pb-20">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-muted" />
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-5/6" />
                  </div>
                </Card>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto mb-4 p-4 rounded-2xl bg-muted/50 w-fit">
                <Calendar className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-body-lg text-muted-foreground">{t("latestArticles.noArticles")}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article, idx) => (
                <Link 
                  key={article.id} 
                  to={`/articles/${article.id}`}
                  className="animate-fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <Card className="overflow-hidden group cursor-pointer h-full hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover-scale">
                    {article.image_url && (
                      <div className="relative overflow-hidden bg-muted">
                        <img
                          src={article.image_url}
                          alt={getArticleText(article, 'title')}
                          className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg backdrop-blur-sm">
                            {article.category}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-6 space-y-4">
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {getArticleText(article, 'title')}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                        {getArticleText(article, 'excerpt')}
                      </p>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(article.created_at).toLocaleDateString("fa-IR")}
                        </span>
                        <span className="flex items-center gap-1.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                          {t("latestArticles.readMore")}
                          <ArrowLeft className="h-3.5 w-3.5" />
                        </span>
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
