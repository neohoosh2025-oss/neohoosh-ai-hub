import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Briefcase, User as UserIcon, MessageSquare, Megaphone, ImageIcon, 
  Send, Trash2, Paperclip, Sparkles, Phone, History, Bot, GraduationCap, Copy, Check, ChevronRight, ChevronLeft, ThumbsUp, ThumbsDown, Square, UserCircle, LogIn, Plus, ChevronDown, FileText, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CodeBlock, InlineCode } from "@/components/CodeBlock";
import { showNotification, getNotificationPermission } from "@/utils/pushNotifications";
import { compressImage, formatFileSize } from "@/utils/imageCompression";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProfileDrawer } from "@/components/chat/ProfileDrawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { useOnboarding } from "@/hooks/useOnboarding";

type ModelType = "business" | "personal" | "general" | "ads" | "academic";

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

const GUEST_QUESTION_LIMIT = 4;
const GUEST_QUESTIONS_KEY = 'neohoosh_guest_questions';

// Long-press copy for user messages
interface UserMessageActionsProps {
  content: string;
  index: number;
  copiedIndex: number | null;
  onCopy: (content: string, index: number) => void;
}

const UserMessageActions = ({ content, index, copiedIndex, onCopy }: UserMessageActionsProps) => {
  const [showCopy, setShowCopy] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowCopy(true);
    }, 500); // 500ms long press
  };
  
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };
  
  const handleCopy = () => {
    onCopy(content, index);
    setTimeout(() => setShowCopy(false), 1500);
  };
  
  return (
    <div
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <AnimatePresence>
        {showCopy && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            className="absolute left-0 bottom-full mb-2 z-10"
          >
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-lg bg-background/95 backdrop-blur-sm border border-border shadow-lg text-foreground hover:bg-muted transition-all"
            >
              {copiedIndex === index ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">کپی شد</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>کپی متن</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Chat = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { showOnboarding, completeOnboarding } = useOnboarding();
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
      id: "academic",
      name: "مدل درسی و تحصیلی",
      description: "کمک در درس و تحصیل",
      icon: GraduationCap,
      gradient: "from-green-500 to-teal-500"
    },
  ];

  const [user, setUser] = useState<any>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelType>("general");
  const [showModelSelector, setShowModelSelector] = useState(false);
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
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showContextLimitDialog, setShowContextLimitDialog] = useState(false);
  const [guestQuestionCount, setGuestQuestionCount] = useState(() => {
    const saved = localStorage.getItem(GUEST_QUESTIONS_KEY);
    return saved ? parseInt(saved, 10) : 0;
  });
  const [summarizingIndex, setSummarizingIndex] = useState<number | null>(null);
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
    if (user) {
      loadConversations();
    }
  }, [user]);

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
    if (session) {
      setUser(session.user);
      
      // Fetch avatar
      const avatarFromMeta = session.user.user_metadata?.avatar_url;
      if (avatarFromMeta) {
        setUserAvatarUrl(avatarFromMeta);
      } else {
        const { data: neohiUser } = await supabase
          .from('neohi_users')
          .select('avatar_url')
          .eq('id', session.user.id)
          .single();
        if (neohiUser?.avatar_url) {
          setUserAvatarUrl(neohiUser.avatar_url);
        }
      }
    }
    // Don't redirect - allow guest usage
  };

  const handleModelSelect = (modelId: ModelType) => {
    setSelectedModel(modelId);
    setShowModelSelector(false);
  };

  const initializeConversation = async () => {
    if (!currentConversationId || currentConversationId.startsWith('guest-')) {
      if (user) {
        const { data: convData, error: convError } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            model_type: selectedModel,
            title: 'گفتگوی جدید'
          })
          .select()
          .single();

        if (convError) {
          console.error("Error creating conversation:", convError);
          return null;
        }
        setCurrentConversationId(convData.id);
        return convData.id;
      } else {
        const guestId = 'guest-' + Date.now();
        setCurrentConversationId(guestId);
        return guestId;
      }
    }
    return currentConversationId;
  };

  const handleNewChat = () => {
    setMessages([]);
    setSelectedModel(null);
    setCurrentConversationId(null);
  };

  const handleSend = async () => {
    if (!message.trim() || !selectedModel) return;
    
    // Check guest question limit
    if (!user) {
      if (guestQuestionCount >= GUEST_QUESTION_LIMIT) {
        setShowLoginPrompt(true);
        return;
      }
      // Increment guest question count
      const newCount = guestQuestionCount + 1;
      setGuestQuestionCount(newCount);
      localStorage.setItem(GUEST_QUESTIONS_KEY, newCount.toString());
    }

    // Initialize conversation if needed
    const convId = await initializeConversation();
    if (!convId) {
      toast.error("خطا در ایجاد گفتگو", { duration: 2000 });
      return;
    }

    const userMessageContent = message;
    const userMessage: Message = { role: "user", content: userMessageContent };
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);
    setUserScrolled(false);

    // Create AbortController for stopping generation
    abortControllerRef.current = new AbortController();

    try {
      // Only save to DB if user is logged in
      if (user && convId && !convId.startsWith('guest-')) {
        await supabase.from('messages').insert({
          conversation_id: convId,
          role: 'user',
          content: userMessageContent
        });

        // Update conversation title based on first message
        const isFirstMessage = messages.length === 0;
        if (isFirstMessage) {
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
            .eq('id', convId);
          
          await loadConversations();
        }
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

      // Save final AI message (only for logged in users)
      if (accumulatedContent && user && convId && !convId.startsWith('guest-')) {
        await supabase.from('messages').insert({
          conversation_id: convId,
          role: 'assistant',
          content: accumulatedContent
        });

        // Send push notification if permission granted and document is hidden
        if (document.hidden && getNotificationPermission() === 'granted') {
          const previewContent = accumulatedContent.length > 100 
            ? accumulatedContent.substring(0, 100) + '...' 
            : accumulatedContent;
          showNotification('پاسخ جدید از نئوهوش', {
            body: previewContent,
            tag: 'chat-response'
          });
        }

        // Extract and save memories asynchronously (don't wait for it)
        supabase.functions.invoke('extract-memory', {
          body: { conversationId: convId }
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
        if (partialContent && user && convId && !convId.startsWith('guest-')) {
          await supabase.from('messages').insert({
            conversation_id: convId,
            role: 'assistant',
            content: partialContent
          });
        }
        return; // Don't show error for manual stop
      }
      
      // Check if it's a context limit error
      const errorMessage = error?.message || '';
      if (errorMessage.includes('context') || errorMessage.includes('token') || errorMessage.includes('limit') || 
          errorMessage.includes('too long') || errorMessage.includes('maximum')) {
        setShowContextLimitDialog(true);
        return;
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
      .select('id, title, model_type, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error loading conversations:", error);
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

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      // First delete all messages in the conversation
      await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);
      
      // Then delete the conversation
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;

      // Update local state
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      // If deleted conversation was active, reset chat
      if (conversationId === currentConversationId) {
        setMessages([]);
        setSelectedModel(null);
        setCurrentConversationId(null);
      }
      
      toast.success("گفتگو حذف شد", { duration: 2000 });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("خطا در حذف گفتگو", { duration: 2000 });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // On mobile, Enter creates new line. On desktop, Enter sends (unless Shift is pressed)
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (e.key === 'Enter') {
      if (isMobile) {
        // Mobile: always allow new line, only send via button
        return;
      }
      // Desktop: Enter sends, Shift+Enter creates new line
      if (!e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
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
        // Get the rated message and the user's question before it
        const ratedMessage = messages[messageIndex];
        const userQuestion = messageIndex > 0 ? messages[messageIndex - 1] : null;
        
        // Insert or update rating with feedback text
        const feedbackText = ratingType === 'dislike' 
          ? `پاسخ غیرمفید بود. سوال: "${userQuestion?.content?.substring(0, 100) || ''}" - پاسخ: "${ratedMessage?.content?.substring(0, 200) || ''}"`
          : `پاسخ مفید بود. سوال: "${userQuestion?.content?.substring(0, 100) || ''}"`;
        
        await supabase
          .from('message_ratings')
          .upsert({
            conversation_id: currentConversationId,
            message_index: messageIndex,
            user_id: user.id,
            rating_type: ratingType,
            feedback_text: feedbackText
          }, {
            onConflict: 'conversation_id,message_index,user_id'
          });
        
        // Save learning preference to user_memory for AI to learn
        if (ratingType === 'dislike') {
          await supabase.from('user_memory').insert({
            user_id: user.id,
            memory_type: 'feedback',
            key: `dislike_${Date.now()}`,
            value: `کاربر از این نوع پاسخ خوشش نیامد: "${ratedMessage?.content?.substring(0, 150) || ''}"`
          });
        }
        
        const newRatedMessages = new Map(ratedMessages);
        newRatedMessages.set(messageIndex, ratingType);
        setRatedMessages(newRatedMessages);
        toast.success(ratingType === 'like' ? "پاسخ مفید بود ✓" : "متوجه شدم، بهتر جواب می‌دم", { duration: 2000 });
      }
    } catch (error) {
      console.error("Error rating message:", error);
      toast.error("خطا در ثبت رتبه‌بندی", { duration: 2000 });
    }
  };

  const handleSummarize = async (messageIndex: number) => {
    const msgContent = messages[messageIndex]?.content;
    if (!msgContent || summarizingIndex !== null) return;

    setSummarizingIndex(messageIndex);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            messages: [
              { role: 'user', content: `لطفا این متن را به صورت خلاصه و مختصر بازنویسی کن (حداکثر 2-3 جمله):\n\n${msgContent}` }
            ],
            modelType: 'general'
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to summarize');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let summarizedContent = "";
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
              summarizedContent += content;
            }
          } catch (e) {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      if (summarizedContent) {
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[messageIndex] = {
            ...newMessages[messageIndex],
            content: summarizedContent
          };
          return newMessages;
        });
        toast.success("پاسخ خلاصه شد", { duration: 2000 });
      }
    } catch (error) {
      console.error("Error summarizing:", error);
      toast.error("خطا در خلاصه‌سازی", { duration: 2000 });
    } finally {
      setSummarizingIndex(null);
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

    const isImage = file.type.startsWith('image/');
    const loadingToastId = toast.loading(isImage ? "در حال فشرده‌سازی و آپلود..." : "در حال آپلود فایل...");

    try {
      // Compress image if it's an image file
      let fileToUpload = file;
      if (isImage) {
        try {
          fileToUpload = await compressImage(file);
          if (fileToUpload.size < file.size) {
            console.log(`Compression saved ${formatFileSize(file.size - fileToUpload.size)}`);
          }
        } catch (compressError) {
          console.warn('Compression failed, using original:', compressError);
          fileToUpload = file;
        }
      }

      const fileExt = isImage ? 'jpg' : file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, fileToUpload, {
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
      toast.dismiss(loadingToastId);
      toast.success(`فایل آپلود شد (${formatFileSize(fileToUpload.size)})`, { duration: 2000 });
    } catch (error: any) {
      console.error('Error uploading file:', error);
      const errorMsg = error?.message || 'خطا در آپلود فایل';
      toast.dismiss(loadingToastId);
      toast.error(errorMsg, { duration: 3000 });
    }

    // Reset input
    if (e.target) e.target.value = '';
  };


  // Chat Screen - ChatGPT Style Dark Theme
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Minimal Header - ChatGPT Style */}
      <div className="border-b border-border/40 bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: History Button (only for logged in users) */}
          {user ? (
            <button
              onClick={() => setShowHistory(true)}
              className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-muted/60 transition-colors"
            >
              <History className="w-5 h-5 text-muted-foreground" />
            </button>
          ) : (
            <div className="w-9" />
          )}
          
          {/* Center: Brand */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <h1 className="text-xl font-brand font-semibold text-foreground tracking-tight">NeoHoosh</h1>
          </div>
          
          {/* Right: Profile or Login */}
          <div className="flex items-center gap-2">
            {user ? (
              <button 
                className="h-8 w-8 rounded-full flex items-center justify-center bg-primary/20 hover:bg-primary/30 transition-all"
                onClick={() => setShowProfile(true)}
              >
                <span className="text-sm font-medium text-primary">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/auth')}
                className="h-9 px-4 rounded-xl border-border/60 hover:bg-muted/60 font-medium gap-2"
              >
                <LogIn className="w-4 h-4" />
                ورود
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Area - ChatGPT Style */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
          {/* Empty State - ChatGPT Style */}
          {messages.length === 0 && (
            <motion.div 
              className="flex flex-col items-center justify-center py-16"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-semibold text-foreground mb-2">سلام! چطور می‌تونم کمکت کنم؟</h2>
              <p className="text-muted-foreground text-sm mb-10">یک سوال بپرس یا از پیشنهادات زیر شروع کن</p>
              
              {/* Quick Actions - ChatGPT Style Grid */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  { 
                    text: "یک ایده کسب‌وکار پیشنهاد بده", 
                    icon: "💡",
                    desc: "ایده‌پردازی"
                  },
                  { 
                    text: "متنم رو ویرایش و بهتر کن", 
                    icon: "✨",
                    desc: "ویرایش متن"
                  },
                  { 
                    text: "این مفهوم رو ساده توضیح بده", 
                    icon: "📚",
                    desc: "توضیح ساده"
                  },
                  { 
                    text: "یک کد پایتون بنویس", 
                    icon: "🐍",
                    desc: "کدنویسی"
                  },
                ].map((action) => (
                  <button
                    key={action.text}
                    onClick={() => setMessage(action.text)}
                    className="group flex flex-col items-start p-4 rounded-2xl bg-card/50 border border-border/40 hover:bg-card hover:border-border/80 hover:shadow-sm transition-all text-right"
                  >
                    <span className="text-xl mb-2">{action.icon}</span>
                    <span className="text-xs text-muted-foreground mb-1">{action.desc}</span>
                    <span className="text-sm text-foreground/90 leading-relaxed">{action.text}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 ml-2 mt-1 flex-shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                
                <div
                  className={`max-w-[85%] sm:max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-muted/80 text-foreground px-4 py-3 rounded-2xl rounded-br-md'
                      : ''
                  }`}
                >
                  {msg.imageUrl ? (
                    <img src={msg.imageUrl} alt="Generated" className="rounded-xl w-full mb-2" />
                  ) : null}
                  
                  {msg.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm max-w-none leading-relaxed [&_*]:text-foreground [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_p]:leading-7 [&_p]:mb-2 [&_p]:last:mb-0 [&_ul]:my-2 [&_ul]:space-y-1 [&_ol]:my-2 [&_ol]:space-y-1 [&_li]:leading-7 [&_table]:border-collapse [&_table]:w-full [&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted/50 [&_th]:font-semibold [&_th]:text-xs [&_td]:border [&_td]:border-border [&_td]:p-2 [&_td]:text-sm [&_blockquote]:border-r-2 [&_blockquote]:border-primary [&_blockquote]:pr-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-3">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          code: ({ node, className, children, ...props }) => {
                            const isInline = !className;
                            
                            if (isInline) {
                              return <InlineCode>{children}</InlineCode>;
                            }
                            return (
                              <code className="font-mono text-[13px] leading-6" dir="ltr" {...props}>
                                {children}
                              </code>
                            );
                          },
                          pre: ({ children }) => {
                            const codeElement = (children as any)?.props;
                            const className = codeElement?.className || '';
                            const language = className.replace('language-', '') || 'text';
                            const codeContent = String(codeElement?.children || '').trim();
                            
                            return (
                              <CodeBlock 
                                code={codeContent} 
                                language={language}
                              />
                            );
                          },
                          table: ({ children }) => (
                            <div className="overflow-x-auto max-w-full my-3 rounded-lg border border-border/50">
                              <table className="min-w-full text-xs border-collapse">{children}</table>
                            </div>
                          ),
                          thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
                          tbody: ({ children }) => <tbody className="divide-y divide-border/30">{children}</tbody>,
                          tr: ({ children }) => <tr className="hover:bg-muted/30">{children}</tr>,
                          th: ({ children }) => <th className="px-2 py-1.5 text-right font-medium text-[11px] whitespace-nowrap border border-border/30">{children}</th>,
                          td: ({ children }) => <td className="px-2 py-1.5 text-[11px] whitespace-nowrap border border-border/30">{children}</td>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  
                  {/* User message - Long press to show copy */}
                  {msg.role === 'user' && msg.content && (
                    <UserMessageActions
                      content={msg.content}
                      index={index}
                      copiedIndex={copiedIndex}
                      onCopy={handleCopyMessage}
                    />
                  )}
                  
                  {/* Assistant message actions - ChatGPT Style */}
                  {msg.role === 'assistant' && msg.content && !isLoading && (
                    <div className="flex items-center gap-3 mt-4">
                      <button
                        onClick={() => handleCopyMessage(msg.content, index)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                        title="کپی"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleRateMessage(index, 'like')}
                        className={`p-2 rounded-lg transition-all ${
                          ratedMessages.get(index) === 'like' 
                            ? 'text-emerald-500 bg-emerald-500/10' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                        title="مفید بود"
                      >
                        <ThumbsUp className={`w-4 h-4 ${ratedMessages.get(index) === 'like' ? 'fill-current' : ''}`} />
                      </button>
                      
                      <button
                        onClick={() => handleRateMessage(index, 'dislike')}
                        className={`p-2 rounded-lg transition-all ${
                          ratedMessages.get(index) === 'dislike' 
                            ? 'text-rose-500 bg-rose-500/10' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                        title="غیرمفید"
                      >
                        <ThumbsDown className={`w-4 h-4 ${ratedMessages.get(index) === 'dislike' ? 'fill-current' : ''}`} />
                      </button>
                      
                      <button
                        onClick={() => handleSummarize(index)}
                        disabled={summarizingIndex === index}
                        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all disabled:opacity-50"
                        title="خلاصه"
                      >
                        {summarizingIndex === index ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && messages[messages.length - 1]?.role === 'assistant' && !messages[messages.length - 1]?.content && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2"
            >
              <div className="w-7 h-7 flex-shrink-0 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </motion.div>
              </div>
              <div className="flex items-center gap-1 py-2">
                <motion.span
                  className="w-1.5 h-1.5 bg-primary/70 rounded-full"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                />
                <motion.span
                  className="w-1.5 h-1.5 bg-primary/70 rounded-full"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                />
                <motion.span
                  className="w-1.5 h-1.5 bg-primary/70 rounded-full"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar - ChatGPT Style */}
      <div className="border-t border-border/40 bg-background sticky bottom-0">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="relative flex items-end gap-1 p-2 rounded-2xl bg-card border border-border/50">
            {/* Model Selector + Button */}
            <Popover open={showModelSelector} onOpenChange={setShowModelSelector}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 flex-shrink-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-64 p-2" 
                side="top" 
                align="start"
                sideOffset={8}
              >
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground px-2 py-1.5 font-medium">انتخاب حالت</p>
                  {models.map((model) => {
                    const Icon = model.icon;
                    const isSelected = selectedModel === model.id;
                    return (
                      <button
                        key={model.id}
                        onClick={() => handleModelSelect(model.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-right transition-all ${
                          isSelected 
                            ? 'bg-primary/10 text-primary' 
                            : 'hover:bg-muted/50 text-foreground/80'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-primary/20' : 'bg-muted/50'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-right">
                          <p className="text-sm font-medium">{model.name}</p>
                          <p className="text-xs text-muted-foreground">{model.description}</p>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
            />


            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="به چی فکر میکنی..."
              autoGrow
              className="flex-1 min-h-[40px] max-h-32 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-[14px] px-2 py-2 placeholder:text-muted-foreground/60 placeholder:text-[13px]"
              rows={1}
            />


            {isLoading ? (
              <Button
                onClick={handleStopGeneration}
                size="icon"
                className="h-10 w-10 bg-destructive hover:bg-destructive/90 flex-shrink-0 rounded-xl"
              >
                <Square className="w-4 h-4 fill-current" />
              </Button>
            ) : (
              <Button
                onClick={handleSend}
                disabled={!message.trim()}
                size="icon"
                className="h-10 w-10 bg-primary hover:bg-primary/90 flex-shrink-0 disabled:opacity-30 rounded-xl"
              >
                <Send className="w-4.5 h-4.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* History Sheet */}
      <Sheet open={showHistory} onOpenChange={setShowHistory}>
        <SheetContent side="right" className="w-[90vw] sm:w-[420px] p-0 [&>button]:hidden">
          <div className="h-full flex flex-col" dir="rtl">
            <SheetHeader className="px-6 pt-6 pb-5 border-b border-border/40">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-lg font-bold">تاریخچه گفتگوها</SheetTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(false)}
                  className="h-9 w-9 rounded-lg hover:bg-muted"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </div>
            </SheetHeader>
            
            {/* New Chat Button */}
            <div className="px-6 pt-5 pb-6">
              <Button
                onClick={() => {
                  handleNewChat();
                  setShowHistory(false);
                }}
                className="w-full h-12 rounded-2xl bg-primary/10 hover:bg-primary/20 text-primary font-medium gap-2"
                variant="ghost"
              >
                <Plus className="w-4 h-4" />
                گفتگوی جدید
              </Button>
            </div>
            
            {/* Separator with more spacing */}
            <div className="mx-6 border-t border-border/40 mb-6" />
            
            <div className="flex-1 overflow-y-auto px-6 pb-5">
              <p className="text-xs font-medium text-muted-foreground/60 mb-4">گفتگوهای قبلی</p>
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
                      <motion.div
                        key={conv.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`relative p-4 rounded-xl border transition-all group ${
                          isActive 
                            ? 'border-primary/60 bg-primary/5 shadow-sm' 
                            : 'border-border/40 bg-card hover:bg-accent/20 hover:border-primary/30 hover:shadow-sm'
                        }`}
                      >
                        <button
                          onClick={() => loadConversation(conv.id)}
                          className="w-full text-right"
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
                        </button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.id);
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Profile Drawer */}
      <ProfileDrawer 
        open={showProfile} 
        onOpenChange={setShowProfile}
        user={user}
      />

      {/* Login Prompt Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <motion.div 
              className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
            <DialogTitle className="text-xl font-semibold text-center">
              برای ادامه وارد شوید ✨
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground leading-relaxed mt-2">
              شما {GUEST_QUESTION_LIMIT} سوال رایگان پرسیدید!
              <br />
              برای پاسخگویی دقیق‌تر و بهتر، لطفاً وارد حساب کاربری شوید.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <Button 
              onClick={() => navigate('/auth')} 
              className="w-full h-12 rounded-xl font-medium gap-2"
            >
              <LogIn className="w-4 h-4" />
              ورود / ثبت‌نام
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setShowLoginPrompt(false)}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              بعداً
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Context Limit Dialog */}
      <Dialog open={showContextLimitDialog} onOpenChange={setShowContextLimitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <motion.div 
              className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              <motion.span 
                className="text-4xl"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                📝
              </motion.span>
            </motion.div>
            <DialogTitle className="text-xl font-bold text-center">
              گفتگو خیلی طولانی شده!
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground leading-relaxed mt-3">
              این مکالمه به حداکثر طول مجاز رسیده.
              <br />
              <span className="text-foreground/80 font-medium">آیا می‌خواهی در یک گفتگوی جدید ادامه بدی؟</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-5">
            <Button 
              onClick={() => {
                setShowContextLimitDialog(false);
                handleNewChat();
                toast.success("گفتگوی جدید شروع شد", { duration: 2000 });
              }} 
              className="w-full h-12 rounded-2xl font-medium gap-2 bg-gradient-to-r from-primary to-primary/80"
            >
              <Plus className="w-4 h-4" />
              بله، گفتگوی جدید
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowContextLimitDialog(false)}
              className="w-full h-11 rounded-2xl text-muted-foreground hover:text-foreground border-border/50"
            >
              فعلاً نه، همینجا می‌مونم
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour onComplete={completeOnboarding} />
      )}
    </div>
  );
};

export default Chat;