import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, User as UserIcon, MessageSquare, Megaphone, ImageIcon, ArrowLeft, Loader2, Download, Share2, ZoomIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type ModelType = "business" | "personal" | "general" | "ads" | "image";

interface Model {
  id: ModelType;
  name: string;
  description: string;
  icon: typeof Briefcase;
  gradient: string;
}

const models: Model[] = [
  {
    id: "business",
    name: "مشاور کسب و کار",
    description: "راهنمایی حرفه‌ای برای کسب و کار شما",
    icon: Briefcase,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: "personal",
    name: "توسعه فردی",
    description: "مشاوره برای رشد شخصی و حرفه‌ای",
    icon: UserIcon,
    gradient: "from-purple-500 to-pink-500"
  },
  {
    id: "general",
    name: "سوالات آزاد",
    description: "پاسخ به هر سوالی که دارید",
    icon: MessageSquare,
    gradient: "from-green-500 to-emerald-500"
  },
  {
    id: "ads",
    name: "تولید تبلیغات",
    description: "ایجاد محتوای تبلیغاتی جذاب",
    icon: Megaphone,
    gradient: "from-orange-500 to-red-500"
  },
  {
    id: "image",
    name: "تبدیل متن به عکس",
    description: "تولید تصویر از توضیحات شما",
    icon: ImageIcon,
    gradient: "from-indigo-500 to-violet-500"
  }
];

const Chat = () => {
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; imageUrl?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const handleModelSelect = (modelId: ModelType) => {
    setSelectedModel(modelId);
    setMessages([]);
  };

  const handleBack = () => {
    setSelectedModel(null);
    setMessages([]);
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedModel || isLoading) return;
    
    const userMessage = { role: "user" as const, content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      if (selectedModel === "image") {
        const { data, error } = await supabase.functions.invoke("chat", {
          body: { 
            messages: [userMessage],
            modelType: "image"
          }
        });

        if (error) throw error;

        setMessages(prev => [
          ...prev,
          { 
            role: "assistant", 
            content: "تصویر شما آماده شد:",
            imageUrl: data.imageUrl 
          }
        ]);
      } else {
        const { data, error } = await supabase.functions.invoke("chat", {
          body: { 
            messages: [...messages, userMessage],
            modelType: selectedModel
          }
        });

        if (error) throw error;

        setMessages(prev => [
          ...prev,
          { role: "assistant", content: data.response }
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("خطا در ارتباط با هوش مصنوعی");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `neohoosh-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("تصویر دانلود شد");
  };

  const shareMessage = (content: string) => {
    if (navigator.share) {
      navigator.share({
        text: content,
        title: 'نئوهوش - پاسخ هوش مصنوعی'
      }).catch(() => {
        navigator.clipboard.writeText(content);
        toast.success("متن کپی شد");
      });
    } else {
      navigator.clipboard.writeText(content);
      toast.success("متن کپی شد");
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">دستیار هوشمند نئوهوش</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">
            {selectedModel ? models.find(m => m.id === selectedModel)?.description : "مدل مورد نظر خود را انتخاب کنید"}
          </p>
        </div>

        {!selectedModel ? (
          <div className="grid gap-4 md:gap-6">
            {models.map((model) => {
              const Icon = model.icon;
              return (
                <button
                  key={model.id}
                  onClick={() => handleModelSelect(model.id)}
                  className="group relative overflow-hidden rounded-xl p-4 md:p-6 text-right transition-all hover:scale-105 hover:shadow-lg border border-border bg-card"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${model.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="relative flex items-start gap-3 md:gap-4">
                    <div className={`p-2 md:p-3 rounded-lg bg-gradient-to-br ${model.gradient} flex-shrink-0`}>
                      <Icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold mb-1 text-base md:text-lg">{model.name}</h5>
                      <p className="text-xs md:text-sm text-muted-foreground">{model.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
            <div className="bg-gradient-to-r from-primary/20 to-primary/10 border-b border-border p-3 md:p-4 flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h3 className="font-semibold text-sm md:text-base truncate">
                {models.find(m => m.id === selectedModel)?.name}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <div className={`h-12 w-12 md:h-16 md:w-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${models.find(m => m.id === selectedModel)?.gradient} flex items-center justify-center`}>
                    {(() => {
                      const Icon = models.find(m => m.id === selectedModel)?.icon || MessageSquare;
                      return <Icon className="h-6 w-6 md:h-8 md:w-8 text-white" />;
                    })()}
                  </div>
                  <p className="text-xs md:text-sm">{models.find(m => m.id === selectedModel)?.description}</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] md:max-w-[80%]`}>
                      <div
                        className={`rounded-lg p-3 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        {msg.imageUrl && (
                          <div className="mt-2 space-y-2">
                            <img 
                              src={msg.imageUrl} 
                              alt="Generated" 
                              className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setZoomedImage(msg.imageUrl!)}
                            />
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => downloadImage(msg.imageUrl!)}
                                className="gap-1 text-xs"
                              >
                                <Download className="h-3 w-3" />
                                دانلود
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setZoomedImage(msg.imageUrl!)}
                                className="gap-1 text-xs"
                              >
                                <ZoomIn className="h-3 w-3" />
                                بزرگ‌نمایی
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      {msg.role === "assistant" && !msg.imageUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => shareMessage(msg.content)}
                          className="mt-1 gap-1 text-xs h-7"
                        >
                          <Share2 className="h-3 w-3" />
                          اشتراک‌گذاری
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-secondary-foreground rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 md:p-4 border-t border-border bg-background">
              <div className="flex gap-2">
                <Input
                  placeholder={selectedModel === "image" ? "توضیح تصویر مورد نظر..." : "پیام خود را بنویسید..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
                  disabled={isLoading}
                  className="flex-1 text-sm"
                />
                <Button onClick={handleSend} size="icon" disabled={isLoading} className="flex-shrink-0">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeft className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
        <DialogContent className="max-w-4xl p-2">
          {zoomedImage && (
            <img 
              src={zoomedImage} 
              alt="Zoomed" 
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;
