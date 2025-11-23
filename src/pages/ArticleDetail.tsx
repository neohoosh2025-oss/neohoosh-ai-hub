import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowRight, Calendar, User, Clock, Share2, Bookmark, Tag, ChevronRight, ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const [activeSection, setActiveSection] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);
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

  const tableOfContents = article ? extractTableOfContents(getArticleText('content')) : [];

  if (loading) {
    return (
      <div className="min-h-screen py-20 bg-[#F5F7FA] dark:bg-[#1A1D21]">
        <div className="container mx-auto px-4 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-16 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/4 mb-8" />
          <Skeleton className="h-96 w-full mb-8 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen py-20 bg-[#F5F7FA] dark:bg-[#1A1D21]">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <div className="mb-6 p-6 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/30 w-fit mx-auto">
              <Calendar className="h-16 w-16 text-muted-foreground" />
            </div>
            <h1 className="text-3xl font-bold mb-4">مقاله یافت نشد</h1>
            <p className="text-muted-foreground mb-6">متاسفانه این مقاله وجود ندارد یا حذف شده است</p>
            <Link to="/articles">
              <Button className="gap-2">
                بازگشت به مقالات
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#1A1D21]">
      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/articles">
              <Button variant="ghost" className="gap-2 mb-8 hover-scale">
                <ArrowRight className="h-4 w-4" />
                بازگشت به مقالات
              </Button>
            </Link>

            {/* Category & Meta */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
                <Tag className="w-4 h-4" />
                {article.category}
              </span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(article.created_at).toLocaleDateString("fa-IR")}
              </span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {calculateReadTime(getArticleText('content'))} دقیقه مطالعه
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight max-w-4xl">
              {getArticleText('title')}
            </h1>

            {/* Excerpt */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-3xl">
              {getArticleText('excerpt')}
            </p>

            {/* Author & Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4 pt-6 border-t border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                  نئو
                </div>
                <div>
                  <p className="font-semibold">تیم نئوحوش</p>
                  <p className="text-sm text-muted-foreground">نویسنده</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  اشتراک‌گذاری
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Bookmark className="w-4 h-4" />
                  ذخیره
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-[1fr_280px] gap-12">
              {/* Article Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="order-2 lg:order-1"
              >
                {/* Featured Image */}
                {article.image_url && (
                  <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl shadow-primary/10">
                    <img
                      src={article.image_url}
                      alt={getArticleText('title')}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                )}

                {/* Article Body */}
                <article 
                  ref={contentRef}
                  className="prose prose-lg max-w-none
                    prose-headings:font-bold prose-headings:text-foreground
                    prose-h1:text-4xl prose-h1:mb-6
                    prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                    prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                    prose-p:text-foreground/90 prose-p:leading-[1.8] prose-p:mb-6
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-foreground prose-strong:font-semibold
                    prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
                    prose-pre:bg-muted prose-pre:border prose-pre:border-border
                    prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
                    prose-ul:my-6 prose-ol:my-6
                    prose-li:my-2 prose-li:text-foreground/90
                    prose-img:rounded-2xl prose-img:shadow-lg
                    prose-hr:border-border prose-hr:my-12
                    dark:prose-invert"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {getArticleText('content')}
                  </ReactMarkdown>
                </article>

                {/* Tags */}
                <div className="mt-12 pt-8 border-t border-border/50">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-semibold text-muted-foreground">برچسب‌ها:</span>
                    <div className="flex gap-2 flex-wrap">
                      {['هوش مصنوعی', 'آموزش', article.category].map((tag) => (
                        <span key={tag} className="px-3 py-1.5 rounded-full bg-muted text-muted-foreground text-sm hover:bg-muted/80 transition-colors cursor-pointer">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Author Box */}
                <Card className="mt-12 p-8 bg-gradient-to-br from-card to-muted/20">
                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      نئو
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">درباره نویسنده</h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        تیم تحریریه نئوحوش متشکل از متخصصان هوش مصنوعی و فناوری است که با هدف انتقال دانش و آموزش در حوزه AI فعالیت می‌کنند.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">مشاهده پروفایل</Button>
                        <Button variant="ghost" size="sm">مقالات بیشتر</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Sidebar */}
              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="order-1 lg:order-2"
              >
                <div className="lg:sticky lg:top-24 space-y-6">
                  {/* Table of Contents */}
                  {tableOfContents.length > 0 && (
                    <Card className="p-6">
                      <h3 className="font-bold mb-4 flex items-center gap-2">
                        <ChevronRight className="w-5 h-5 text-primary" />
                        فهرست مطالب
                      </h3>
                      <nav className="space-y-3">
                        {tableOfContents.map((item) => (
                          <a
                            key={item.id}
                            href={`#${item.id}`}
                            className="block text-sm text-muted-foreground hover:text-primary transition-colors pr-4 border-r-2 border-transparent hover:border-primary py-1"
                          >
                            {item.title}
                          </a>
                        ))}
                      </nav>
                    </Card>
                  )}

                  {/* Share */}
                  <Card className="p-6">
                    <h3 className="font-bold mb-4">اشتراک‌گذاری</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                        <Share2 className="w-4 h-4" />
                        کپی لینک
                      </Button>
                      <Button variant="outline" className="w-full justify-start gap-2" size="sm">
                        <Bookmark className="w-4 h-4" />
                        ذخیره مقاله
                      </Button>
                    </div>
                  </Card>
                </div>
              </motion.aside>
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 max-w-7xl">
            <h2 className="text-3xl font-bold mb-8">مقالات مرتبط</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link key={related.id} to={`/articles/${related.id}`}>
                  <Card className="overflow-hidden group cursor-pointer h-full hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover-scale">
                    {related.image_url && (
                      <div className="relative overflow-hidden h-40 bg-muted">
                        <img
                          src={related.image_url}
                          alt={getRelatedArticleText(related, 'title')}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                    )}
                    <div className="p-5 space-y-3">
                      <h3 className="font-bold line-clamp-2 group-hover:text-primary transition-colors">
                        {getRelatedArticleText(related, 'title')}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {getRelatedArticleText(related, 'excerpt')}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
                        <Calendar className="h-3 w-3" />
                        {new Date(related.created_at).toLocaleDateString("fa-IR")}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">آماده یادگیری بیشتر هستید؟</h2>
          <p className="text-muted-foreground mb-8 text-lg">
            با عضویت در خبرنامه نئوحوش، آخرین مقالات و آموزش‌ها را مستقیماً در ایمیل خود دریافت کنید
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/chat">
              <Button size="lg" className="gap-2">
                شروع چت با AI
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/articles">
              <Button size="lg" variant="outline">
                مقالات بیشتر
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArticleDetail;
