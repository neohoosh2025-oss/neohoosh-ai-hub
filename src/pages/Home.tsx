import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, BookOpen, MessageCircle, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import heroImage from "@/assets/hero-bg.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image_url: string | null;
  created_at: string;
}

const Home = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const featuresAnimation = useScrollAnimation({ threshold: 0.2 });
  const articlesAnimation = useScrollAnimation({ threshold: 0.1 });
  const { t } = useLanguage();

  useEffect(() => {
    const fetchLatestArticles = async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("id, title, excerpt, category, image_url, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error("Error fetching articles:", error);
      } else {
        setArticles(data || []);
      }
      setLoading(false);
    };

    fetchLatestArticles();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-float">
            <div className="inline-block mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium glow-neon">
                <Sparkles className="h-4 w-4" />
                {t("hero.badge")}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-fade-in">
              <span className="bg-gradient-to-r from-neohoosh-blue to-primary bg-clip-text text-transparent animate-glow">
                {t("hero.title")}
              </span>
              <br />
              <span className="text-foreground">{t("hero.subtitle")}</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              {t("hero.description")}
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link to="/articles">
                <Button size="lg" className="gap-2 glow-neon hover:glow-neon-strong transition-all">
                  <BookOpen className="h-5 w-5" />
                  {t("hero.cta")}
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link to="/chat">
                <Button size="lg" variant="secondary" className="gap-2">
                  <MessageCircle className="h-5 w-5" />
                  {t("hero.smartAssistant")}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("features.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8" ref={featuresAnimation.ref}>
            <div className={`p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all group scroll-fade-in ${featuresAnimation.isVisible ? 'visible' : ''}`}>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-neon transition-all">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t("features.learning")}</h3>
              <p className="text-muted-foreground">
                {t("features.learningDesc")}
              </p>
            </div>

            <div className={`p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all group scroll-fade-in scroll-fade-in-delay-1 ${featuresAnimation.isVisible ? 'visible' : ''}`}>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-neon transition-all">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t("features.updated")}</h3>
              <p className="text-muted-foreground">
                {t("features.updatedDesc")}
              </p>
            </div>

            <div className={`p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all group scroll-fade-in scroll-fade-in-delay-2 ${featuresAnimation.isVisible ? 'visible' : ''}`}>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-neon transition-all">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t("features.community")}</h3>
              <p className="text-muted-foreground">
                {t("features.communityDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("latestArticles.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("latestArticles.subtitle")}
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("latestArticles.noArticles")}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8" ref={articlesAnimation.ref}>
              {articles.map((article, index) => (
                <Link key={article.id} to={`/articles/${article.id}`}>
                  <Card className={`h-full overflow-hidden hover:border-primary/50 transition-all group scroll-fade-in ${index === 1 ? 'scroll-fade-in-delay-1' : index === 2 ? 'scroll-fade-in-delay-2' : ''} ${articlesAnimation.isVisible ? 'visible' : ''}`}>
                    {article.image_url && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">
                          {article.category}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(article.created_at).toLocaleDateString("fa-IR")}
                        </div>
                      </div>
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                        {article.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {article.excerpt}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link to="/articles">
              <Button variant="outline" size="lg" className="gap-2">
                {t("cta.button")}
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-12 border border-primary/20 glow-neon">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("cta.title")}
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              {t("cta.description")}
            </p>
            <Link to="/articles">
              <Button size="lg" className="gap-2 glow-neon-strong">
                <BookOpen className="h-5 w-5" />
                {t("cta.button")}
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Sticky CTA Button */}
        <div className="fixed bottom-8 left-8 z-40 hidden lg:block">
          <Link to="/chat">
            <Button size="lg" className="gap-2 glow-neon-strong shadow-2xl">
              <MessageCircle className="h-5 w-5" />
              دستیار هوشمند
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
