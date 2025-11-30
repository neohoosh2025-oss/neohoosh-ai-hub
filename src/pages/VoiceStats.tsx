import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Clock, BarChart3, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MobileOptimized, MobileContainer } from '@/components/MobileOptimized';

interface Stats {
  totalCalls: number;
  totalDuration: number;
  averageDuration: number;
  dailyStats: { date: string; count: number; duration: number }[];
}

const VoiceStats = () => {
  const [stats, setStats] = useState<Stats>({
    totalCalls: 0,
    totalDuration: 0,
    averageDuration: 0,
    dailyStats: [],
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('voice_calls')
        .select('duration, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const totalDuration = data.reduce((sum, call) => sum + call.duration, 0);
        const dailyMap = new Map<string, { count: number; duration: number }>();

        data.forEach((call) => {
          const date = new Date(call.created_at).toLocaleDateString('fa-IR');
          const existing = dailyMap.get(date) || { count: 0, duration: 0 };
          dailyMap.set(date, {
            count: existing.count + 1,
            duration: existing.duration + call.duration,
          });
        });

        const dailyStats = Array.from(dailyMap.entries())
          .map(([date, stats]) => ({ date, ...stats }))
          .slice(0, 7)
          .reverse();

        setStats({
          totalCalls: data.length,
          totalDuration,
          averageDuration: Math.floor(totalDuration / data.length),
          dailyStats,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours} ساعت و ${mins} دقیقه`;
    }
    return `${mins} دقیقه و ${secs} ثانیه`;
  };

  const formatSimpleDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <MobileOptimized className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-center">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </MobileOptimized>
    );
  }

  const maxDailyCount = Math.max(...stats.dailyStats.map(s => s.count), 1);

  return (
    <MobileOptimized className="min-h-screen">
      <MobileContainer>
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">آمار تماس‌ها</h1>
            <p className="text-muted-foreground">تحلیل استفاده از تماس صوتی با AI</p>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-2 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">تعداد تماس‌ها</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-primary">{stats.totalCalls}</p>
                  <p className="text-sm text-muted-foreground mt-1">تماس صوتی</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">مدت زمان کل</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">
                    {formatSimpleDuration(stats.totalDuration)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatDuration(stats.totalDuration)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-2 hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">میانگین مدت</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-primary">
                    {formatSimpleDuration(stats.averageDuration)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">به ازای هر تماس</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Daily Chart */}
          {stats.dailyStats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    <CardTitle>نمودار استفاده روزانه</CardTitle>
                  </div>
                  <CardDescription>7 روز گذشته</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.dailyStats.map((stat, index) => (
                      <motion.div
                        key={stat.date}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{stat.date}</span>
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <span>{stat.count} تماس</span>
                            <span>{formatSimpleDuration(stat.duration)}</span>
                          </div>
                        </div>
                        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(stat.count / maxDailyCount) * 100}%` }}
                            transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/70 rounded-full"
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {stats.totalCalls === 0 && (
            <Card className="border-2 border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  هنوز آماری موجود نیست
                  <br />
                  پس از انجام تماس‌های صوتی، آمار اینجا نمایش داده می‌شود
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </MobileContainer>
    </MobileOptimized>
  );
};

export default VoiceStats;
