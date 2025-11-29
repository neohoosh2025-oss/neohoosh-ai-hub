import { useState } from "react";
import { motion } from "framer-motion";
import { Languages, Loader2, Download, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNeoFlux } from "@/contexts/NeoFluxContext";
import { translateSubtitle } from "@/services/translation";

interface TranslationLabProps {
  onNext: () => void;
}

const TranslationLab = ({ onNext }: TranslationLabProps) => {
  const [loading, setLoading] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState("fa");
  const { subtitle, translation, setTranslation, addToHistory, video } = useNeoFlux();
  const { toast } = useToast();

  const handleTranslate = async () => {
    if (!subtitle || !subtitle.formatted) {
      toast({ title: "ابتدا زیرنویس را تولید کنید", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const translatedText = await translateSubtitle(subtitle.formatted, targetLanguage);
      setTranslation({
        original: subtitle.formatted,
        translated: translatedText,
        language: targetLanguage,
      });
      addToHistory({
        type: "translation",
        videoTitle: video?.title,
        targetLanguage,
        status: "success",
      });
      toast({ title: "ترجمه با موفقیت انجام شد" });
    } catch (error: any) {
      toast({ 
        title: "خطا در ترجمه", 
        description: error.message,
        variant: "destructive" 
      });
      addToHistory({
        type: "translation",
        videoTitle: video?.title,
        targetLanguage,
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h2 className="text-3xl font-bold">آزمایشگاه ترجمه</h2>
        <p className="text-muted-foreground">
          زیرنویس را به زبان دلخواه ترجمه کنید
        </p>
      </motion.div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Languages className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">ترجمه هوشمند</h3>
              <p className="text-sm text-muted-foreground">
                با استفاده از Grok AI
              </p>
            </div>
          </div>

          <Select value={targetLanguage} onValueChange={setTargetLanguage}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="زبان مقصد" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fa">فارسی</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ar">العربية</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            onClick={handleTranslate}
            disabled={loading || !subtitle}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                در حال ترجمه...
              </>
            ) : (
              <>
                <Languages className="w-4 h-4 ml-2" />
                ترجمه
              </>
            )}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">متن اصلی</h4>
            <Textarea
              value={subtitle?.formatted || ""}
              readOnly
              className="min-h-[400px] font-mono text-sm"
              placeholder="زیرنویس اصلی اینجا نمایش داده می‌شود..."
            />
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm">ترجمه شده</h4>
            <Textarea
              value={translation?.translated || ""}
              onChange={(e) => translation && setTranslation({ ...translation, translated: e.target.value })}
              className="min-h-[400px] font-mono text-sm"
              placeholder="ترجمه اینجا نمایش داده می‌شود..."
            />
          </div>
        </div>

        {translation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 pt-4 border-t"
          >
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 ml-2" />
              دانلود ترجمه
            </Button>
            <Button onClick={onNext} className="flex-1">
              <CheckCircle2 className="w-4 h-4 ml-2" />
              اتمام و مشاهده داشبورد
            </Button>
          </motion.div>
        )}
      </Card>
    </div>
  );
};

export default TranslationLab;
