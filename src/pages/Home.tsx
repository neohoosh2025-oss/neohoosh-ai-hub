import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Sparkles, BookOpen, MessageCircle, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { ParallaxSection } from "@/components/ParallaxSection";
import { staggerContainer, fadeInUp, scaleIn } from "@/components/PageTransition";
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

interface Comment {
  id: string;
  name: string;
  message: string;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
}

const Home = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const featuresAnimation = useScrollAnimation({ threshold: 0.2 });
  const articlesAnimation = useScrollAnimation({ threshold: 0.1 });
  const commentsAnimation = useScrollAnimation({ threshold: 0.1 });
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

      // Fetch approved comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("comments")
        .select("*")
        .eq("approved", true)
        .not("reply", "is", null)
        .order("replied_at", { ascending: false })
        .limit(3);

      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
      } else {
        setComments(commentsData || []);
      }

      setLoading(false);
    };

    fetchLatestArticles();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Parallax Background */}
        <ParallaxSection offset={100} className="absolute inset-0 z-0">
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: `url(${heroImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
          </div>
        </ParallaxSection>

        {/* Content with Stagger Animation */}
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="max-w-4xl mx-auto space-y-8"
          >
            <motion.div variants={fadeInUp} className="inline-block mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium glow-soft shimmer">
                <Sparkles className="h-4 w-4" />
                {t("hero.badge")}
              </span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-neohoosh-blue to-primary bg-clip-text text-transparent">
                {t("hero.title")}
              </span>
              <br />
              <span className="text-foreground">{t("hero.subtitle")}</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              {t("hero.description")}
            </motion.p>

            <motion.div variants={scaleIn} className="flex flex-wrap gap-4 justify-center pt-4">
              <Link to="/articles">
                <Button size="lg" className="gap-2 magnetic-hover">
                  <BookOpen className="h-5 w-5" />
                  {t("hero.cta")}
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link to="/chat">
                <Button size="lg" variant="glass" className="gap-2 magnetic-hover">
                  <MessageCircle className="h-5 w-5" />
                  {t("hero.smartAssistant")}
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Animated Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-8 left-0 right-0 flex justify-center"
        >
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex items-start justify-center p-2">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-primary rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section with Scroll Reveal */}
      <ParallaxSection offset={30}>
        <section className="py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("features.title")}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {t("features.subtitle")}
              </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              className="grid md:grid-cols-3 gap-8"
            >
              <motion.div variants={fadeInUp} className="p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all group magnetic-hover">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-soft transition-all">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t("features.learning")}</h3>
                <p className="text-muted-foreground">
                  {t("features.learningDesc")}
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all group magnetic-hover">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-soft transition-all">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t("features.updated")}</h3>
                <p className="text-muted-foreground">
                  {t("features.updatedDesc")}
                </p>
              </motion.div>

              <motion.div variants={fadeInUp} className="p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all group magnetic-hover">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:glow-soft transition-all">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{t("features.community")}</h3>
                <p className="text-muted-foreground">
                  {t("features.communityDesc")}
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </ParallaxSection>

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
          ) : (
            <div className="grid md:grid-cols-3 gap-8" ref={articlesAnimation.ref}>
              {articles.map((article, index) => (
                <Link key={article.id} to={`/articles/${article.id}`}>
                  <Card className={`h-full overflow-hidden hover:border-primary/50 transition-all group scroll-fade-in visible ${index === 1 ? 'scroll-fade-in-delay-1' : index === 2 ? 'scroll-fade-in-delay-2' : ''} ${articlesAnimation.isVisible ? 'visible' : ''}`}>
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

      {/* Comments Section */}
      {comments.length > 0 && (
        <section className="py-20 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                نظرات کاربران
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                تجربیات و بازخوردهای کاربران نئوهوش
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8" ref={commentsAnimation.ref}>
              {comments.map((comment, index) => (
                <Card
                  key={comment.id}
                  className={`p-6 scroll-fade-in ${
                    index === 1 ? "scroll-fade-in-delay-1" : index === 2 ? "scroll-fade-in-delay-2" : ""
                  } ${commentsAnimation.isVisible ? "visible" : ""}`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold">{comment.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString("fa-IR")}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-base leading-relaxed">
                      {comment.message}
                    </p>
                    {comment.reply && (
                      <div className="pr-3 border-r-2 border-primary/50 bg-primary/5 p-3 rounded-lg">
                        <p className="text-sm font-medium text-primary mb-1">پاسخ:</p>
                        <p className="text-base">{comment.reply}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

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

        {/* Floating Smart Assistant Button */}
        <div className="fixed bottom-8 left-8 z-40">
          <Link to="/chat">
            <Button 
              size="icon"
              className="h-16 w-16 rounded-full glow-neon-strong shadow-2xl hover:scale-110 transition-transform"
            >
              <MessageCircle className="h-8 w-8" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
