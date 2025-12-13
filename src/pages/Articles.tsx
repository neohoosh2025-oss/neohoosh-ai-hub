import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Clock, BookOpen } from "lucide-react";
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

  return (
    <MainLayout>
      <div className="px-4 py-6 space-y-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-2xl font-bold">مقالات</h1>
          <p className="text-sm text-muted-foreground">دانشنامه هوش مصنوعی</p>
        </motion.div>
        
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در مقالات..."
            className="pr-12 h-12 rounded-2xl bg-muted/50 border-0 text-base"
          />
        </motion.div>
        
        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4"
        >
          {getCategories().map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/70 text-muted-foreground hover:bg-muted"
              )}
            >
              {category === "all" ? "همه" : category}
            </button>
          ))}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-card border border-border/50">
                <Skeleton className="w-24 h-24 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
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
            {filteredArticles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
              >
                <Link to={`/articles/${article.id}`}>
                  <div className="flex gap-4 p-4 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-md transition-all group">
                    {article.image_url && (
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={article.image_url}
                          alt={getArticleText(article, 'title')}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-background/90 backdrop-blur-sm text-[10px] font-medium">
                          {article.category}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0 py-1">
                      <h3 className="font-semibold text-base mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                        {getArticleText(article, 'title')}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {getArticleText(article, 'excerpt')}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>
                          {new Date(article.created_at).toLocaleDateString("fa-IR")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
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
    </MainLayout>
  );
};

export default Articles;
