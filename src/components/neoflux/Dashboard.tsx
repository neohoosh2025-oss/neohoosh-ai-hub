import { motion } from "framer-motion";
import { TrendingUp, CheckCircle2, AlertCircle, Clock, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNeoFlux } from "@/contexts/NeoFluxContext";
import { formatDistanceToNow } from "date-fns";

const Dashboard = () => {
  const { history } = useNeoFlux();

  const stats = {
    total: history.length,
    successful: history.filter(h => h.status === "success").length,
    failed: history.filter(h => h.status === "error").length,
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-3xl font-bold">داشبورد</h2>
        <p className="text-muted-foreground">
          آمار و تاریخچه پردازش‌های شما
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">کل پردازش‌ها</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.successful}</p>
              <p className="text-xs text-muted-foreground">موفق</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.failed}</p>
              <p className="text-xs text-muted-foreground">ناموفق</p>
            </div>
          </div>
        </Card>
      </div>

      {/* History */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4">تاریخچه پردازش‌ها</h3>
        
        {history.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>هنوز پردازشی انجام نشده است</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  item.status === "success" 
                    ? "bg-green-500/10" 
                    : "bg-red-500/10"
                }`}>
                  {item.status === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.videoTitle || "بدون عنوان"}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      {item.type === "subtitle_generation" ? "تولید زیرنویس" : "ترجمه"}
                    </Badge>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(item.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>

                <Button variant="ghost" size="sm">
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
