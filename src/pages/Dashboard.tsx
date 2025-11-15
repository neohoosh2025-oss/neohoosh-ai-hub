import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";
import { BookMarked, Activity, Eye, TrendingUp } from "lucide-react";
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
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {t("dashboard.welcome") || "خوش آمدید"}، {user?.email}
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.subtitle") || "نمای کلی فعالیت‌ها و آمار شما"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.savedArticles") || "مقالات ذخیره شده"}
              </CardTitle>
              <BookMarked className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalSaved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.totalActivity") || "کل فعالیت‌ها"}
              </CardTitle>
              <Activity className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalActivity}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.memberSince") || "عضویت از"}
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {stats.joinDate ? format(new Date(stats.joinDate), "MMM yyyy") : "-"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Saved Articles */}
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.recentlySaved") || "اخیراً ذخیره شده"}</CardTitle>
              <CardDescription>
                {t("dashboard.savedDesc") || "مقالات ذخیره شده شما"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {savedArticles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("dashboard.noSaved") || "هنوز مقاله‌ای ذخیره نکرده‌اید"}
                </p>
              ) : (
                <div className="space-y-4">
                  {savedArticles.map((saved) => (
                    <div
                      key={saved.id}
                      className="flex gap-4 p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => navigate(`/articles/${saved.article_id}`)}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-1">
                          {saved.articles.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {saved.articles.excerpt}
                        </p>
                        <span className="text-xs text-primary mt-2 inline-block">
                          {saved.articles.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.recentActivity") || "فعالیت‌های اخیر"}</CardTitle>
              <CardDescription>
                {t("dashboard.activityDesc") || "آخرین فعالیت‌های شما"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {t("dashboard.noActivity") || "هنوز فعالیتی ثبت نشده"}
                </p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg border"
                    >
                      <div className="mt-1 text-primary">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{getActivityText(activity)}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(activity.created_at), "PPp")}
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
