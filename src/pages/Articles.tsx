import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Calendar, Search, Grid3x3, List, Sparkles, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { OptimizedImage } from "@/components/OptimizedImage";
import { cn } from "@/lib/utils";

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

const Articles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 safe-area-top">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">مقالات</h1>
              <p className="text-xs text-muted-foreground">دانشنامه هوش مصنوعی</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در مقالات..."
              className="pr-10 h-11 rounded-xl bg-muted/50 border-0"
            />
          </div>
        </div>
        
        {/* Category Pills */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {getCategories().map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {category === "all" ? "همه" : category}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        {loading ? (
          <div className={viewMode === "grid" ? "grid grid-cols-2 gap-3" : "space-y-4"}>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-32 bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="font-medium mb-1">مقاله‌ای یافت نشد</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery ? "جستجوی دیگری امتحان کنید" : "به زودی مقالات جدید منتشر می‌شوند"}
            </p>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-2 gap-3" : "space-y-4"}>
            {filteredArticles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link to={`/articles/${article.id}`}>
                  <Card className={cn(
                    "overflow-hidden group hover:shadow-lg transition-all",
                    viewMode === "list" && "flex flex-row"
                  )}>
                    {article.image_url && (
                      <div className={cn(
                        "relative overflow-hidden bg-muted",
                        viewMode === "list" ? "w-28 h-full" : "h-28"
                      )}>
                        <OptimizedImage
                          src={article.image_url}
                          alt={getArticleText(article, 'title')}
                          width={viewMode === "list" ? 112 : 200}
                          height={viewMode === "list" ? 120 : 112}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <Badge className="absolute top-2 right-2 text-[10px] px-2 py-0 h-5 bg-background/80 backdrop-blur-sm">
                          {article.category}
                        </Badge>
                      </div>
                    )}
                    
                    <div className="p-3 flex-1">
                      <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                        {getArticleText(article, 'title')}
                      </h3>
                      
                      {viewMode === "list" && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {getArticleText(article, 'excerpt')}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(article.created_at).toLocaleDateString("fa-IR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {calculateReadTime(getArticleText(article, 'excerpt'))} دقیقه
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
    </div>
  );
};

export default Articles;
