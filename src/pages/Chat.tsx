import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, User as UserIcon, MessageSquare, Megaphone, ImageIcon, ArrowLeft, Loader2, Download, Share2, ZoomIn, Trash2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

type ModelType = "business" | "personal" | "general" | "ads" | "image";

interface Model {
  id: ModelType;
  name: string;
  description: string;
  icon: typeof Briefcase;
  gradient: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

interface Conversation {
  id: string;
  model_type: string;
  title: string;
  created_at: string;
  updated_at: string;
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
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user && selectedModel) {
      loadConversations();
    }
  }, [user, selectedModel]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const loadConversations = async () => {
    if (!selectedModel) return;
    
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .eq("model_type", selectedModel)
      .order("updated_at", { ascending: false });
    
    setConversations(data || []);
  };

  const loadConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    
    if (data) {
      const formattedMessages: Message[] = data
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
          imageUrl: msg.image_url || undefined
        }));
      setMessages(formattedMessages);
    }
  };

  const createNewConversation = async () => {
    if (!user || !selectedModel) return;

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        model_type: selectedModel,
        title: `گفتگوی جدید - ${models.find(m => m.id === selectedModel)?.name}`
      })
      .select()
      .single();

    if (error) {
      toast.error("خطا در ایجاد گفتگوی جدید");
      return;
    }

    setCurrentConversationId(data.id);
    setMessages([]);
    loadConversations();
  };

  const deleteConversation = async (conversationId: string) => {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", conversationId);

    if (error) {
      toast.error("خطا در حذف گفتگو");
      return;
    }

    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
      setMessages([]);
    }
    
    loadConversations();
    toast.success("گفتگو حذف شد");
  };

  const handleModelSelect = (modelId: ModelType) => {
    setSelectedModel(modelId);
    setMessages([]);
    setCurrentConversationId(null);
  };

  const handleBack = () => {
    setSelectedModel(null);
    setMessages([]);
    setCurrentConversationId(null);
    setConversations([]);
  };

  const saveMessage = async (role: "user" | "assistant", content: string, imageUrl?: string) => {
    if (!currentConversationId) return;

    await supabase.from("messages").insert({
      conversation_id: currentConversationId,
      role,
      content,
      image_url: imageUrl
    });

    // Update conversation's updated_at
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", currentConversationId);
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedModel || isLoading) return;
    
    // Create new conversation if needed
    if (!currentConversationId) {
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          model_type: selectedModel,
          title: message.slice(0, 50) + (message.length > 50 ? "..." : "")
        })
        .select()
        .single();

      if (error) {
        toast.error("خطا در ایجاد گفتگو");
        return;
      }

      setCurrentConversationId(data.id);
      loadConversations();
    }
    
    const userMessage: Message = { role: "user", content: message };
    setMessages(prev => [...prev, userMessage]);
    await saveMessage("user", message);
    
    setMessage("");
    setIsLoading(true);

    try {
      if (selectedModel === "image") {
        const { data, error } = await supabase.functions.invoke("chat", {
          body: { 
            messages: [{ role: "user", content: userMessage.content }],
            modelType: "image"
          }
        });

        if (error) throw error;

        const assistantMessage: Message = {
          role: "assistant",
          content: "تصویر شما آماده شد:",
          imageUrl: data.imageUrl
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        await saveMessage("assistant", assistantMessage.content, data.imageUrl);
      } else {
        // Send full conversation history for context awareness
        const allMessages = [...messages, userMessage];
        
        const { data, error } = await supabase.functions.invoke("chat", {
          body: { 
            messages: allMessages.map(m => ({ role: m.role, content: m.content })),
            modelType: selectedModel
          }
        });

        if (error) throw error;

        const assistantMessage: Message = {
          role: "assistant",
          content: data.response
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        await saveMessage("assistant", data.response);
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
      <div className="container mx-auto px-4 max-w-6xl">
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
          <div className="flex h-[calc(100vh-120px)] gap-0">
            {/* Sidebar - Conversations */}
            <div className="w-64 bg-secondary/30 border-l border-border flex flex-col">
              <div className="p-4 border-b border-border">
                <Button
                  onClick={createNewConversation}
                  className="w-full justify-start gap-2"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  گفتگوی جدید
                </Button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group p-3 rounded-lg mb-1 cursor-pointer transition-all ${
                      currentConversationId === conv.id
                        ? "bg-primary/20"
                        : "hover:bg-secondary"
                    }`}
                    onClick={() => loadConversation(conv.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{conv.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(conv.updated_at).toLocaleDateString("fa-IR")}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {conversations.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">
                    هنوز گفتگویی ندارید
                  </p>
                )}
              </div>

              <div className="p-4 border-t border-border">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="w-full justify-start gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  بازگشت به مدل‌ها
                </Button>
              </div>
            </div>

            {/* Main Chat */}
            <div className="flex-1 flex flex-col bg-background">
              <div className="flex-1 overflow-y-auto p-6">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className={`h-16 w-16 mb-4 rounded-full bg-gradient-to-br ${models.find(m => m.id === selectedModel)?.gradient} flex items-center justify-center`}>
                      {(() => {
                        const Icon = models.find(m => m.id === selectedModel)?.icon || MessageSquare;
                        return <Icon className="h-8 w-8 text-white" />;
                      })()}
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{models.find(m => m.id === selectedModel)?.name}</h2>
                    <p className="text-muted-foreground">{models.find(m => m.id === selectedModel)?.description}</p>
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto space-y-6">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[80%]`}>
                          <div
                            className={`rounded-2xl px-4 py-3 ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                            {msg.imageUrl && (
                              <div className="mt-3 space-y-2">
                                <img 
                                  src={msg.imageUrl} 
                                  alt="Generated" 
                                  className="rounded-xl max-w-full cursor-pointer hover:opacity-90 transition-opacity"
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
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-secondary text-secondary-foreground rounded-2xl px-4 py-3">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-border p-4 bg-background">
                <div className="max-w-3xl mx-auto">
                  <div className="flex gap-2">
                    <Input
                      placeholder={selectedModel === "image" ? "توضیح تصویر مورد نظر..." : "پیام خود را بنویسید..."}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSend()}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button onClick={handleSend} size="icon" disabled={isLoading} className="flex-shrink-0">
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowLeft className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
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
