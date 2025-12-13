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
  Users,
  Sparkles,
  Search,
  ChevronLeft,
  Zap
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
  iconBg: string;
  path: string;
  badge?: string;
  category: string;
}

const tools: Tool[] = [
  {
    id: "chat",
    title: "دستیار هوشمند",
    description: "گفتگو با پیشرفته‌ترین مدل‌های AI",
    icon: MessageCircle,
    gradient: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-500/10",
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
    iconBg: "bg-purple-500/10",
    path: "/tools/image-generator",
    badge: "جدید",
    category: "تولید محتوا"
  },
  {
    id: "voice-to-text",
    title: "صدا به متن",
    description: "تبدیل فایل‌های صوتی به متن",
    icon: Mic,
    gradient: "from-green-500 to-emerald-500",
    iconBg: "bg-green-500/10",
    path: "/tools/voice-to-text",
    category: "صوتی"
  },
  {
    id: "text-to-voice",
    title: "متن به صدا",
    description: "تولید صدای طبیعی از متن",
    icon: Volume2,
    gradient: "from-teal-500 to-cyan-500",
    iconBg: "bg-teal-500/10",
    path: "/tools/text-to-voice",
    category: "صوتی"
  },
  {
    id: "code-generator",
    title: "تولید کد",
    description: "نوشتن کد با کمک AI",
    icon: Code,
    gradient: "from-orange-500 to-amber-500",
    iconBg: "bg-orange-500/10",
    path: "/tools/code-generator",
    category: "توسعه"
  },
  {
    id: "neohi",
    title: "NEOHI",
    description: "شبکه اجتماعی هوشمند",
    icon: Users,
    gradient: "from-pink-500 to-rose-500",
    iconBg: "bg-pink-500/10",
    path: "/neohi",
    category: "اجتماعی"
  }
];

const Tools = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTools = tools.filter(tool => {
    return tool.title.includes(searchQuery) || tool.description.includes(searchQuery);
  });

  return (
    <MainLayout>
      <div className="pb-6">
        {/* Hero Section */}
        <div className="px-4 pt-4 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5"
          >
            <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <Badge variant="secondary" className="text-xs">
                  {tools.length} ابزار
                </Badge>
              </div>
              <h1 className="text-xl font-bold mb-1">ابزارهای هوشمند</h1>
              <p className="text-sm text-muted-foreground">
                مجموعه کامل ابزارهای هوش مصنوعی
              </p>
            </div>
          </motion.div>
        </div>

        {/* Search */}
        <div className="px-4 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در ابزارها..."
              className="pr-10 h-11 rounded-xl bg-muted/50 border-border/50"
            />
          </motion.div>
        </div>


        {/* Tools List - Super App Style */}
        <div className="px-4 space-y-3">
          {filteredTools.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
              >
                <Link to={tool.path}>
                  <Card className="p-4 border-border/50 hover:border-primary/30 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <motion.div 
                        className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0",
                          `bg-gradient-to-br ${tool.gradient}`
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Icon className="w-7 h-7 text-white" />
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-semibold text-[15px] group-hover:text-primary transition-colors">
                            {tool.title}
                          </h3>
                          {tool.badge && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                              {tool.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {tool.description}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ChevronLeft className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
        
        {filteredTools.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 px-4"
          >
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-muted-foreground">ابزاری یافت نشد</p>
          </motion.div>
        )}
      </div>
    </MainLayout>
  );
};

export default Tools;
