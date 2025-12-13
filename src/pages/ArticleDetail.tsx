import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Calendar, Clock, Share2, Tag, ChevronRight, ArrowLeft, Copy, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { OptimizedImage } from "@/components/OptimizedImage";
import { MainLayout } from "@/components/layouts/MainLayout";
import { toast } from "sonner";

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
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();

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
        if (data) {
          fetchRelatedArticles(data.category);
        }
      }
      setLoading(false);
    };

    fetchArticle();
  }, [id]);

  const fetchRelatedArticles = async (category: string) => {
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
      .eq("category", category)
      .neq("id", id)
      .limit(3);
    
    setRelatedArticles(data || []);
  };

  const getArticleText = (field: 'title' | 'excerpt' | 'content') => {
    if (!article) return '';
    const translation = article.article_translations?.find(t => t.language === language);
    return translation ? translation[field] : article[field];
  };

  const getRelatedArticleText = (article: Article, field: 'title' | 'excerpt') => {
    const translation = article.article_translations?.find(t => t.language === language);
    return translation ? translation[field] : article[field];
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const extractTableOfContents = (content: string) => {
    const headings = content.match(/^##\s.+$/gm) || [];
    return headings.map((heading, idx) => ({
      id: `section-${idx}`,
      title: heading.replace(/^##\s/, '')
    }));
  };

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
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: getArticleText('title'),
          text: getArticleText('excerpt'),
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      handleCopyLink();
    }
  };

  const tableOfContents = article ? extractTableOfContents(getArticleText('content')) : [];

  if (loading) {
    return (
      <MainLayout>
        <div className="pb-6">
          <div className="px-4 pt-4">
            <Skeleton className="h-8 w-32 mb-4" />
            <Skeleton className="h-48 w-full rounded-2xl mb-4" />
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-6 w-1/2 mb-4" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!article) {
    return (
      <MainLayout>
        <div className="pb-6 min-h-[60vh] flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center px-4"
          >
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <h1 className="text-xl font-bold mb-2">مقاله یافت نشد</h1>
            <p className="text-muted-foreground text-sm mb-4">این مقاله وجود ندارد یا حذف شده است</p>
            <Link to="/articles">
              <Button variant="outline" size="sm" className="gap-2">
                بازگشت به مقالات
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
          <Link to="/articles">
            <Button variant="ghost" size="sm" className="gap-2 -mr-2 text-muted-foreground">
              <ArrowRight className="h-4 w-4" />
              بازگشت
            </Button>
          </Link>
        </div>

        {/* Hero Image */}
        {article.image_url && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 mb-5"
          >
            <div className="relative rounded-2xl overflow-hidden">
              <OptimizedImage
                src={article.image_url}
                alt={getArticleText('title')}
                width={800}
                height={400}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
            </div>
          </motion.div>
        )}

        {/* Article Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="px-4 mb-5"
        >
          {/* Category & Meta */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Tag className="w-3 h-3" />
              {article.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(article.created_at).toLocaleDateString("fa-IR")}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {calculateReadTime(getArticleText('content'))} دقیقه
            </span>
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold mb-2 leading-tight">
            {getArticleText('title')}
          </h1>

          {/* Excerpt */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            {getArticleText('excerpt')}
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              اشتراک‌گذاری
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-2"
              onClick={handleCopyLink}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              کپی لینک
            </Button>
          </div>
        </motion.div>

        {/* Table of Contents */}
        {tableOfContents.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="px-4 mb-5"
          >
            <Card className="p-4 bg-muted/30 border-border/50">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                <ChevronRight className="w-4 h-4 text-primary" />
                فهرست مطالب
              </h3>
              <nav className="space-y-2">
                {tableOfContents.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-xs text-muted-foreground hover:text-primary transition-colors pr-3 border-r-2 border-transparent hover:border-primary py-0.5"
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
            </Card>
          </motion.div>
        )}

        {/* Article Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="px-4 mb-6"
        >
          <article 
            ref={contentRef}
            className="prose prose-sm max-w-none break-words
              prose-headings:font-bold prose-headings:text-foreground
              prose-h1:text-xl prose-h1:mb-4
              prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3
              prose-h3:text-base prose-h3:mt-4 prose-h3:mb-2
              prose-p:text-foreground/90 prose-p:leading-[1.8] prose-p:mb-4 prose-p:text-sm
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground prose-strong:font-semibold
              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
              prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-pre:overflow-x-auto
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
              prose-ul:my-4 prose-ol:my-4
              prose-li:my-1 prose-li:text-foreground/90 prose-li:text-sm
              prose-img:rounded-xl prose-img:max-w-full prose-img:h-auto
              prose-hr:border-border prose-hr:my-6
              dark:prose-invert"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {getArticleText('content')}
            </ReactMarkdown>
          </article>
        </motion.div>

        {/* Tags */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="px-4 mb-6"
        >
          <div className="flex items-center gap-2 flex-wrap pt-4 border-t border-border/50">
            <span className="text-xs font-medium text-muted-foreground">برچسب‌ها:</span>
            {['هوش مصنوعی', 'آموزش', article.category].map((tag) => (
              <span key={tag} className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Author Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-4 mb-6"
        >
          <Card className="p-4 bg-gradient-to-br from-card to-muted/20 border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold flex-shrink-0">
                نئو
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-0.5">تیم نئوهوش</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  متخصصان هوش مصنوعی و فناوری
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="px-4"
          >
            <h2 className="text-lg font-bold mb-4">مقالات مرتبط</h2>
            <div className="space-y-3">
              {relatedArticles.map((related) => (
                <Link key={related.id} to={`/articles/${related.id}`}>
                  <Card className="p-3 border-border/50 hover:border-primary/30 transition-all group">
                    <div className="flex gap-3">
                      {related.image_url && (
                        <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <OptimizedImage
                            src={related.image_url}
                            alt={getRelatedArticleText(related, 'title')}
                            width={80}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors mb-1">
                          {getRelatedArticleText(related, 'title')}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(related.created_at).toLocaleDateString("fa-IR")}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="px-4 mt-6"
        >
          <Card className="p-5 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 text-center">
            <h2 className="font-bold mb-2">آماده یادگیری بیشتر؟</h2>
            <p className="text-xs text-muted-foreground mb-4">
              با هوش مصنوعی نئوهوش گفتگو کنید
            </p>
            <div className="flex gap-2 justify-center">
              <Link to="/chat">
                <Button size="sm" className="gap-2">
                  شروع چت
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/articles">
                <Button size="sm" variant="outline">
                  مقالات بیشتر
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default ArticleDetail;