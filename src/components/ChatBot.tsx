import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Briefcase, User, MessageSquare, Megaphone, ImageIcon, ArrowLeft, Loader2, Film, Sparkles, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

type ModelType = "business" | "personal" | "general" | "ads" | "image" | "animation" | "video" | "academic";

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
    icon: User,
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
  },
  {
    id: "animation",
    name: "تبدیل متن به انیمیشن",
    description: "ساخت انیمیشن از توضیحات شما",
    icon: Sparkles,
    gradient: "from-yellow-500 to-amber-500"
  },
  {
    id: "video",
    name: "تبدیل متن به ویدیو",
    description: "تولید ویدیو از توضیحات شما",
    icon: Film,
    gradient: "from-rose-500 to-pink-500"
  },
  {
    id: "academic",
    name: "مشاور درسی و دانشگاهی",
    description: "راهنمای تحصیلی، حل مسائل و آموزش",
    icon: GraduationCap,
    gradient: "from-teal-500 to-cyan-500"
  }
];

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; imageUrl?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      if (selectedModel === "image" || selectedModel === "animation" || selectedModel === "video") {
        // Handle media generation (image/animation/video)
        const { data, error } = await supabase.functions.invoke("chat", {
          body: { 
            messages: [userMessage],
            modelType: selectedModel
          }
        });

        if (error) throw error;

        const contentMessages: Record<ModelType, string> = {
          image: "تصویر شما آماده شد:",
          animation: "انیمیشن شما آماده شد:",
          video: "ویدیو شما آماده شد:",
          business: "",
          personal: "",
          general: "",
          ads: "",
          academic: ""
        };

        setMessages(prev => [
          ...prev,
          { 
            role: "assistant", 
            content: contentMessages[selectedModel],
            imageUrl: data.imageUrl || data.videoUrl 
          }
        ]);
      } else {
        // Handle text chat
        const { data, error } = await supabase.functions.invoke("chat", {
          body: { 
            messages: [...messages, userMessage],
            modelType: selectedModel
          }
        });

        if (error) throw error;

        setMessages(prev => [
          ...prev,
          { role: "assistant", content: data.text }
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("خطا در ارتباط با هوش مصنوعی");
    } finally {
      setIsLoading(false);
    }
  };

  const { t, language } = useLanguage();

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className={`fixed bottom-6 ${language === 'fa' || language === 'ar' ? 'left-6' : 'right-6'} h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform`}
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 ${language === 'fa' || language === 'ar' ? 'left-6' : 'right-6'} w-96 h-[600px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden`}>
          {/* Header */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/10 border-b border-border p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedModel && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="h-8 w-8 -ml-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <MessageCircle className="h-5 w-5 text-primary" />
              <h3 className="font-semibold flex-1">
                {selectedModel ? models.find(m => m.id === selectedModel)?.name : t("hero.smartAssistant")}
              </h3>
              {selectedModel && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSelectedModel(null);
                    setMessages([]);
                  }}
                  className="gap-2 mr-2"
                >
                  {t("chat.newConversation")}
                </Button>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setIsOpen(false);
                setSelectedModel(null);
                setMessages([]);
              }}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          {!selectedModel ? (
            <div className="flex-1 overflow-y-auto p-6">
              <h4 className="text-lg font-bold mb-6 text-center">{t("chat.selectModel")}</h4>
              <div className="grid gap-4">
                {models.map((model) => {
                  const Icon = model.icon;
                  return (
                    <button
                      key={model.id}
                      onClick={() => handleModelSelect(model.id)}
                      className="group relative overflow-hidden rounded-xl p-4 text-right transition-all hover:scale-105 hover:shadow-lg border border-border bg-card"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${model.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                      <div className="relative flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${model.gradient}`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold mb-1">{model.name}</h5>
                          <p className="text-xs text-muted-foreground">{model.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <div className={`h-16 w-16 mx-auto mb-3 rounded-full bg-gradient-to-br ${models.find(m => m.id === selectedModel)?.gradient} flex items-center justify-center`}>
                      {(() => {
                        const Icon = models.find(m => m.id === selectedModel)?.icon || MessageCircle;
                        return <Icon className="h-8 w-8 text-white" />;
                      })()}
                    </div>
                    <p className="text-sm">{models.find(m => m.id === selectedModel)?.description}</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        {msg.imageUrl && (
                          <img 
                            src={msg.imageUrl} 
                            alt="Generated" 
                            className="mt-2 rounded-lg max-w-full"
                          />
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

              {/* Input */}
              <div className="p-4 border-t border-border bg-background">
                <div className="flex gap-2">
                  <Input
                    placeholder={t("chat.typeMessage")}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} size="icon" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBot;
