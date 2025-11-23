import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, User as UserIcon, MessageSquare, Megaphone, ImageIcon, Send, Trash2, Plus, Menu, X, Upload, Download, Square, Copy, Check, Home, Sparkles, Paperclip, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";

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
  reasoning_details?: any;
}

interface Conversation {
  id: string;
  model_type: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const quickActions = [
  { label: "ساخت محتوای اینستاگرام", prompt: "یک کپشن خلاقانه برای اینستاگرام بنویس" },
  { label: "تحلیل متن", prompt: "این متن را تحلیل کن" },
  { label: "تولید مقاله", prompt: "یک مقاله حرفه‌ای بنویس درباره" },
  { label: "بهبود متن", prompt: "این متن را ویرایش و بهبود بده" },
];

const Chat = () => {
  const { t, language } = useLanguage();
  const models: Model[] = [
    {
      id: "business",
      name: t("chat.businessAdvisor"),
      description: t("chat.businessDesc"),
      icon: Briefcase,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: "personal",
      name: t("chat.personalDev"),
      description: t("chat.personalDesc"),
      icon: UserIcon,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: "general",
      name: t("chat.openQuestions"),
      description: t("chat.openQuestionsDesc"),
      icon: MessageSquare,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      id: "ads",
      name: t("chat.adsGen"),
      description: t("chat.adsGenDesc"),
      icon: Megaphone,
      gradient: "from-orange-500 to-red-500"
    },
    {
      id: "image",
      name: t("chat.textToImage"),
      description: t("chat.textToImageDesc"),
      icon: ImageIcon,
      gradient: "from-indigo-500 to-purple-500"
    },
  ];

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

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
      toast.error(t("contact.error"));
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
        imageUrl: msg.image_url || undefined,
        reasoning_details: (msg as any).reasoning_details || undefined
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
      toast.error(t("contact.error"));
      return;
    }

    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
      setMessages([]);
      setSelectedModel(null);
    }
    
    loadAllConversations();
    toast.success(t("chat.conversationDeleted"));
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
      toast.error(t("contact.error"));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setUploadedFile(file);
      toast.success(t("contact.success"));
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

  const handleSend = async () => {
    if ((!message.trim() && !uploadedImage) || !selectedModel || isLoading || !user) return;
    
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
        toast.error(t("contact.error"));
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

        if (error || data?.error) {
          const errorMsg = data?.error || error?.message || "";
          
          if (errorMsg.includes("اعتبار") || errorMsg.includes("402")) {
            toast.error(t("chat.creditError"));
          } else if (errorMsg.includes("محدودیت") || errorMsg.includes("429")) {
            toast.error(t("chat.rateLimitError"));
          } else {
            toast.error(t("chat.error"));
          }
          throw new Error(errorMsg);
        }

        const assistantMessage: Message = {
          role: "assistant",
          content: "تصویر شما آماده شد:",
          imageUrl: data.imageUrl
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        await saveMessage(convId, "assistant", assistantMessage.content, data.imageUrl);
      } else {
        const allMessages = [...messages, userMessage];
        
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              messages: allMessages.map(m => ({ role: m.role, content: m.content })),
              modelType: selectedModel,
              ...(currentImage && { imageData: currentImage })
            }),
          }
        );

        if (!response.ok) {
          if (response.status === 402) {
            toast.error("اعتبار تمام شده است. لطفاً اعتبار خود را شارژ کنید.");
          } else if (response.status === 429) {
            toast.error("محدودیت تعداد درخواست. لطفاً چند لحظه صبر کنید.");
          } else {
            toast.error(t("chat.error"));
          }
          throw new Error("Failed to start stream");
        }

        if (!response.body) {
          toast.error(t("chat.error"));
          throw new Error("No response body");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let streamDone = false;
        let assistantContent = "";

        const placeholderMessage: Message = {
          role: "assistant",
          content: "",
        };
        setMessages(prev => [...prev, placeholderMessage]);

        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);

            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;

            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") {
              streamDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              const reasoningDetails = parsed.choices?.[0]?.message?.reasoning_details;
              
              if (content) {
                assistantContent += content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    ...newMessages[newMessages.length - 1],
                    content: assistantContent,
                    ...(reasoningDetails && { reasoning_details: reasoningDetails })
                  };
                  return newMessages;
                });
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        if (assistantContent) {
          const lastMessage = messages[messages.length - 1];
          await saveMessage(
            convId, 
            "assistant", 
            assistantContent,
            undefined
          );
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `neohoosh-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("تصویر دانلود شد");
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("خطا در دانلود تصویر");
    }
  };

  const handleCopyMessage = async (content: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast.success("متن کپی شد");
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error("Error copying message:", error);
      toast.error("خطا در کپی کردن متن");
    }
  };

  const handleQuickAction = (prompt: string) => {
    setMessage(prompt);
    textareaRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 bg-[hsl(var(--chat-bg))] flex flex-col overflow-hidden" dir={language === "en" ? "ltr" : "rtl"}>
      {/* Glassmorphism Header */}
      <div className="h-14 border-b border-border/40 flex items-center justify-between px-4 shrink-0 backdrop-blur-xl bg-[hsl(var(--chat-header-bg))] sticky top-0 z-50">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-all duration-200"
        >
          <Home className="w-4 h-4" />
          <span className="font-medium text-sm hidden sm:inline">{language === "en" ? "Home" : "خانه"}</span>
        </button>
        
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-500" />
          <h1 className="text-base font-semibold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
            {language === "en" ? "AI Chat" : "چت هوش مصنوعی"}
          </h1>
        </div>
        
        <ThemeToggle />
      </div>
      
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Overlay for Mobile */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`
          ${isMobile ? 'fixed right-0 top-14 bottom-0 z-50' : 'relative'}
          ${sidebarOpen ? 'w-64' : 'w-0'} 
          transition-all duration-300 bg-[hsl(var(--chat-sidebar-bg))] border-l border-border/40 flex flex-col overflow-hidden
        `}>
          <div className="p-3 border-b border-border/40">
            <Button
              onClick={() => {
                setSelectedModel(null);
                setCurrentConversationId(null);
                setMessages([]);
                if (isMobile) setSidebarOpen(false);
              }}
              className="w-full justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-white"
            >
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">گفتگوی جدید</span>
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group p-3 rounded-xl mb-1 cursor-pointer transition-all duration-200 ${
                  currentConversationId === conv.id
                    ? "bg-primary-50 dark:bg-primary-900/20"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => {
                  loadConversation(conv.id);
                  if (isMobile) setSidebarOpen(false);
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(conv.updated_at).toLocaleDateString("fa-IR")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => deleteConversation(conv.id, e)}
                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toggle Sidebar Button */}
          <div className="p-2 border-b border-border/40 bg-background/50 backdrop-blur-sm flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex-shrink-0"
            >
              <Menu className="h-4 w-4" />
            </Button>
            {selectedModel && (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {(() => {
                  const model = models.find(m => m.id === selectedModel);
                  const Icon = model?.icon || MessageSquare;
                  return (
                    <>
                      <div className={`p-1.5 rounded-lg bg-gradient-to-br ${model?.gradient}`}>
                        <Icon className="h-3.5 w-3.5 text-white" />
                      </div>
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
              <div className="max-w-3xl mx-auto p-6 pt-12">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{t("chat.title")}</h1>
                  <p className="text-muted-foreground">{t("chat.subtitle")}</p>
                </div>
                
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
                        className="group p-4 rounded-2xl border border-border/60 hover:border-primary-300 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all duration-200 text-right flex items-center gap-4"
                      >
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${model.gradient} group-hover:scale-110 transition-transform duration-200`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-0.5">{model.name}</h3>
                          <p className="text-xs text-muted-foreground">{model.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-6">
                {(() => {
                  const model = models.find(m => m.id === selectedModel);
                  const Icon = model?.icon || MessageSquare;
                  return (
                    <>
                      <div className={`p-6 rounded-3xl bg-gradient-to-br ${model?.gradient} mb-4`}>
                        <Icon className="h-12 w-12 text-white" />
                      </div>
                      <h2 className="text-xl font-bold mb-2">{model?.name}</h2>
                      <p className="text-muted-foreground text-center max-w-md mb-6">{model?.description}</p>
                      
                      {/* Quick Actions */}
                      <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
                        {quickActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleQuickAction(action.prompt)}
                            className="px-4 py-2 rounded-full border border-border/60 hover:bg-muted/50 text-sm transition-all duration-200 hover:scale-105"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="max-w-3xl mx-auto p-4 space-y-4 pb-4">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} group message-animation`}>
                    <div className={`relative max-w-[85%] ${
                      msg.role === "user" 
                        ? "bg-[hsl(var(--chat-user-bubble))] border border-primary-200/50" 
                        : "bg-[hsl(var(--chat-bot-bubble))] border border-border/40"
                    } rounded-2xl px-4 py-3 shadow-sm`}>
                      {msg.role === "assistant" && (
                        <button
                          onClick={() => handleCopyMessage(msg.content, idx)}
                          className="absolute -top-2 -left-2 p-1.5 rounded-full bg-background border border-border opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-muted shadow-sm"
                          title="کپی کردن"
                        >
                          {copiedMessageId === idx ? (
                            <Check className="w-3.5 h-3.5 text-success" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:font-semibold [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_table]:border [&_table]:border-border [&_th]:border [&_th]:border-border [&_th]:bg-muted/50 [&_th]:px-3 [&_th]:py-2 [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-lg [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      )}
                      {msg.imageUrl && (
                        <div className="mt-3">
                          <img 
                            src={msg.imageUrl} 
                            alt="تصویر" 
                            className="rounded-xl max-w-full cursor-pointer hover:opacity-90 transition-opacity border border-border/40"
                            onClick={() => setZoomedImage(msg.imageUrl!)}
                          />
                          {msg.role === "assistant" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => downloadImage(msg.imageUrl!)}
                              className="mt-2 gap-1.5 text-xs"
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
                {isLoading && (
                  <div className="flex justify-start message-animation">
                    <div className="bg-[hsl(var(--chat-bot-bubble))] border border-border/40 rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          {selectedModel && (
            <div className="border-t border-border/40 p-4 bg-background/50 backdrop-blur-sm">
              <div className="max-w-3xl mx-auto">
                {/* Image Upload Preview */}
                {uploadedImage && (
                  <div className="mb-3 relative inline-block">
                    <img 
                      src={uploadedImage} 
                      alt="آپلود شده" 
                      className="max-h-32 rounded-xl border border-border/60"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-md"
                      onClick={removeUploadedImage}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                <div className="flex gap-2 items-end">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || selectedModel === "image"}
                    className="h-10 w-10 shrink-0 hover:bg-muted/50"
                    title="آپلود تصویر"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1 relative">
                    <Textarea
                      ref={textareaRef}
                      placeholder={selectedModel === "image" ? "توضیح تصویر..." : uploadedImage ? "سوالی درباره تصویر بپرسید..." : "پیام خود را بنویسید..."}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey && !isLoading) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      disabled={isLoading}
                      className="resize-none min-h-[44px] max-h-[120px] pr-12 rounded-2xl border-border/60 bg-[hsl(var(--chat-input-bg))] focus:border-primary-300 transition-all duration-200 text-[15px] leading-relaxed"
                      rows={1}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute left-2 bottom-2 h-7 w-7 hover:bg-muted/50"
                      title="پیام صوتی"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button 
                    onClick={handleSend} 
                    disabled={isLoading || (!message.trim() && !uploadedImage)}
                    size="icon"
                    className="h-10 w-10 shrink-0 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl shadow-sm disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
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