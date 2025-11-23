import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookMarked, Activity, Eye, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";

interface SavedArticle {
  id: string;
  article_id: string;
  created_at: string;
  articles: {
    title: string;
    excerpt: string;
    category: string;
  };
}

interface UserActivity {
  id: string;
  activity_type: string;
  activity_data: any;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [recentActivity, setRecentActivity] = useState<UserActivity[]>([]);
  const [stats, setStats] = useState({
    totalSaved: 0,
    totalActivity: 0,
    joinDate: "",
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);
      await loadDashboardData(user.id);
      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadDashboardData = async (userId: string) => {
    // Load saved articles
    const { data: savedData } = await supabase
      .from("saved_articles")
      .select(`
        id,
        article_id,
        created_at,
        articles (
          title,
          excerpt,
          category
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (savedData) {
      setSavedArticles(savedData as SavedArticle[]);
    }

    // Load recent activity
    const { data: activityData } = await supabase
      .from("user_activity")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (activityData) {
      setRecentActivity(activityData);
    }

    // Calculate stats
    const { count: savedCount } = await supabase
      .from("saved_articles")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const { count: activityCount } = await supabase
      .from("user_activity")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    setStats({
      totalSaved: savedCount || 0,
      totalActivity: activityCount || 0,
      joinDate: user?.created_at || "",
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "article_view":
        return <Eye className="h-4 w-4" />;
      case "article_save":
        return <BookMarked className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: UserActivity) => {
    switch (activity.activity_type) {
      case "article_view":
        return t("dashboard.viewedArticle") || "مقاله را مشاهده کرد";
      case "article_save":
        return t("dashboard.savedArticle") || "مقاله را ذخیره کرد";
      default:
        return activity.activity_type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-20 px-4">
        <div className="container mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-6 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-16 px-3 sm:py-20 sm:px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Hero Header */}
        <div className="mb-8 sm:mb-12 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-display-lg font-bold mb-2 sm:mb-3 bg-gradient-to-l from-primary via-secondary to-accent bg-clip-text text-transparent break-words">
            {t("dashboard.welcome")}، {user?.user_metadata?.display_name || user?.email}
          </h1>
          <p className="text-sm sm:text-base md:text-body-lg text-muted-foreground">
            {t("dashboard.overview")}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 mb-8 sm:mb-12">
          <Card className="hover-scale animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                {t("dashboard.savedArticlesCount")}
              </CardTitle>
              <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10">
                <BookMarked className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-l from-primary to-secondary bg-clip-text text-transparent">
                {stats.totalSaved}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                مقالات ذخیره شده
              </p>
            </CardContent>
          </Card>

          <Card className="hover-scale animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                {t("dashboard.totalActivity")}
              </CardTitle>
              <div className="p-1.5 sm:p-2 rounded-xl bg-secondary/10">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-l from-secondary to-accent bg-clip-text text-transparent">
                {stats.totalActivity}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                فعالیت کل
              </p>
            </CardContent>
          </Card>

          <Card className="hover-scale animate-fade-in sm:col-span-2 md:col-span-1" style={{ animationDelay: "0.3s" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 p-4 sm:p-6">
              <CardTitle className="text-xs sm:text-sm font-medium">
                {t("dashboard.memberSince")}
              </CardTitle>
              <div className="p-1.5 sm:p-2 rounded-xl bg-accent/10">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {stats.joinDate ? format(new Date(stats.joinDate), "MMM yyyy") : "-"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                تاریخ عضویت
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Saved Articles */}
          <Card className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 shrink-0">
                  <BookMarked className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-xl truncate">{t("dashboard.savedArticles")}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {t("dashboard.savedDesc")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {savedArticles.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 rounded-2xl bg-muted/50 w-fit">
                    <BookMarked className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t("dashboard.noSaved")}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {savedArticles.map((saved) => (
                    <div
                      key={saved.id}
                      className="group p-3 sm:p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/5 transition-all cursor-pointer"
                      onClick={() => navigate(`/articles/${saved.article_id}`)}
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-xs sm:text-sm line-clamp-1 group-hover:text-primary transition-colors break-words">
                          {saved.articles.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1 sm:mt-2 leading-relaxed">
                          {saved.articles.excerpt}
                        </p>
                        <div className="flex items-center gap-2 mt-2 sm:mt-3 flex-wrap">
                          <span className="text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 bg-primary/10 text-primary rounded-lg font-medium">
                            {saved.articles.category}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(saved.created_at), "MMM d")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-xl bg-secondary/10 shrink-0">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-xl truncate">{t("dashboard.recentActivity")}</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {t("dashboard.activityDesc")}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="mx-auto mb-3 sm:mb-4 p-3 sm:p-4 rounded-2xl bg-muted/50 w-fit">
                    <Activity className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t("dashboard.noActivity")}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border border-border hover:bg-accent/5 transition-all"
                    >
                      <div className="p-1.5 sm:p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium break-words">{getActivityText(activity)}</p>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(activity.created_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
