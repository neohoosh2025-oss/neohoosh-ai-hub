import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Upload, FileAudio, Loader2, Sparkles, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VoiceToText = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        toast.error("حجم فایل نباید بیشتر از ۲۵ مگابایت باشد");
        return;
      }
      setAudioFile(file);
      setTranscription("");
    }
  };

  const handleTranscribe = async () => {
    if (!audioFile) {
      toast.error("لطفاً ابتدا یک فایل صوتی انتخاب کنید");
      return;
    }

    setIsProcessing(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioFile);
      
      await new Promise((resolve) => {
        reader.onloadend = resolve;
      });

      const base64Audio = (reader.result as string).split(',')[1];

      const { data, error } = await supabase.functions.invoke("voice-to-text", {
        body: { audio: base64Audio, filename: audioFile.name }
      });

      if (error) throw error;

      if (data?.text) {
        setTranscription(data.text);
        toast.success("تبدیل با موفقیت انجام شد!");
      }
    } catch (error: any) {
      console.error("Voice to text error:", error);
      toast.error(error.message || "خطا در تبدیل صدا به متن");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    toast.success("متن کپی شد");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6">
            <Mic className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium text-accent">تبدیل صدا به متن</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            تبدیل{" "}
            <span className="bg-gradient-to-l from-accent via-primary to-secondary bg-clip-text text-transparent">
              صدا به متن
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed">
            فایل‌های صوتی خود را به متن دقیق و قابل ویرایش تبدیل کنید
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 border-border/50">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Upload className="h-6 w-6 text-primary" />
                آپلود فایل صوتی
              </h2>

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border/50 rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all mb-6"
              >
                {audioFile ? (
                  <div>
                    <FileAudio className="h-16 w-16 text-accent mx-auto mb-4" />
                    <p className="font-medium mb-1">{audioFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-1">
                      کلیک کنید یا فایل را بکشید
                    </p>
                    <p className="text-sm text-muted-foreground">
                      فرمت‌های پشتیبانی: MP3, WAV, M4A, MP4
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      حداکثر حجم: ۲۵ مگابایت
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleTranscribe}
                disabled={!audioFile || isProcessing}
                className="w-full gap-2"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    در حال پردازش...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    تبدیل به متن
                  </>
                )}
              </Button>

              {/* Supported Formats */}
              <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                <h3 className="text-sm font-medium mb-2">قابلیت‌ها:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• پشتیبانی از فارسی و انگلیسی</li>
                  <li>• دقت بالا با OpenAI Whisper</li>
                  <li>• پردازش سریع</li>
                  <li>• حفظ نقطه‌گذاری و ساختار</li>
                </ul>
              </div>
            </Card>
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 border-border/50 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FileAudio className="h-6 w-6 text-accent" />
                  متن استخراج شده
                </h2>
                {transcription && (
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        کپی شد
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        کپی
                      </>
                    )}
                  </Button>
                )}
              </div>

              <Textarea
                value={transcription}
                onChange={(e) => setTranscription(e.target.value)}
                placeholder={isProcessing ? "در حال پردازش..." : "متن استخراج شده اینجا نمایش داده می‌شود..."}
                className="flex-1 min-h-[400px] resize-none"
                disabled={isProcessing}
              />

              {transcription && !isProcessing && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    تعداد کلمات: {transcription.split(/\s+/).filter(Boolean).length} | 
                    تعداد کاراکترها: {transcription.length}
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
          {[
            { title: "دقت بالا", desc: "استفاده از OpenAI Whisper برای دقت بیشتر" },
            { title: "چند زبانه", desc: "پشتیبانی از فارسی، انگلیسی و زبان‌های دیگر" },
            { title: "امن", desc: "فایل‌ها با امنیت کامل پردازش می‌شوند" }
          ].map((item, i) => (
            <Card key={i} className="p-6 text-center border-border/50">
              <h3 className="font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VoiceToText;
