import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Briefcase, User as UserIcon, MessageSquare, Megaphone, ImageIcon, 
  Send, Trash2, Plus, Menu, X, Upload, Download, Paperclip, 
  Volume2, GraduationCap, Mic, Settings, Sparkles, Phone
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type ModelType = "business" | "personal" | "general" | "ads" | "image" | "academic";

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

const Chat = () => {
  const { t, language } = useLanguage();
  const models: Model[] = [
    {
      id: "business",
      name: "مشاور کسب‌وکار",
      description: "راهنمای تجاری و استراتژیک",
      icon: Briefcase,
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      id: "personal",
      name: "مشاور شخصی",
      description: "توسعه فردی و مشاوره",
      icon: UserIcon,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: "general",
      name: "گفتگوی آزاد",
      description: "سوالات عمومی و کمک",
      icon: MessageSquare,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      id: "ads",
      name: "تولید تبلیغات",
      description: "محتوای تبلیغاتی و بازاریابی",
      icon: Megaphone,
      gradient: "from-orange-500 to-red-500"
    },
    {
      id: "image",
      name: "تولید تصویر",
      description: "ساخت تصویر از متن",
      icon: ImageIcon,
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      id: "academic",
      name: "مشاور درسی",
      description: "راهنمای تحصیلی و آموزش",
      icon: GraduationCap,
      gradient: "from-teal-500 to-cyan-500"
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
        imageUrl: msg.image_url || undefined,
        reasoning_details: (msg as any).reasoning_details || undefined
      }));
    setMessages(formattedMessages);
    setSidebarOpen(false);
  };

  const createNewConversation = async (modelType: ModelType) => {
    if (!user) return;
    setSelectedModel(modelType);
    setCurrentConversationId(null);
    setMessages([]);
    setSidebarOpen(false);
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
      toast.error("فقط تصویر مجاز است");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setUploadedFile(file);
      toast.success("تصویر بارگذاری شد");
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

        if (error || data?.error) {
          const errorMsg = data?.error || error?.message || "";
          
          if (errorMsg.includes("اعتبار") || errorMsg.includes("402")) {
            toast.error("اعتبار تمام شده است");
          } else if (errorMsg.includes("محدودیت") || errorMsg.includes("429")) {
            toast.error("محدودیت تعداد درخواست");
          } else {
            toast.error("خطا در تولید تصویر");
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
            toast.error("اعتبار تمام شده است");
          } else if (response.status === 429) {
            toast.error("محدودیت تعداد درخواست");
          } else {
            toast.error("خطا در ارسال پیام");
          }
          throw new Error("Failed to start stream");
        }

        if (!response.body) {
          toast.error("خطا در دریافت پاسخ");
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
              
              if (content) {
                assistantContent += content;
                setMessages((prev) => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1] = {
                    ...newMessages[newMessages.length - 1],
                    content: assistantContent
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
          await saveMessage(convId, "assistant", assistantContent);
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setSelectedModel(null);
    toast.success("گفتگو پاک شد");
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

  const currentModelData = selectedModel ? models.find(m => m.id === selectedModel) : null;

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary-50/30 overflow-hidden">
      {/* HEADER */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-16 md:h-20 border-b border-border/50 backdrop-blur-xl bg-background/80 px-4 md:px-8 flex items-center justify-between z-50"
      >
        <div className="flex items-center gap-3 md:gap-4">
          {/* AI Avatar */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Avatar className="h-10 w-10 md:h-12 md:w-12 bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg">
              <AvatarFallback className="bg-transparent text-white font-bold text-lg">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6" />
              </AvatarFallback>
            </Avatar>
          </motion.div>

          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-bold text-foreground">نئوهوش</h1>
            <p className="text-xs md:text-sm text-muted-foreground">آماده‌ام کمکت کنم ✨</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="h-10 w-10 rounded-xl hover:bg-accent/10"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </motion.header>

      {/* QUICK ACTIONS BAR */}
      {selectedModel && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 md:px-8 py-3 border-b border-border/30 bg-muted/30 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedModel(null)}
              className="rounded-full px-4 h-9 text-xs font-medium whitespace-nowrap bg-background hover:bg-accent/10 border-border/60"
            >
              <Sparkles className="h-3.5 w-3.5 ml-1.5" />
              تغییر مدل
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/voice-call")}
              className="rounded-full px-4 h-9 text-xs font-medium whitespace-nowrap bg-background hover:bg-accent/10 border-border/60"
            >
              <Phone className="h-3.5 w-3.5 ml-1.5" />
              تماس صوتی
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              className="rounded-full px-4 h-9 text-xs font-medium whitespace-nowrap bg-background hover:bg-destructive/10 border-border/60 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5 ml-1.5" />
              پاک کردن
            </Button>
          </div>
        </motion.div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {/* SIDEBAR */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
              />
              <motion.aside
                initial={{ x: 320 }}
                animate={{ x: 0 }}
                exit={{ x: 320 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed left-0 top-0 h-full w-80 bg-background border-l border-border shadow-2xl z-50 flex flex-col md:relative md:w-72"
              >
                <div className="p-4 border-b border-border/50 flex items-center justify-between">
                  <h2 className="text-lg font-bold">گفتگوها</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="p-4">
                  <Button
                    onClick={() => {
                      setSelectedModel(null);
                      setCurrentConversationId(null);
                      setMessages([]);
                      setSidebarOpen(false);
                    }}
                    className="w-full rounded-xl h-11 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    <Plus className="h-5 w-5 ml-2" />
                    گفتگوی جدید
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 space-y-2">
                  {conversations.map((conv) => (
                    <motion.button
                      key={conv.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => loadConversation(conv.id)}
                      className={`w-full text-right p-3 rounded-xl transition-all group relative ${
                        currentConversationId === conv.id
                          ? 'bg-primary-50 border border-primary-200'
                          : 'bg-muted/50 hover:bg-muted border border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium truncate flex-1">
                          {conv.title}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => deleteConversation(conv.id, e)}
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(conv.updated_at).toLocaleDateString('fa-IR')}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* MAIN CHAT AREA */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedModel ? (
            // MODEL SELECTION
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 overflow-y-auto p-4 md:p-8"
            >
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8 md:mb-12">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                  >
                    <Avatar className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-4 bg-gradient-to-br from-primary-400 to-primary-600 shadow-xl">
                      <AvatarFallback className="bg-transparent text-white">
                        <Sparkles className="h-8 w-8 md:h-10 md:w-10" />
                      </AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <h2 className="text-2xl md:text-4xl font-bold mb-3">به نئوهوش خوش آمدید</h2>
                  <p className="text-muted-foreground text-sm md:text-base">یک مدل هوش مصنوعی انتخاب کنید</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {models.map((model, idx) => {
                    const Icon = model.icon;
                    return (
                      <motion.button
                        key={model.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => createNewConversation(model.id)}
                        className="group relative p-6 rounded-2xl bg-gradient-to-br from-background to-muted border border-border/60 hover:border-primary/50 hover:shadow-xl transition-all text-right overflow-hidden"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${model.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${model.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-lg font-bold mb-2">{model.name}</h3>
                          <p className="text-sm text-muted-foreground">{model.description}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : (
            // MESSAGES AREA
            <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-4">
              <AnimatePresence mode="popLayout">
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
                  >
                    {msg.role === 'assistant' && (
                      <Avatar className="h-8 w-8 md:h-10 md:w-10 bg-gradient-to-br from-muted to-muted-foreground/20 flex-shrink-0">
                        <AvatarFallback className="bg-transparent">
                          <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br from-primary-500 to-primary-600 text-white'
                            : 'bg-muted/80 text-foreground border border-border/50'
                        }`}
                      >
                        {msg.imageUrl && (
                          <img
                            src={msg.imageUrl}
                            alt="Uploaded"
                            className="rounded-xl mb-2 max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setZoomedImage(msg.imageUrl)}
                          />
                        )}
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  <Avatar className="h-8 w-8 md:h-10 md:w-10 bg-gradient-to-br from-muted to-muted-foreground/20">
                    <AvatarFallback className="bg-transparent">
                      <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted/80 rounded-2xl px-5 py-3 border border-border/50">
                    <div className="flex gap-1.5">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                        className="w-2 h-2 rounded-full bg-muted-foreground/60"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                        className="w-2 h-2 rounded-full bg-muted-foreground/60"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                        className="w-2 h-2 rounded-full bg-muted-foreground/60"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* INPUT BAR */}
          {selectedModel && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 md:p-6 border-t border-border/50 bg-background/80 backdrop-blur-xl"
            >
              <div className="max-w-4xl mx-auto">
                {uploadedImage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-3 relative inline-block"
                  >
                    <img
                      src={uploadedImage}
                      alt="Preview"
                      className="rounded-xl max-h-24 border-2 border-border shadow-md"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={removeUploadedImage}
                      className="absolute -top-2 -left-2 h-6 w-6 rounded-full shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )}

                <div className="relative flex items-end gap-2 bg-muted/50 rounded-[28px] px-2 py-2 border border-border/60 shadow-lg">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-10 w-10 rounded-full hover:bg-accent/10 flex-shrink-0"
                  >
                    <Paperclip className="h-5 w-5" />
                  </Button>

                  <VoiceRecorder onTranscript={(text) => setMessage(text)} />

                  <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="پیام خود را بنویسید..."
                    className="flex-1 min-h-[40px] max-h-32 resize-none bg-transparent border-0 focus-visible:ring-0 text-sm md:text-base px-2"
                    rows={1}
                  />

                  <Button
                    onClick={handleSend}
                    disabled={(!message.trim() && !uploadedImage) || isLoading}
                    className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl disabled:opacity-50 flex-shrink-0 transition-all"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* IMAGE ZOOM DIALOG */}
      <Dialog open={!!zoomedImage} onOpenChange={() => setZoomedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-0">
          {zoomedImage && (
            <div className="relative">
              <img src={zoomedImage} alt="Zoomed" className="w-full h-auto rounded-xl" />
              <Button
                onClick={() => downloadImage(zoomedImage)}
                className="absolute bottom-4 right-4 rounded-full"
                size="icon"
              >
                <Download className="h-5 w-5" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Chat;