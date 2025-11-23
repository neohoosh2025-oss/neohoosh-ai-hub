import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Image, Sparkles, Download, Loader2, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("لطفاً توضیحات تصویر را وارد کنید");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt }
      });

      if (error) throw error;

      if (data?.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast.success("تصویر با موفقیت ساخته شد!");
      }
    } catch (error: any) {
      console.error("Image generation error:", error);
      toast.error(error.message || "خطا در تولید تصویر");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = `neohoosh-ai-${Date.now()}.png`;
      link.click();
      toast.success("تصویر دانلود شد");
    }
  };

  const examplePrompts = [
    "یک منظره طبیعی زیبا از کوهستان با آبشار",
    "پرتره یک گربه با سبک هنر دیجیتال",
    "یک شهر آینده‌نگر با ساختمان‌های بلند",
    "یک فنجان قهوه روی میز چوبی با نور صبح"
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6">
            <Image className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">ژنراتور تصویر AI</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            تولید تصویر با{" "}
            <span className="bg-gradient-to-l from-secondary via-primary to-accent bg-clip-text text-transparent">
              هوش مصنوعی
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed">
            با توصیف متنی خود، تصاویر حرفه‌ای و خلاقانه بسازید
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
                <Wand2 className="h-6 w-6 text-primary" />
                توضیحات تصویر
              </h2>
              
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="تصویر موردنظر خود را توصیف کنید... (به انگلیسی یا فارسی)"
                className="min-h-[200px] mb-4 resize-none"
                disabled={isGenerating}
              />

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
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
                    تولید تصویر
                  </>
                )}
              </Button>

              {/* Example Prompts */}
              <div>
                <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                  نمونه‌های پیشنهادی:
                </h3>
                <div className="space-y-2">
                  {examplePrompts.map((example, i) => (
                    <button
                      key={i}
                      onClick={() => setPrompt(example)}
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
            <Card className="p-6 border-border/50 h-full">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Image className="h-6 w-6 text-secondary" />
                نتیجه
              </h2>

              <div className="aspect-square rounded-lg bg-muted/30 flex items-center justify-center overflow-hidden">
                {isGenerating ? (
                  <div className="text-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">در حال تولید تصویر...</p>
                  </div>
                ) : generatedImage ? (
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center p-8">
                    <Image className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      تصویر شما اینجا نمایش داده می‌شود
                    </p>
                  </div>
                )}
              </div>

              {generatedImage && !isGenerating && (
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full mt-4 gap-2"
                  size="lg"
                >
                  <Download className="h-5 w-5" />
                  دانلود تصویر
                </Button>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
          {[
            { title: "کیفیت بالا", desc: "تصاویر با رزولوشن و کیفیت عالی" },
            { title: "سریع", desc: "تولید تصویر در کمتر از ۳۰ ثانیه" },
            { title: "خلاقانه", desc: "مدل‌های AI پیشرفته برای نتایج بهتر" }
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

export default ImageGenerator;
