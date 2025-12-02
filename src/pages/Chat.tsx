import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Briefcase, User as UserIcon, MessageSquare, Megaphone, ImageIcon, 
  Send, Trash2, Paperclip, Sparkles, Phone, History, Bot, Home, GraduationCap, Copy, Check, ChevronRight, ThumbsUp, ThumbsDown, Square, Terminal
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

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
}

const Chat = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const models: Model[] = [
    {
      id: "general",
      name: "گفتگوی عمومی",
      description: "مکالمه عمومی و پاسخگویی",
      icon: MessageSquare,
      gradient: "from-[#4BA6FF] to-[#5E60CE]"
    },
    {
      id: "business",
      name: "مشاور کسب‌وکار",
      description: "راهنمای استراتژیک",
      icon: Briefcase,
      gradient: "from-[#5E60CE] to-[#4BA6FF]"
    },
    {
      id: "personal",
      name: "مشاور شخصی",
      description: "توسعه فردی",
      icon: UserIcon,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      id: "ads",
      name: "تولید تبلیغات",
      description: "محتوای بازاریابی",
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
      name: "مدل درسی و تحصیلی",
      description: "کمک در درس و تحصیل",
      icon: GraduationCap,
      gradient: "from-green-500 to-teal-500"
    },
  ];

  const [user, setUser] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<any[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedCodeBlock, setCopiedCodeBlock] = useState<string | null>(null);
  const [ratedMessages, setRatedMessages] = useState<Map<number, 'like' | 'dislike'>>(new Map());
  const [userScrolled, setUserScrolled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const accumulatedContentRef = useRef<string>("");

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user && !selectedModel) {
      loadConversations();
    }
  }, [user, selectedModel]);

  // Smart auto-scroll - only if user hasn't scrolled up
  useEffect(() => {
    if (!userScrolled) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, userScrolled]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setUserScrolled(!isNearBottom);
  }, []);

  // Reset userScrolled when loading starts
  useEffect(() => {
    if (!isLoading) {
      setUserScrolled(false);
    }
  }, [isLoading]);

  // Copy code block handler
  const handleCopyCode = (code: string, blockId: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeBlock(blockId);
    setTimeout(() => setCopiedCodeBlock(null), 2000);
  };

  // Stop generation handler
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  };

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const handleModelSelect = async (modelId: ModelType) => {
    setSelectedModel(modelId);
    setMessages([]);
    
    // Create new conversation with temporary title
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        model_type: modelId,
        title: 'گفتگوی جدید'
      })
      .select()
      .single();

    if (convError) {
      console.error("Error creating conversation:", convError);
      toast.error("خطا در ایجاد گفتگو", { duration: 2000 });
      return;
    }

    setCurrentConversationId(convData.id);
  };

  const handleNewChat = () => {
    setMessages([]);
    setSelectedModel(null);
    setCurrentConversationId(null);
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedModel || !currentConversationId) return;

    const userMessageContent = message;
    const userMessage: Message = { role: "user", content: userMessageContent };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    setUserScrolled(false);

    // Create AbortController for stopping generation
    abortControllerRef.current = new AbortController();

    try {
      // Save user message
      await supabase.from('messages').insert({
        conversation_id: currentConversationId,
        role: 'user',
        content: userMessageContent
      });

      // Update conversation title based on first message
      const isFirstMessage = messages.length === 0;
      if (isFirstMessage) {
        // Extract actual text content, removing any file links
        const cleanContent = userMessageContent.replace(/\[فایل:.*?\]\(.*?\)/g, '').trim();
        const title = cleanContent.length > 60 
          ? cleanContent.substring(0, 60) + '...'
          : cleanContent || 'گفتگوی جدید';
        
        await supabase
          .from('conversations')
          .update({ 
            title,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentConversationId);
        
        // Reload conversations to update the list
        await loadConversations();
      }

      // Prepare messages array with full history
      const conversationMessages = [...messages, userMessage].map(m => ({
        role: m.role,
        content: m.content
      }));

      // Create assistant message placeholder
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      // Get user's auth token for memory access
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      // Stream AI response with abort signal
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            messages: conversationMessages,
            modelType: selectedModel
          }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to start stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedContent = "";
      accumulatedContentRef.current = "";
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });
        
        let newlineIndex;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              accumulatedContent += content;
              accumulatedContentRef.current = accumulatedContent;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                if (newMessages[lastIndex]?.role === "assistant") {
                  newMessages[lastIndex] = {
                    role: "assistant",
                    content: accumulatedContent
                  };
                }
                return newMessages;
              });
            }
          } catch (e) {
            // Re-buffer partial JSON
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Save final AI message
      if (accumulatedContent) {
        await supabase.from('messages').insert({
          conversation_id: currentConversationId,
          role: 'assistant',
          content: accumulatedContent
        });

        // Extract and save memories asynchronously (don't wait for it)
        supabase.functions.invoke('extract-memory', {
          body: { conversationId: currentConversationId }
        }).then(({ data, error }) => {
          if (error) {
            console.error('Memory extraction error:', error);
          } else if (data?.memoriesSaved > 0) {
            console.log(`✓ ${data.memoriesSaved} حافظه جدید ذخیره شد`);
          }
        }).catch(e => console.error('Memory extraction failed:', e));
      }

    } catch (error: any) {
      // Handle abort - save partial content if any
      if (error.name === 'AbortError') {
        const partialContent = accumulatedContentRef.current;
        if (partialContent) {
          await supabase.from('messages').insert({
            conversation_id: currentConversationId,
            role: 'assistant',
            content: partialContent
          });
        }
        return; // Don't show error for manual stop
      }
      
      console.error("Error sending message:", error);
      toast.error("خطا در ارسال پیام", { duration: 2000 });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
      accumulatedContentRef.current = "";
    }
  };

  const loadConversations = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error("Error loading conversations:", error);
      toast.error("خطا در بارگذاری تاریخچه", { duration: 2000 });
      return;
    }

    setConversations(data || []);
  };

  const loadConversation = async (convId: string) => {
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', convId)
      .single();

    if (convError) {
      console.error("Error loading conversation:", convError);
      toast.error("خطا در بارگذاری گفتگو", { duration: 2000 });
      return;
    }

    setSelectedModel(conv.model_type as ModelType);
    setCurrentConversationId(convId);

    const { data: msgs, error: msgsError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });

    if (msgsError) {
      console.error("Error loading messages:", msgsError);
      toast.error("خطا در بارگذاری پیام‌ها", { duration: 2000 });
      return;
    }

    setMessages(msgs.map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
      imageUrl: m.image_url
    })));

    setShowHistory(false);
    toast.success("گفتگو بارگذاری شد", { duration: 2000 });
  };

  const handleClearChat = () => {
    setMessages([]);
    setSelectedModel(null);
    setCurrentConversationId(null);
    toast.success("گفتگو پاک شد", { duration: 2000 });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyMessage = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    toast.success("متن کپی شد", { duration: 1500 });
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRateMessage = async (messageIndex: number, ratingType: 'like' | 'dislike') => {
    if (!currentConversationId || !user) return;

    try {
      // Check if already rated
      const existingRating = ratedMessages.get(messageIndex);
      
      if (existingRating === ratingType) {
        // Delete rating if clicking same button again
        await supabase
          .from('message_ratings')
          .delete()
          .eq('conversation_id', currentConversationId)
          .eq('message_index', messageIndex)
          .eq('user_id', user.id);
        
        const newRatedMessages = new Map(ratedMessages);
        newRatedMessages.delete(messageIndex);
        setRatedMessages(newRatedMessages);
        toast.success("رتبه‌بندی حذف شد", { duration: 1500 });
      } else {
        // Insert or update rating
        await supabase
          .from('message_ratings')
          .upsert({
            conversation_id: currentConversationId,
            message_index: messageIndex,
            user_id: user.id,
            rating_type: ratingType
          }, {
            onConflict: 'conversation_id,message_index,user_id'
          });
        
        const newRatedMessages = new Map(ratedMessages);
        newRatedMessages.set(messageIndex, ratingType);
        setRatedMessages(newRatedMessages);
        toast.success(ratingType === 'like' ? "پاسخ مفید بود" : "بازخورد شما ثبت شد", { duration: 1500 });
      }
    } catch (error) {
      console.error("Error rating message:", error);
      toast.error("خطا در ثبت رتبه‌بندی", { duration: 2000 });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check file type and size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("حجم فایل نباید بیشتر از ۱۰ مگابایت باشد", { duration: 3000 });
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      setMessage(prev => prev + `\n[فایل: ${file.name}](${publicUrl})`);
      toast.success("فایل با موفقیت آپلود شد", { duration: 2000 });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      const errorMsg = error?.message || 'خطا در آپلود فایل';
      toast.error(errorMsg, { duration: 3000 });
    }

    // Reset input
    if (e.target) e.target.value = '';
  };

  // Model Selection Screen
  if (!selectedModel) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#4BA6FF] to-[#5E60CE] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold">نئوهوش</h1>
                <p className="text-[11px] text-muted-foreground">دستیار هوشمند شما</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted" onClick={() => navigate('/')}>
                <Home className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-lg hover:bg-muted"
                onClick={() => {
                  setShowHistory(true);
                  loadConversations();
                }}
              >
                <History className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Model Grid */}
        <div className="max-w-6xl mx-auto px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16 max-w-2xl mx-auto"
          >
            <h2 className="text-4xl font-bold mb-4 tracking-tight">یک مدل انتخاب کنید</h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              هر مدل برای نیاز خاصی طراحی شده است. مدل مناسب را انتخاب کنید تا بهترین نتیجه را بگیرید
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {models.map((model, index) => {
              const Icon = model.icon;
              return (
                <motion.button
                  key={model.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  onClick={() => handleModelSelect(model.id)}
                  className="group relative p-8 rounded-2xl border border-border/60 bg-card hover:bg-accent/30 hover:border-primary/40 transition-all duration-300 text-right hover:shadow-lg hover:-translate-y-1"
                >
                  <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${model.gradient} mb-5`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{model.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{model.description}</p>
                  <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Recent Conversations */}
          {conversations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="border-t border-border/40 pt-16"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-bold mb-1 flex items-center gap-2.5">
                    <History className="w-5 h-5 text-muted-foreground" />
                    گفتگوهای اخیر
                  </h3>
                  <p className="text-sm text-muted-foreground">به گفتگوهای قبلی خود برگردید</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHistory(true)}
                  className="text-xs h-9 px-4 hover:bg-muted rounded-lg"
                >
                  مشاهده همه
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {conversations.slice(0, 6).map((conv) => (
                  <motion.button
                    key={conv.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => loadConversation(conv.id)}
                    className="p-5 rounded-xl border border-border/50 bg-card hover:bg-accent/20 hover:border-primary/40 transition-all text-right group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h4 className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2 flex-1 leading-relaxed">
                        {conv.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">
                        {new Date(conv.updated_at).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Bot className="w-3.5 h-3.5" />
                      <span>{models.find(m => m.id === conv.model_type)?.name}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Chat Screen
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#4BA6FF] to-[#5E60CE] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold">نئوهوش</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <p className="text-[11px] text-muted-foreground">آنلاین</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted" onClick={() => navigate('/')}>
              <Home className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-lg hover:bg-muted"
              onClick={() => {
                setShowHistory(true);
                loadConversations();
              }}
            >
              <History className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Action Strip */}
        <div className="max-w-4xl mx-auto px-6 pb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="h-8 px-3 text-xs hover:bg-muted rounded-lg"
            >
              <Trash2 className="w-3.5 h-3.5 ml-1.5" />
              پاک کردن
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/voice-call')}
              className="h-8 px-3 text-xs hover:bg-muted rounded-lg"
            >
              <Phone className="w-3.5 h-3.5 ml-1.5" />
              تماس صوتی
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewChat}
              className="h-8 px-3 text-xs hover:bg-muted rounded-lg"
            >
              <Sparkles className="w-3.5 h-3.5 ml-1.5" />
              گفتگوی جدید
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <Avatar className="w-8 h-8 ml-3 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-[#4BA6FF] to-[#5E60CE] rounded-lg">
                      <Bot className="w-4 h-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[#4BA6FF] to-[#5E60CE] text-white shadow-md'
                      : 'bg-muted/40 border border-border/40'
                  }`}
                >
                  {msg.imageUrl ? (
                    <img src={msg.imageUrl} alt="Generated" className="rounded-xl w-full mb-2" />
                  ) : null}
                  <div className={`prose prose-sm max-w-none leading-relaxed ${msg.role === 'user' ? 'prose-invert [&_*]:text-white' : '[&_*]:text-foreground'} [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2.5 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:leading-7 [&_p]:mb-3 [&_ul]:my-3 [&_ul]:space-y-1.5 [&_ol]:my-3 [&_ol]:space-y-1.5 [&_li]:leading-7 [&_table]:border-collapse [&_table]:w-full [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted/50 [&_th]:font-semibold [&_th]:text-xs [&_td]:border [&_td]:border-border [&_td]:p-2 [&_td]:text-sm [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-4`}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: ({ node, className, children, ...props }) => {
                          const isInline = !className;
                          const language = className?.replace('language-', '') || '';
                          
                          if (isInline) {
                            return (
                              <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[13px] font-mono" dir="ltr" {...props}>
                                {children}
                              </code>
                            );
                          }
                          return (
                            <code className="font-mono text-[13px] leading-6" dir="ltr" {...props}>
                              {children}
                            </code>
                          );
                        },
                        pre: ({ children, node }) => {
                          // Extract language from code element
                          const codeElement = (children as any)?.props;
                          const className = codeElement?.className || '';
                          const language = className.replace('language-', '') || 'code';
                          const codeContent = String(codeElement?.children || '');
                          const blockId = `code-${index}-${codeContent.slice(0, 20)}`;
                          
                          return (
                            <div className="relative group my-5 rounded-xl overflow-hidden border border-border/50 shadow-sm" dir="ltr">
                              {/* Header */}
                              <div className="flex items-center justify-between px-4 py-2.5 bg-[#2d2d2d] dark:bg-[#1a1a1a] border-b border-white/5">
                                <div className="flex items-center gap-2">
                                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">{language}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCopyCode(codeContent, blockId)}
                                  className="h-7 px-2.5 text-xs text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                                >
                                  {copiedCodeBlock === blockId ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 ml-1.5 text-emerald-400" />
                                      <span className="text-emerald-400">کپی شد</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5 ml-1.5" />
                                      کپی کد
                                    </>
                                  )}
                                </Button>
                              </div>
                              {/* Code Content */}
                              <pre 
                                className="bg-[#1e1e1e] dark:bg-[#0d0d0d] text-[#d4d4d4] p-4 overflow-x-auto m-0"
                                style={{ textAlign: 'left' }}
                              >
                                {children}
                              </pre>
                            </div>
                          );
                        },
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                  {msg.role === 'assistant' && msg.content && !isLoading && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/20">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRateMessage(index, 'like')}
                        className={`h-7 px-2 text-xs hover:bg-muted rounded-md ${
                          ratedMessages.get(index) === 'like' ? 'text-green-600 bg-green-50 dark:bg-green-950' : ''
                        }`}
                      >
                        <ThumbsUp className={`w-3 h-3 ml-1 ${ratedMessages.get(index) === 'like' ? 'fill-current' : ''}`} />
                        مفید
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRateMessage(index, 'dislike')}
                        className={`h-7 px-2 text-xs hover:bg-muted rounded-md ${
                          ratedMessages.get(index) === 'dislike' ? 'text-red-600 bg-red-50 dark:bg-red-950' : ''
                        }`}
                      >
                        <ThumbsDown className={`w-3 h-3 ml-1 ${ratedMessages.get(index) === 'dislike' ? 'fill-current' : ''}`} />
                        غیرمفید
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyMessage(msg.content, index)}
                        className="h-7 px-2 text-xs hover:bg-muted rounded-md"
                      >
                        {copiedIndex === index ? (
                          <>
                            <Check className="w-3 h-3 ml-1" />
                            کپی شد
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 ml-1" />
                            کپی متن
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3"
            >
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-[#4BA6FF] to-[#5E60CE] rounded-lg">
                  <Bot className="w-4 h-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted/40 rounded-2xl px-4 py-3 border border-border/40">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-primary/60 rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar */}
      <div className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sticky bottom-0">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <div className="relative flex items-end gap-2 p-2 rounded-2xl bg-muted/30 border border-border/40 shadow-sm hover:border-border/60 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 flex-shrink-0 rounded-lg hover:bg-muted"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            <VoiceRecorder
              onTranscript={(text) => {
                setMessage(text);
                textareaRef.current?.focus();
              }}
            />

            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="پیام خود را بنویسید..."
              className="flex-1 min-h-[40px] max-h-32 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm px-2 placeholder:text-muted-foreground/60"
              rows={1}
            />

            {isLoading ? (
              <Button
                onClick={handleStopGeneration}
                size="icon"
                className="h-9 w-9 bg-red-500 hover:bg-red-600 flex-shrink-0 rounded-lg shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                disabled={!message.trim()}
                size="icon"
                className="h-9 w-9 bg-gradient-to-br from-[#4BA6FF] to-[#5E60CE] hover:opacity-90 flex-shrink-0 disabled:opacity-50 rounded-lg shadow-sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* History Sheet */}
      <Sheet open={showHistory} onOpenChange={setShowHistory}>
        <SheetContent side="right" className="w-[90vw] sm:w-[420px] p-0 [&>button]:hidden">
          <div className="h-full flex flex-col">
            <SheetHeader className="px-6 pt-6 pb-5 border-b border-border/40">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(false)}
                  className="h-9 w-9 rounded-lg hover:bg-muted -mr-2"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
                <div className="flex-1 text-right">
                  <SheetTitle className="text-xl font-bold flex items-center gap-2.5 justify-end">
                    تاریخچه گفتگوها
                    <History className="w-5 h-5 text-muted-foreground" />
                  </SheetTitle>
                  <p className="text-sm text-muted-foreground mt-1">بازگشت به گفتگوهای قبلی</p>
                </div>
              </div>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-3">
                {conversations.length === 0 ? (
                  <div className="text-center py-20 text-muted-foreground">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <History className="w-8 h-8 opacity-30" />
                    </div>
                    <p className="text-sm font-medium">هنوز گفتگویی ثبت نشده</p>
                    <p className="text-xs mt-1">گفتگوهای شما در اینجا ذخیره می‌شوند</p>
                  </div>
                ) : (
                  conversations.map((conv, index) => {
                    const isActive = conv.id === currentConversationId;
                    return (
                      <motion.button
                        key={conv.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => loadConversation(conv.id)}
                        className={`w-full p-4 rounded-xl border transition-all text-right group ${
                          isActive 
                            ? 'border-primary/60 bg-primary/5 shadow-sm' 
                            : 'border-border/40 bg-card hover:bg-accent/20 hover:border-primary/30 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <h3 className={`font-semibold text-sm line-clamp-2 flex-1 leading-relaxed transition-colors ${
                            isActive ? 'text-primary' : 'group-hover:text-foreground'
                          }`}>
                            {conv.title}
                          </h3>
                          <span className="text-[11px] text-muted-foreground whitespace-nowrap mt-0.5 font-medium">
                            {new Date(conv.updated_at).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center ${
                            isActive ? 'bg-primary/10' : 'bg-muted/50'
                          }`}>
                            <Bot className="w-3 h-3" />
                          </div>
                          <span className="font-medium">{models.find(m => m.id === conv.model_type)?.name}</span>
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Chat;