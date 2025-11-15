import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Briefcase, User as UserIcon, MessageSquare, Megaphone, ImageIcon, Send, Trash2, Plus, Menu, X, ArrowRight, Upload, Download } from "lucide-react";
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
  color: string;
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
    color: "text-blue-500"
  },
  {
    id: "personal",
    name: "توسعه فردی",
    description: "مشاوره برای رشد شخصی و حرفه‌ای",
    icon: UserIcon,
    color: "text-purple-500"
  },
  {
    id: "general",
    name: "سوالات آزاد",
    description: "پاسخ به هر سوالی که دارید",
    icon: MessageSquare,
    color: "text-green-500"
  },
  {
    id: "ads",
    name: "تولید تبلیغات",
    description: "ایجاد محتوای تبلیغاتی جذاب",
    icon: Megaphone,
    color: "text-orange-500"
  },
  {
    id: "image",
    name: "تبدیل متن به عکس",
    description: "تولید تصویر از توضیحات شما",
    icon: ImageIcon,
    color: "text-indigo-500"
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [typingContent, setTypingContent] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadAllConversations();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const loadAllConversations = async () => {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    
    setConversations(data || []);
  };

  const loadConversation = async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    
    if (error) {
      console.error("Error loading messages:", error);
      toast.error("خطا در بارگذاری پیام‌ها");
      return;
    }
    
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      setSelectedModel(conv.model_type as ModelType);
    }
    
    const formattedMessages: Message[] = (data || [])
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
        imageUrl: msg.image_url || undefined
      }));
    setMessages(formattedMessages);
  };

  const createNewConversation = async (modelType: ModelType) => {
    if (!user) return;

    setSelectedModel(modelType);
    setCurrentConversationId(null);
    setMessages([]);
  };

  const deleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
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
      setSelectedModel(null);
    }
    
    loadAllConversations();
    toast.success("گفتگو حذف شد");
  };

  const saveMessage = async (conversationId: string, role: "user" | "assistant", content: string, imageUrl?: string) => {
    if (!conversationId) return;

    await supabase.from("messages").insert({
      conversation_id: conversationId,
      role,
      content,
      image_url: imageUrl
    });

    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("لطفاً فقط فایل تصویری انتخاب کنید");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setUploadedFile(file);
      toast.success("تصویر آپلود شد");
    };
    reader.readAsDataURL(file);
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const typewriterEffect = (text: string, onComplete: () => void) => {
    setIsTyping(true);
    setTypingContent("");
    let currentIndex = 0;
    
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }
    
    typingIntervalRef.current = setInterval(() => {
      if (currentIndex < text.length) {
        setTypingContent(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setIsTyping(false);
        onComplete();
      }
    }, 20); // سرعت تایپ (میلی‌ثانیه)
  };

  const handleSend = async () => {
    if ((!message.trim() && !uploadedImage) || !selectedModel || isLoading || !user) return;
    
    // Ensure conversation exists and get its id
    let convId: string;
    if (!currentConversationId) {
      const title = uploadedImage && !message.trim()
        ? "تحلیل تصویر"
        : message.slice(0, 50) + (message.length > 50 ? "..." : "");
      
      const { data, error } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          model_type: selectedModel,
          title
        })
        .select()
        .single();

      if (error || !data) {
        toast.error("خطا در ایجاد گفتگو");
        return;
      }

      convId = data.id;
      setCurrentConversationId(convId);
      loadAllConversations();
    } else {
      convId = currentConversationId;
    }
    
    const messageContent = uploadedImage && !message.trim() 
      ? "لطفاً این تصویر را تحلیل کنید" 
      : message;
    
    const userMessage: Message = { 
      role: "user", 
      content: messageContent,
      ...(uploadedImage && { imageUrl: uploadedImage })
    };
    
    setMessages(prev => [...prev, userMessage]);
    await saveMessage(convId, "user", messageContent, uploadedImage || undefined);
    
    const currentImage = uploadedImage;
    setMessage("");
    setUploadedImage(null);
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        
        // Show typing animation for image generation response
        typewriterEffect(assistantMessage.content, async () => {
          setMessages(prev => [...prev, assistantMessage]);
          await saveMessage(convId, "assistant", assistantMessage.content, data.imageUrl);
        });
      } else {
        const allMessages = [...messages, userMessage];
        
        const { data, error } = await supabase.functions.invoke("chat", {
          body: { 
            messages: allMessages.map(m => ({ role: m.role, content: m.content })),
            modelType: selectedModel,
            ...(currentImage && { imageData: currentImage })
          }
        });

        if (error) throw error;

        const assistantMessage: Message = {
          role: "assistant",
          content: data.response
        };
        
        // Show typing animation for text response
        typewriterEffect(data.response, async () => {
          setMessages(prev => [...prev, assistantMessage]);
          await saveMessage(convId, "assistant", data.response);
        });
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

  return (
    <div className="fixed inset-0 pt-16 bg-background flex overflow-hidden" dir="rtl">
      {/* Sidebar Overlay for Mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        ${isMobile ? 'fixed right-0 top-16 bottom-0 z-50' : 'relative'}
        ${sidebarOpen ? 'w-64' : 'w-0'} 
        transition-all duration-300 bg-card border-l border-border flex flex-col overflow-hidden
      `}>
        <div className="p-3 border-b border-border bg-background">
          <Button
            onClick={() => {
              setSelectedModel(null);
              setCurrentConversationId(null);
              setMessages([]);
              if (isMobile) setSidebarOpen(false);
            }}
            className="w-full justify-start gap-2"
            variant="default"
          >
            <Plus className="h-4 w-4" />
            گفتگوی جدید
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group p-3 rounded-lg mb-1 cursor-pointer transition-colors ${
                currentConversationId === conv.id
                  ? "bg-primary/10"
                  : "hover:bg-secondary"
              }`}
              onClick={() => {
                loadConversation(conv.id);
                if (isMobile) setSidebarOpen(false);
              }}
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
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with Menu Toggle */}
        <div className="p-3 border-b border-border bg-background flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex-shrink-0"
          >
            {sidebarOpen ? <ArrowRight className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          {selectedModel && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {(() => {
                const model = models.find(m => m.id === selectedModel);
                const Icon = model?.icon || MessageSquare;
                return (
                  <>
                    <Icon className={`h-4 w-4 flex-shrink-0 ${model?.color}`} />
                    <span className="text-sm font-medium truncate">{model?.name}</span>
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {!selectedModel ? (
            <div className="max-w-2xl mx-auto p-4 md:p-8 pt-8 md:pt-20">
              <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">نئوهوش</h1>
              <p className="text-center text-sm md:text-base text-muted-foreground mb-8 md:mb-12">مدل مورد نظرتان را انتخاب کنید</p>
              
              <div className="grid gap-3">
                {models.map((model) => {
                  const Icon = model.icon;
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        createNewConversation(model.id);
                        if (isMobile) setSidebarOpen(false);
                      }}
                      className="p-3 md:p-4 rounded-xl border border-border hover:bg-secondary/50 active:bg-secondary transition-all text-right flex items-center gap-3"
                    >
                      <Icon className={`h-5 w-5 ${model.color}`} />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{model.name}</h3>
                        <p className="text-xs text-muted-foreground">{model.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              {(() => {
                const model = models.find(m => m.id === selectedModel);
                const Icon = model?.icon || MessageSquare;
                return (
                  <>
                    <Icon className={`h-12 w-12 mb-4 ${model?.color}`} />
                    <h2 className="text-xl font-bold mb-2">{model?.name}</h2>
                    <p className="text-muted-foreground text-center max-w-md">{model?.description}</p>
                  </>
                );
              })()}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6 pb-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} px-2 md:px-0`}>
                  <div className={`max-w-[85%] md:max-w-[80%] ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"} rounded-2xl px-3 md:px-4 py-2.5 md:py-3`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    {msg.imageUrl && (
                      <div className="mt-3">
                        <img 
                          src={msg.imageUrl} 
                          alt="تصویر" 
                          className="rounded-lg max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setZoomedImage(msg.imageUrl!)}
                        />
                        {msg.role === "assistant" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => downloadImage(msg.imageUrl!)}
                            className="mt-2 gap-1 text-xs"
                          >
                            <Download className="h-3 w-3" />
                            دانلود
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start px-2 md:px-0 animate-fade-in">
                  <div className="max-w-[85%] md:max-w-[80%] bg-secondary rounded-2xl px-3 md:px-4 py-2.5 md:py-3">
                    <p className="text-sm whitespace-pre-wrap">
                      {typingContent}
                      <span className="inline-block w-0.5 h-4 bg-primary mr-0.5 animate-pulse"></span>
                    </p>
                  </div>
                </div>
              )}
              
              {isLoading && !isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-2xl px-4 py-3 text-sm text-muted-foreground">
                    در حال تایپ...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        {selectedModel && (
          <div className="border-t border-border p-3 md:p-4 bg-background safe-area-bottom">
            <div className="max-w-3xl mx-auto">
              {/* Image Upload Preview */}
              {uploadedImage && (
                <div className="mb-3 relative inline-block">
                  <img 
                    src={uploadedImage} 
                    alt="آپلود شده" 
                    className="max-h-32 rounded-lg border border-border"
                  />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={removeUploadedImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || selectedModel === "image"}
                  title="آپلود تصویر"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                <Input
                  placeholder={selectedModel === "image" ? "توضیح تصویر..." : uploadedImage ? "سوالی درباره تصویر بپرسید..." : "پیام خود را بنویسید..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1 min-w-0 text-base"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={isLoading || (!message.trim() && !uploadedImage)}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
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
