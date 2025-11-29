import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Image, 
  MessageCircle, 
  Mic, 
  Volume2, 
  Code, 
  FileText,
  Sparkles,
  ArrowLeft,
  Zap,
  Brain,
  Wand2,
  Video
} from "lucide-react";
import { Link } from "react-router-dom";

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  path: string;
  badge?: string;
  category: string;
}

const tools: Tool[] = [
  {
    id: "chat",
    title: "دستیار هوش مصنوعی",
    description: "گفتگو با پیشرفته‌ترین مدل‌های AI مانند GPT-5 و Gemini",
    icon: MessageCircle,
    color: "primary",
    path: "/chat",
    badge: "محبوب",
    category: "گفتگو و تحلیل"
  },
  {
    id: "neoflux",
    title: "NeoFlux - پردازش ویدیو",
    description: "پردازش ویدیو، تولید و ترجمه زیرنویس با هوش مصنوعی",
    icon: Video,
    color: "accent",
    path: "/neoflux",
    badge: "جدید",
    category: "تولید محتوا"
  },
  {
    id: "image-generator",
    title: "تولید تصویر",
    description: "ساخت تصاویر حرفه‌ای با هوش مصنوعی از روی متن",
    icon: Image,
    color: "secondary",
    path: "/tools/image-generator",
    category: "تولید محتوا"
  },
  {
    id: "voice-to-text",
    title: "تبدیل صدا به متن",
    description: "تبدیل فایل‌های صوتی به متن با دقت بالا",
    icon: Mic,
    color: "accent",
    path: "/tools/voice-to-text",
    category: "صوتی"
  },
  {
    id: "text-to-voice",
    title: "تبدیل متن به صدا",
    description: "تولید صدای طبیعی و حرفه‌ای از متن",
    icon: Volume2,
    color: "primary",
    path: "/tools/text-to-voice",
    category: "صوتی"
  },
  {
    id: "code-generator",
    title: "تولید کد",
    description: "نوشتن کد برنامه‌نویسی با کمک هوش مصنوعی",
    icon: Code,
    color: "secondary",
    path: "/tools/code-generator",
    category: "توسعه"
  },
  {
    id: "content-writer",
    title: "نویسنده محتوا",
    description: "تولید محتوای باکیفیت برای وبلاگ، شبکه‌های اجتماعی و...",
    icon: FileText,
    color: "accent",
    path: "/chat",
    category: "تولید محتوا"
  }
];

const categories = ["همه", "گفتگو و تحلیل", "تولید محتوا", "صوتی", "توسعه"];

const Tools = () => {
  const [selectedCategory, setSelectedCategory] = useState("همه");

  const filteredTools = selectedCategory === "همه" 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory);

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">مجموعه کامل ابزارهای AI</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              ابزارهای{" "}
              <span className="bg-gradient-to-l from-primary via-secondary to-accent bg-clip-text text-transparent">
                هوش مصنوعی
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              با استفاده از پیشرفته‌ترین مدل‌های AI، کارهای خود را سریع‌تر و هوشمندانه‌تر انجام دهید
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, i) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section>
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredTools.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Link to={tool.path}>
                  <Card className={`p-6 h-full border-border/50 hover:border-${tool.color}/50 hover:shadow-xl transition-all group relative overflow-hidden`}>
                    {/* Badge */}
                    {tool.badge && (
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                        {tool.badge}
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-2xl bg-${tool.color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <tool.icon className={`h-7 w-7 text-${tool.color}`} />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {tool.description}
                    </p>

                    {/* Category Tag */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground">
                        {tool.category}
                      </span>
                      <ArrowLeft className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 group-hover:-translate-x-2 transition-all" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pt-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-12 text-center border-primary/20" style={{ background: 'var(--gradient-mesh)' }}>
            <Wand2 className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">
              آماده شروع استفاده هستید؟
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              همین حالا شروع کنید و قدرت ابزارهای هوش مصنوعی را تجربه کنید
            </p>
            <Link to="/chat">
              <Button size="lg" className="gap-2">
                <Zap className="h-5 w-5" />
                شروع رایگان
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Tools;
