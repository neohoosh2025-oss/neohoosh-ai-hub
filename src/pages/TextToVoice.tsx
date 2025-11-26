import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Volume2, Download, Loader2, Sparkles, Play, Pause } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TextToVoice = () => {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("alloy");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const voices = [
    { id: "alloy", name: "Alloy - خنثی" },
    { id: "echo", name: "Echo - مردانه" },
    { id: "fable", name: "Fable - داستانی" },
    { id: "onyx", name: "Onyx - قوی" },
    { id: "nova", name: "Nova - زنانه" },
    { id: "shimmer", name: "Shimmer - نرم" }
  ];

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error("لطفاً متن را وارد کنید");
      return;
    }

    setIsGenerating(true);
    setAudioUrl(null);
    setIsPlaying(false);

    try {
      const { data, error } = await supabase.functions.invoke("text-to-voice", {
        body: { text, voice }
      });

      if (error) throw error;

      if (data?.audioUrl) {
        setAudioUrl(data.audioUrl);
        toast.success("صدا با موفقیت ساخته شد!");
      }
    } catch (error: any) {
      console.error("Text to voice error:", error);
      toast.error(error.message || "خطا در تولید صدا");
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlay = () => {
    if (!audioUrl) return;

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = `neohoosh-voice-${Date.now()}.mp3`;
      link.click();
      toast.success("فایل دانلود شد");
    }
  };

  const exampleTexts = [
    "سلام، من دستیار هوش مصنوعی نئوهوش هستم. چطور می‌توانم کمکتان کنم؟",
    "Welcome to NeoHoosh AI platform. How can I assist you today?",
    "امروز روز زیبایی است. امیدوارم شما هم روز خوبی داشته باشید."
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Volume2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">تبدیل متن به صدا</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            تولید صدا با{" "}
            <span className="bg-gradient-to-l from-primary via-accent to-secondary bg-clip-text text-transparent">
              هوش مصنوعی
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed">
            متن خود را به صدای طبیعی و حرفه‌ای تبدیل کنید
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 border-border/50">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                متن ورودی
              </h2>
              
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="متن موردنظر خود را وارد کنید..."
                className="min-h-[200px] mb-4 resize-none"
                disabled={isGenerating}
              />

              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">
                  انتخاب صدا
                </label>
                <Select value={voice} onValueChange={setVoice} disabled={isGenerating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className="w-full gap-2 mb-6"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    در حال تولید...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    تولید صدا
                  </>
                )}
              </Button>

              {/* Example Texts */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                  نمونه‌های متن:
                </h3>
                <div className="space-y-2">
                  {exampleTexts.map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setText(example)}
                      className="w-full text-right p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm"
                      disabled={isGenerating}
                    >
                      {example}
                    </button>
                  ))}
                </div>
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
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Volume2 className="h-6 w-6 text-primary" />
                خروجی صوتی
              </h2>

              <div className="flex-1 rounded-lg bg-muted/30 flex flex-col items-center justify-center p-8">
                {isGenerating ? (
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">در حال تولید صدا...</p>
                  </div>
                ) : audioUrl ? (
                  <div className="text-center w-full">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <Volume2 className="h-10 w-10 text-primary" />
                    </div>
                    
                    <audio
                      ref={(ref) => {
                        audioRef.current = ref;
                        if (ref) {
                          ref.onended = () => setIsPlaying(false);
                        }
                      }}
                      src={audioUrl}
                      className="hidden"
                    />
                    
                    <div className="space-y-4">
                      <Button
                        onClick={togglePlay}
                        size="lg"
                        className="gap-2"
                      >
                        {isPlaying ? (
                          <>
                            <Pause className="h-5 w-5" />
                            توقف
                          </>
                        ) : (
                          <>
                            <Play className="h-5 w-5" />
                            پخش
                          </>
                        )}
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={handleDownload}
                          variant="outline"
                          className="flex-1 gap-2"
                        >
                          <Download className="h-5 w-5" />
                          دانلود
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Volume2 className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      صدای تولید شده اینجا نمایش داده می‌شود
                    </p>
                  </div>
                )}
              </div>

              {text && !isGenerating && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    تعداد کاراکترها: {text.length}
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
          {[
            { title: "صدای طبیعی", desc: "صداهای واقعی و انسانی با OpenAI TTS" },
            { title: "چند صدا", desc: "انتخاب از میان صداهای مختلف" },
            { title: "سریع", desc: "تولید فایل صوتی در کمتر از ۱۰ ثانیه" }
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

export default TextToVoice;
