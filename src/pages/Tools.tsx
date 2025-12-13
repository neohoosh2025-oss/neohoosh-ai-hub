import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Image, 
  MessageCircle, 
  Mic, 
  Volume2, 
  Code, 
  FileText,
  Sparkles,
  Search,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MainLayout } from "@/components/layouts/MainLayout";

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: any;
  gradient: string;
  path: string;
  badge?: string;
  category: string;
}

const tools: Tool[] = [
  {
    id: "chat",
    title: "دستیار هوش مصنوعی",
    description: "گفتگو با پیشرفته‌ترین مدل‌های AI",
    icon: MessageCircle,
    gradient: "from-blue-500 to-cyan-500",
    path: "/chat",
    badge: "محبوب",
    category: "گفتگو"
  },
  {
    id: "image-generator",
    title: "تولید تصویر",
    description: "ساخت تصاویر حرفه‌ای با AI",
    icon: Image,
    gradient: "from-purple-500 to-pink-500",
    path: "/tools/image-generator",
    badge: "جدید",
    category: "تولید محتوا"
  },
  {
    id: "voice-to-text",
    title: "تبدیل صدا به متن",
    description: "تبدیل فایل‌های صوتی به متن",
    icon: Mic,
    gradient: "from-green-500 to-emerald-500",
    path: "/tools/voice-to-text",
    category: "صوتی"
  },
  {
    id: "text-to-voice",
    title: "تبدیل متن به صدا",
    description: "تولید صدای طبیعی از متن",
    icon: Volume2,
    gradient: "from-teal-500 to-cyan-500",
    path: "/tools/text-to-voice",
    category: "صوتی"
  },
  {
    id: "code-generator",
    title: "تولید کد",
    description: "نوشتن کد با کمک AI",
    icon: Code,
    gradient: "from-orange-500 to-amber-500",
    path: "/tools/code-generator",
    category: "توسعه"
  },
  {
    id: "neohi",
    title: "NEOHI",
    description: "شبکه اجتماعی هوشمند",
    icon: Users,
    gradient: "from-pink-500 to-rose-500",
    path: "/neohi",
    category: "اجتماعی"
  }
];

const categories = ["همه", "گفتگو", "تولید محتوا", "صوتی", "توسعه", "اجتماعی"];

const Tools = () => {
  const [selectedCategory, setSelectedCategory] = useState("همه");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === "همه" || tool.category === selectedCategory;
    const matchesSearch = tool.title.includes(searchQuery) || tool.description.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="sticky top-14 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">ابزارها</h1>
              <p className="text-xs text-muted-foreground">مجموعه کامل ابزارهای AI</p>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-3 h-3 ml-1" />
              {tools.length} ابزار
            </Badge>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در ابزارها..."
              className="pr-10 h-11 rounded-xl bg-muted/50 border-0"
            />
          </div>
        </div>
        
        {/* Category Pills */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-3">
          {filteredTools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={tool.path}>
                  <Card className="p-4 h-full border-border/50 hover:border-primary/30 hover:shadow-lg transition-all group relative overflow-hidden">
                    {tool.badge && (
                      <Badge className="absolute top-2 left-2 text-[10px] px-2 py-0 h-5 bg-accent/80 text-accent-foreground">
                        {tool.badge}
                      </Badge>
                    )}
                    
                    <motion.div 
                      className={cn(
                        "w-12 h-12 rounded-xl mb-3 flex items-center justify-center",
                        `bg-gradient-to-br ${tool.gradient}`
                      )}
                      whileHover={{ scale: 1.05, rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </motion.div>
                    
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {tool.description}
                    </p>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
        
        {filteredTools.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">ابزاری یافت نشد</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Tools;
