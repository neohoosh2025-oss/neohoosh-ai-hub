import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, MessageSquare, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface Rating {
  id: string;
  conversation_id: string;
  message_index: number;
  rating_type: string;
  feedback_text: string | null;
  created_at: string;
  user_id: string;
}

interface RatingStats {
  totalRatings: number;
  likes: number;
  dislikes: number;
  satisfactionRate: number;
}

export const AdminRatings = () => {
  const { toast } = useToast();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [stats, setStats] = useState<RatingStats>({
    totalRatings: 0,
    likes: 0,
    dislikes: 0,
    satisfactionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('message_ratings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRatings(data || []);
      
      // Calculate stats
      const likes = data?.filter(r => r.rating_type === 'like').length || 0;
      const dislikes = data?.filter(r => r.rating_type === 'dislike').length || 0;
      const total = likes + dislikes;
      const satisfactionRate = total > 0 ? Math.round((likes / total) * 100) : 0;

      setStats({
        totalRatings: total,
        likes,
        dislikes,
        satisfactionRate
      });
    } catch (error) {
      console.error("Error loading ratings:", error);
      toast({
        title: "خطا",
        description: "خطا در بارگذاری رتبه‌بندی‌ها",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-6 mt-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">کل رتبه‌بندی‌ها</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRatings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">پاسخ‌های مفید</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.likes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">پاسخ‌های غیرمفید</CardTitle>
            <ThumbsDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.dislikes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نرخ رضایت</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.satisfactionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Ratings List */}
      <Card>
        <CardHeader>
          <CardTitle>رتبه‌بندی‌های اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          {ratings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              هنوز رتبه‌بندی ثبت نشده است
            </div>
          ) : (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div
                  key={rating.id}
                  className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-accent/20 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant={rating.rating_type === 'like' ? 'default' : 'destructive'}>
                        {rating.rating_type === 'like' ? (
                          <>
                            <ThumbsUp className="w-3 h-3 ml-1" />
                            مفید
                          </>
                        ) : (
                          <>
                            <ThumbsDown className="w-3 h-3 ml-1" />
                            غیرمفید
                          </>
                        )}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        پیام شماره {rating.message_index}
                      </span>
                    </div>
                    {rating.feedback_text && (
                      <p className="text-sm text-foreground mb-2">
                        "{rating.feedback_text}"
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        {new Date(rating.created_at).toLocaleDateString('fa-IR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="font-mono text-[10px]">
                        {rating.user_id.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
