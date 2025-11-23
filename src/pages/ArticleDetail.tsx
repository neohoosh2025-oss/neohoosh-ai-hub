import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
  author_id: string;
  article_translations?: ArticleTranslation[];
}

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
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
        .eq("id", id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching article:", error);
      } else {
        setArticle(data);
      }
      setLoading(false);
    };

    fetchArticle();
  }, [id]);

  const getArticleText = (field: 'title' | 'excerpt' | 'content') => {
    if (!article) return '';
    const translation = article.article_translations?.find(t => t.language === language);
    return translation ? translation[field] : article[field];
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <Skeleton className="h-96 w-full mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">{t("articleDetail.notFound")}</h1>
          <Link to="/articles">
            <Button variant="outline" className="gap-2">
              {t("articleDetail.backToArticles")}
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
        <Link to="/articles">
          <Button variant="ghost" className="gap-2 mb-8 hover-scale">
            <ArrowRight className="h-4 w-4" />
            {t("articleDetail.backToArticles")}
          </Button>
        </Link>

        <article className="max-w-4xl mx-auto">
          {/* Category Badge */}
          <div className="mb-6 animate-fade-in">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 text-primary text-sm font-semibold border border-primary/20">
              {article.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-display-lg md:text-display-xl font-bold mb-8 leading-tight bg-gradient-to-l from-foreground to-foreground/80 bg-clip-text animate-fade-in" style={{ animationDelay: "0.1s" }}>
            {getArticleText('title')}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-6 text-muted-foreground mb-10 pb-8 border-b border-border/50 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted/50">
                <Calendar className="h-4 w-4" />
              </div>
              <span className="text-sm">{new Date(article.created_at).toLocaleDateString("fa-IR")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-muted/50">
                <User className="h-4 w-4" />
              </div>
              <span className="text-sm">{t("articleDetail.author")}</span>
            </div>
          </div>

          {/* Featured Image */}
          {article.image_url && (
            <div className="mb-12 rounded-2xl overflow-hidden shadow-xl shadow-primary/5 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <img
                src={article.image_url}
                alt={getArticleText('title')}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          <div className="text-body-lg text-muted-foreground mb-12 p-8 bg-gradient-to-br from-card to-card/50 rounded-2xl border border-border/50 shadow-sm animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary mt-1">
                <User className="h-5 w-5" />
              </div>
              <p className="flex-1 leading-relaxed">{getArticleText('excerpt')}</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <div className="whitespace-pre-wrap text-foreground leading-relaxed space-y-6">
              {getArticleText('content')}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 pt-8 border-t border-border/50 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-center justify-between">
              <Link to="/articles">
                <Button variant="outline" className="gap-2">
                  <ArrowRight className="h-4 w-4" />
                  {t("articleDetail.backToArticles")}
                </Button>
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ArticleDetail;
