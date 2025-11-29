import { useState } from "react";
import { motion } from "framer-motion";
import { Youtube, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNeoFlux } from "@/contexts/NeoFluxContext";
import { fetchYouTubeVideo } from "@/services/youtube";

interface VideoInputProps {
  onNext: () => void;
}

const VideoInput = ({ onNext }: VideoInputProps) => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { video, setVideo } = useNeoFlux();
  const { toast } = useToast();

  const handleYouTubeImport = async () => {
    if (!youtubeUrl) {
      toast({ title: "لطفاً لینک یوتیوب را وارد کنید", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const videoData = await fetchYouTubeVideo(youtubeUrl);
      setVideo(videoData);
      toast({ title: "ویدیو با موفقیت دریافت شد" });
    } catch (error: any) {
      toast({ 
        title: "خطا در دریافت ویدیو", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast({ title: "لطفاً فایل ویدیویی انتخاب کنید", variant: "destructive" });
      return;
    }

    const url = URL.createObjectURL(file);
    setVideo({
      file,
      url,
      title: file.name,
    });
    toast({ title: "فایل آپلود شد" });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-3xl font-bold">ورودی ویدیو</h2>
        <p className="text-muted-foreground">
          ویدیوی خود را از یوتیوب وارد کنید یا فایل محلی آپلود کنید
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* YouTube Import */}
        <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <Youtube className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">وارد کردن از یوتیوب</h3>
              <p className="text-sm text-muted-foreground">لینک ویدیو را وارد کنید</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="youtube-url">لینک یوتیوب</Label>
            <Input
              id="youtube-url"
              placeholder="https://youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              disabled={loading}
            />
            <Button 
              onClick={handleYouTubeImport} 
              disabled={loading || !youtubeUrl}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                  در حال دریافت...
                </>
              ) : (
                <>
                  <Youtube className="w-4 h-4 ml-2" />
                  دریافت ویدیو
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Local Upload */}
        <Card className="p-6 space-y-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">آپلود فایل محلی</h3>
              <p className="text-sm text-muted-foreground">فایل ویدیو را انتخاب کنید</p>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="file-upload">انتخاب فایل</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
              <input
                id="file-upload"
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
                <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  کلیک کنید یا فایل را اینجا بکشید
                </p>
                <p className="text-xs text-muted-foreground">MP4, AVI, MOV, WebM</p>
              </label>
            </div>
          </div>
        </Card>
      </div>

      {/* Video Preview */}
      {video && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <Card className="p-6 space-y-4 border-green-500/20 bg-green-500/5">
            <div className="flex items-start gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div className="flex-1 space-y-3">
                <div>
                  <h4 className="font-semibold text-lg">ویدیو آماده است</h4>
                  <p className="text-sm text-muted-foreground">{video.title || "بدون عنوان"}</p>
                </div>

                {video.url && (
                  <video
                    src={video.url}
                    controls
                    className="w-full rounded-lg max-h-96 bg-black"
                  />
                )}

                <Button onClick={onNext} className="w-full">
                  ادامه به مرحله زیرنویس
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default VideoInput;
