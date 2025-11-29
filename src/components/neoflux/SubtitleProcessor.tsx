import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, Download, Play } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useNeoFlux } from "@/contexts/NeoFluxContext";
import { generateSubtitles } from "@/services/subtitle";
import { exportSubtitle } from "@/utils/subtitleExport";

interface SubtitleProcessorProps {
  onNext: () => void;
}

const SubtitleProcessor = ({ onNext }: SubtitleProcessorProps) => {
  const [loading, setLoading] = useState(false);
  const { video, subtitle, setSubtitle, addToHistory } = useNeoFlux();
  const { toast } = useToast();

  const handleGenerateSubtitle = async () => {
    if (!video) {
      toast({ title: "ابتدا ویدیو را وارد کنید", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const subtitleData = await generateSubtitles(video);
      setSubtitle(subtitleData);
      addToHistory({
        type: "subtitle_generation",
        videoTitle: video.title,
        status: "success",
      });
      toast({ title: "زیرنویس با موفقیت تولید شد" });
    } catch (error: any) {
      toast({ 
        title: "خطا در تولید زیرنویس", 
        description: error.message,
        variant: "destructive" 
      });
      addToHistory({
        type: "subtitle_generation",
        videoTitle: video.title,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: "srt" | "vtt") => {
    if (!subtitle || !subtitle.timestamps) {
      toast({ title: "زیرنویسی برای دانلود وجود ندارد", variant: "destructive" });
      return;
    }

    exportSubtitle(subtitle.timestamps, format, video?.title || "subtitle");
    toast({ title: `فایل ${format.toUpperCase()} دانلود شد` });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-3xl font-bold">پردازش زیرنویس</h2>
        <p className="text-muted-foreground">
          زیرنویس ویدیو را تولید و ویرایش کنید
        </p>
      </motion.div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">تولید زیرنویس</h3>
              <p className="text-sm text-muted-foreground">
                استخراج متن از صدای ویدیو
              </p>
            </div>
          </div>

          <Button 
            onClick={handleGenerateSubtitle}
            disabled={loading || !video}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                در حال پردازش...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 ml-2" />
                تولید زیرنویس
              </>
            )}
          </Button>
        </div>

        {subtitle && subtitle.formatted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <Textarea
              value={subtitle.formatted}
              onChange={(e) => setSubtitle({ ...subtitle, formatted: e.target.value })}
              className="min-h-[300px] font-mono text-sm"
              placeholder="زیرنویس اینجا نمایش داده می‌شود..."
            />

            <div className="flex gap-3">
              <Button onClick={() => handleExport("srt")} variant="outline" className="flex-1">
                <Download className="w-4 h-4 ml-2" />
                دانلود SRT
              </Button>
              <Button onClick={() => handleExport("vtt")} variant="outline" className="flex-1">
                <Download className="w-4 h-4 ml-2" />
                دانلود VTT
              </Button>
              <Button onClick={onNext} className="flex-1">
                ادامه به ترجمه
              </Button>
            </div>
          </motion.div>
        )}
      </Card>
    </div>
  );
};

export default SubtitleProcessor;
