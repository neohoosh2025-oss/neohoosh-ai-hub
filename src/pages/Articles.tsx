import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Clock, BookOpen, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { language } = useLanguage();

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchQuery, selectedCategory]);

  const fetchArticles = async () => {
    const { data } = await supabase
      .from("articles")
      .select(`*, article_translations (language, title, excerpt, content)`)
      .order("created_at", { ascending: false });
    
    setArticles(data || []);
    setLoading(false);
  };

  const filterArticles = () => {
    let filtered = [...articles];

    if (searchQuery) {
      filtered = filtered.filter(article => {
        const title = getArticleText(article, 'title').toLowerCase();
        const excerpt = getArticleText(article, 'excerpt').toLowerCase();
        return title.includes(searchQuery.toLowerCase()) || excerpt.includes(searchQuery.toLowerCase());
      });
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    setFilteredArticles(filtered);
  };

  const getArticleText = (article: Article, field: 'title' | 'excerpt') => {
    const translation = article.article_translations?.find(t => t.language === language);
    return translation ? translation[field] : article[field];
  };

  const getCategories = () => {
    const categories = articles.map(a => a.category);
    return ["all", ...Array.from(new Set(categories))];
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  // Get featured article (first one)
  const featuredArticle = filteredArticles[0];
  const restArticles = filteredArticles.slice(1);

  return (
    <MainLayout>
      <div className="pb-24">
        {/* Header */}
        <div className="px-4 pt-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-1 mb-5"
          >
            <h1 className="text-2xl font-bold">مقالات</h1>
            <p className="text-sm text-muted-foreground">دانشنامه هوش مصنوعی</p>
          </motion.div>
          
          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative mb-4"
          >
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در مقالات..."
              className="pr-12 h-12 rounded-2xl bg-muted/50 border-0"
            />
          </motion.div>
          
          {/* Category Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2"
          >
            {getCategories().map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted/70 text-muted-foreground"
                )}
              >
                {category === "all" ? "همه" : category}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Content */}
        <div className="px-4">
          {loading ? (
            <div className="space-y-4">
              {/* Featured Skeleton */}
              <div className="rounded-3xl overflow-hidden bg-card border border-border/50">
                <Skeleton className="w-full aspect-[16/10]" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
              
              {/* List Skeletons */}
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-card border border-border/50">
                  <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredArticles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted/50 flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-muted-foreground/50" />
              </div>
              <p className="font-semibold mb-1">مقاله‌ای یافت نشد</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "جستجوی دیگری امتحان کنید" : "به زودی مقالات جدید منتشر می‌شوند"}
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {/* Featured Article Card */}
              {featuredArticle && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Link to={`/articles/${featuredArticle.id}`}>
                    <div className="group rounded-3xl overflow-hidden bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all">
                      {featuredArticle.image_url && (
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img
                            src={featuredArticle.image_url}
                            alt={getArticleText(featuredArticle, 'title')}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute top-4 right-4 flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-primary/90 text-primary-foreground text-xs font-medium backdrop-blur-sm">
                              {featuredArticle.category}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-sm flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              پیشنهادی
                            </span>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white text-lg font-bold line-clamp-2 mb-1">
                              {getArticleText(featuredArticle, 'title')}
                            </h3>
                            <div className="flex items-center gap-3 text-white/80 text-xs">
                              <span>{new Date(featuredArticle.created_at).toLocaleDateString("fa-IR")}</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {calculateReadTime(getArticleText(featuredArticle, 'excerpt'))} دقیقه
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      {!featuredArticle.image_url && (
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                              {featuredArticle.category}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                            {getArticleText(featuredArticle, 'title')}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {getArticleText(featuredArticle, 'excerpt')}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{new Date(featuredArticle.created_at).toLocaleDateString("fa-IR")}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {calculateReadTime(getArticleText(featuredArticle, 'excerpt'))} دقیقه
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Rest of Articles - Compact List */}
              {restArticles.length > 0 && (
                <div className="space-y-3">
                  {restArticles.map((article, idx) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 + idx * 0.05 }}
                    >
                      <Link to={`/articles/${article.id}`}>
                        <div className="flex gap-4 p-3 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-sm transition-all group">
                          {article.image_url ? (
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                              <img
                                src={article.image_url}
                                alt={getArticleText(article, 'title')}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-8 h-8 text-primary/50" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <span className="text-[10px] text-primary font-medium mb-1">
                              {article.category}
                            </span>
                            <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors mb-1">
                              {getArticleText(article, 'title')}
                            </h3>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                              <span>{new Date(article.created_at).toLocaleDateString("fa-IR")}</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                {calculateReadTime(getArticleText(article, 'excerpt'))} دقیقه
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Articles;