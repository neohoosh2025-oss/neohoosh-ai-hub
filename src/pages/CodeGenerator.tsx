import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, Copy, Check, Loader2, Sparkles, FileCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const CodeGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const languages = [
    { id: "javascript", name: "JavaScript" },
    { id: "typescript", name: "TypeScript" },
    { id: "python", name: "Python" },
    { id: "java", name: "Java" },
    { id: "csharp", name: "C#" },
    { id: "go", name: "Go" },
    { id: "rust", name: "Rust" },
    { id: "php", name: "PHP" },
    { id: "ruby", name: "Ruby" },
    { id: "swift", name: "Swift" }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("لطفاً توضیحات کد را وارد کنید");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("code-generator", {
        body: { prompt, language }
      });

      if (error) throw error;

      if (data?.code) {
        setGeneratedCode(data.code);
        toast.success("کد با موفقیت تولید شد!");
      }
    } catch (error: any) {
      console.error("Code generation error:", error);
      toast.error(error.message || "خطا در تولید کد");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast.success("کد کپی شد");
    setTimeout(() => setCopied(false), 2000);
  };

  const examplePrompts = [
    "یک تابع برای محاسبه فاکتوریل",
    "کد برای اتصال به دیتابیس و خواندن داده‌ها",
    "یک API endpoint برای ثبت نام کاربر",
    "یک کامپوننت React برای نمایش لیست کاربران"
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
            <Code className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">تولید کد AI</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            تولید کد با{" "}
            <span className="bg-gradient-to-l from-secondary via-accent to-primary bg-clip-text text-transparent">
              هوش مصنوعی
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground leading-relaxed">
            کد برنامه‌نویسی خود را با کمک AI بنویسید
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
                توضیحات کد
              </h2>
              
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="کدی که می‌خواهید را توضیح دهید..."
                className="min-h-[200px] mb-4 resize-none font-mono"
                disabled={isGenerating}
              />

              <div className="mb-4">
                <label className="text-sm font-medium mb-2 block">
                  زبان برنامه‌نویسی
                </label>
                <Select value={language} onValueChange={setLanguage} disabled={isGenerating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.id} value={lang.id}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                    تولید کد
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
            <Card className="p-6 border-border/50 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <FileCode className="h-6 w-6 text-secondary" />
                  کد تولید شده
                </h2>
                {generatedCode && (
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
                value={generatedCode}
                onChange={(e) => setGeneratedCode(e.target.value)}
                placeholder={isGenerating ? "در حال تولید کد..." : "کد تولید شده اینجا نمایش داده می‌شود..."}
                className="flex-1 min-h-[400px] resize-none font-mono text-sm"
                disabled={isGenerating}
                dir="ltr"
              />

              {generatedCode && !isGenerating && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    تعداد خطوط: {generatedCode.split('\n').length} | 
                    تعداد کاراکترها: {generatedCode.length}
                  </p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
          {[
            { title: "چند زبانه", desc: "پشتیبانی از ۱۰+ زبان برنامه‌نویسی" },
            { title: "هوشمند", desc: "کد بهینه و کارآمد با Lovable AI" },
            { title: "سریع", desc: "تولید کد در چند ثانیه" }
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

export default CodeGenerator;
