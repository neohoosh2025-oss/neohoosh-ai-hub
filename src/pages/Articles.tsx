import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Clock, Calendar, Search, Grid3x3, List, TrendingUp, Sparkles, Filter, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/OptimizedImage";

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

type ViewMode = "grid" | "list";
type SortMode = "newest" | "popular";

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchQuery, selectedCategory, sortMode]);

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

  const filterArticles = () => {
    let filtered = [...articles];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(article => {
        const title = getArticleText(article, 'title').toLowerCase();
        const excerpt = getArticleText(article, 'excerpt').toLowerCase();
        return title.includes(searchQuery.toLowerCase()) || excerpt.includes(searchQuery.toLowerCase());
      });
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Sort
    if (sortMode === "newest") {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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

  const featuredArticle = filteredArticles[0];
  const regularArticles = filteredArticles.slice(1);

  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-[#1A1D21]">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.08),transparent_50%),radial-gradient(circle_at_70%_60%,hsl(var(--secondary)/0.06),transparent_50%)]" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>دانشنامه هوش مصنوعی نئوهوش</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-l from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent leading-[1.3] pb-2">
              آخرین مقالات و آموزش‌ها
            </h1>
            
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              با جدیدترین مقالات، راهنماها و بینش‌های هوش مصنوعی همراه شوید و دانش خود را ارتقا دهید
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="جستجو در مقالات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 h-14 text-base rounded-2xl border-2 bg-background/80 backdrop-blur-sm shadow-lg shadow-primary/5"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Categories */}
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground" />
              {getCategories().map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category === "all" ? "همه" : category}
                </button>
              ))}
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant={sortMode === "newest" ? "default" : "ghost"}
                size="sm"
                onClick={() => setSortMode("newest")}
                className="gap-2"
              >
                <Clock className="w-4 h-4" />
                جدیدترین
              </Button>
              
              <div className="h-6 w-px bg-border mx-2" />
              
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 pb-20">
        <div className="container mx-auto px-4">
          {loading ? (
            // Skeleton Loading
            <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
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
          ) : filteredArticles.length === 0 ? (
            // Empty State
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="mx-auto mb-6 p-6 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/30 w-fit">
                <Calendar className="h-16 w-16 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">مقاله‌ای یافت نشد</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery ? "جستجوی دیگری امتحان کنید" : "به زودی مقالات جدید منتشر می‌شوند"}
              </p>
              {searchQuery && (
                <Button onClick={() => setSearchQuery("")} variant="outline">
                  پاک کردن جستجو
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-12">
              {/* Featured Article */}
              {featuredArticle && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link to={`/articles/${featuredArticle.id}`}>
                    <Card className="overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 bg-gradient-to-br from-card to-card/50">
                      <div className="grid md:grid-cols-2 gap-0">
                        {featuredArticle.image_url && (
                          <div className="relative overflow-hidden h-full min-h-[400px]">
                            <OptimizedImage
                              src={featuredArticle.image_url}
                              alt={getArticleText(featuredArticle, 'title')}
                              width={800}
                              height={400}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            <div className="absolute top-6 right-6">
                              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-xl">
                                <TrendingUp className="w-4 h-4" />
                                مقاله ویژه
                              </span>
                            </div>
                          </div>
                        )}
                        <div className="p-8 md:p-12 flex flex-col justify-center">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-medium mb-4 w-fit">
                            <Tag className="w-3 h-3" />
                            {featuredArticle.category}
                          </div>
                          <h2 className="text-3xl md:text-4xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight">
                            {getArticleText(featuredArticle, 'title')}
                          </h2>
                          <p className="text-muted-foreground text-base leading-relaxed mb-6 line-clamp-3">
                            {getArticleText(featuredArticle, 'excerpt')}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              {new Date(featuredArticle.created_at).toLocaleDateString("fa-IR")}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              {calculateReadTime(getArticleText(featuredArticle, 'excerpt'))} دقیقه مطالعه
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              )}

              {/* Regular Articles Grid/List */}
              {regularArticles.length > 0 && (
                <div className={viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
                  {regularArticles.map((article, idx) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                    >
                      <Link to={`/articles/${article.id}`}>
                        <Card className={`overflow-hidden group cursor-pointer h-full hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 hover-scale ${
                          viewMode === "list" ? "flex flex-row" : ""
                        }`}>
                          {article.image_url && (
                            <div className={`relative overflow-hidden bg-muted ${
                              viewMode === "list" ? "w-72 h-full" : "h-52"
                            }`}>
                              <OptimizedImage
                                src={article.image_url}
                                alt={getArticleText(article, 'title')}
                                width={viewMode === "list" ? 288 : 400}
                                height={viewMode === "list" ? 300 : 208}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <div className="absolute top-4 right-4">
                                <span className="px-3 py-1.5 rounded-full bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-semibold shadow-lg">
                                  {article.category}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="p-6 space-y-4 flex-1">
                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                              {getArticleText(article, 'title')}
                            </h3>
                            
                            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                              {getArticleText(article, 'excerpt')}
                            </p>

                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {new Date(article.created_at).toLocaleDateString("fa-IR")}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="h-3.5 w-3.5" />
                                  {calculateReadTime(getArticleText(article, 'excerpt'))} دقیقه
                                </span>
                              </div>
                              <span className="flex items-center gap-1.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                مطالعه
                                <ArrowLeft className="h-3.5 w-3.5" />
                              </span>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Articles;
