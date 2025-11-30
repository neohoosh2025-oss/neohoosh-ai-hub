import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Briefcase, User as UserIcon, MessageSquare, Megaphone, ImageIcon, 
  Send, Trash2, Paperclip, Sparkles, Phone, Settings, Bot
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
  ];

  const [user, setUser] = useState<any>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
    
    // Create new conversation
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        model_type: modelId,
        title: `گفتگو با ${models.find(m => m.id === modelId)?.name}`
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

  const handleSend = async () => {
    if (!message.trim() || !selectedModel || !currentConversationId) return;

    const userMessage: Message = { role: "user", content: message };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      // Save user message
      await supabase.from('messages').insert({
        conversation_id: currentConversationId,
        role: 'user',
        content: message
      });

      // Call AI
      const { data: functionData, error: functionError } = await supabase.functions.invoke('chat', {
        body: { 
          message: message,
          modelType: selectedModel,
          conversationId: currentConversationId
        }
      });

      if (functionError) throw functionError;

      const aiResponse: Message = {
        role: "assistant",
        content: functionData.response,
        imageUrl: functionData.imageUrl
      };

      setMessages(prev => [...prev, aiResponse]);

      // Save AI message
      await supabase.from('messages').insert({
        conversation_id: currentConversationId,
        role: 'assistant',
        content: functionData.response,
        image_url: functionData.imageUrl
      });

    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error("خطا در ارسال پیام", { duration: 2000 });
    } finally {
      setIsLoading(false);
    }
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

  // Model Selection Screen
  if (!selectedModel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/98 to-primary/5">
        {/* Header */}
        <div className="border-b border-border/30 bg-background/80 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4BA6FF] to-[#5E60CE] flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold">نئوهوش</h1>
                <p className="text-xs text-muted-foreground">✨ آماده‌ام کمکت کنم</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Model Grid */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-3">با کدوم مدل میخوای شروع کنی؟</h2>
            <p className="text-muted-foreground text-lg">یه مدل انتخاب کن تا چت رو شروع کنیم</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {models.map((model, index) => {
              const Icon = model.icon;
              return (
                <motion.button
                  key={model.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleModelSelect(model.id)}
                  className="group relative p-6 rounded-2xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300 text-right hover:shadow-xl"
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${model.gradient} mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{model.name}</h3>
                  <p className="text-sm text-muted-foreground">{model.description}</p>
                  <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Chat Screen
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4BA6FF] to-[#5E60CE] flex items-center justify-center shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold">نئوهوش</h1>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-xs text-muted-foreground">آنلاین</p>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Action Strip */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-3">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearChat}
              className="rounded-full h-8 px-3 text-xs hover:bg-primary/10"
            >
              <Trash2 className="w-3.5 h-3.5 ml-1.5" />
              پاک کردن
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/voice-call')}
              className="rounded-full h-8 px-3 text-xs hover:bg-primary/10"
            >
              <Phone className="w-3.5 h-3.5 ml-1.5" />
              تماس صوتی
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedModel(null)}
              className="rounded-full h-8 px-3 text-xs hover:bg-primary/10"
            >
              <Sparkles className="w-3.5 h-3.5 ml-1.5" />
              تغییر مدل
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <Avatar className="w-8 h-8 ml-3 mt-1 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-[#4BA6FF] to-[#5E60CE]">
                      <Bot className="w-4 h-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[#4BA6FF] to-[#5E60CE] text-white shadow-lg'
                      : 'bg-muted/50 border border-border/50'
                  }`}
                >
                  {msg.imageUrl ? (
                    <img src={msg.imageUrl} alt="Generated" className="rounded-xl w-full mb-2" />
                  ) : null}
                  <div className={`prose prose-sm max-w-none ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
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
                <AvatarFallback className="bg-gradient-to-br from-[#4BA6FF] to-[#5E60CE]">
                  <Bot className="w-4 h-4 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted/50 rounded-2xl px-4 py-3 border border-border/50">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-primary rounded-full"
                      animate={{ y: [0, -8, 0] }}
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
      <div className="border-t border-border/30 bg-background/80 backdrop-blur-md sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="relative flex items-end gap-2 p-2 rounded-3xl bg-muted/50 border border-border/50 shadow-sm hover:shadow-md transition-shadow">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-9 w-9 flex-shrink-0"
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
              className="flex-1 min-h-[40px] max-h-32 resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm px-2"
              rows={1}
            />

            <Button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              size="icon"
              className="rounded-full h-9 w-9 bg-gradient-to-br from-[#4BA6FF] to-[#5E60CE] hover:opacity-90 flex-shrink-0 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;