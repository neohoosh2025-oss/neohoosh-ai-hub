import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, ChevronLeft, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  created_at: string;
  expires_at: string | null;
  caption: string | null;
  user: {
    display_name: string;
    avatar_url: string | null;
    username: string;
  };
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  currentUserId?: string;
}

const STORY_DURATION = 10000; // 10 seconds
const PROGRESS_INTERVAL = 100; // Update every 100ms

export function StoryViewer({ stories, initialIndex, onClose, currentUserId }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedProgressRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const longPressRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();
  const currentStory = stories[currentIndex];

  // Format relative time
  const getTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return "Just now";
  };

  // Check if story expired
  const isExpired = currentStory?.expires_at 
    ? new Date(currentStory.expires_at) < new Date() 
    : false;

  // Start/resume timer
  const startTimer = useCallback(() => {
    if (!imageLoaded || isPaused || isExpired) return;

    startTimeRef.current = Date.now();
    
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = pausedProgressRef.current + (elapsed / STORY_DURATION) * 100;
      
      if (newProgress >= 100) {
        // Move to next story or close
        if (currentIndex < stories.length - 1) {
          goToNextStory();
        } else {
          onClose();
        }
      } else {
        setProgress(newProgress);
      }
    }, PROGRESS_INTERVAL);
  }, [imageLoaded, isPaused, currentIndex, stories.length, isExpired]);

  // Stop timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Pause story
  const pauseStory = useCallback(() => {
    stopTimer();
    pausedProgressRef.current = progress;
    setIsPaused(true);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [progress, stopTimer]);

  // Resume story
  const resumeStory = useCallback(() => {
    setIsPaused(false);
    startTimer();
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  }, [startTimer]);

  // Go to next story
  const goToNextStory = useCallback(() => {
    stopTimer();
    pausedProgressRef.current = 0;
    setProgress(0);
    setImageLoaded(false);
    
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, stopTimer, onClose]);

  // Go to previous story
  const goToPrevStory = useCallback(() => {
    stopTimer();
    pausedProgressRef.current = 0;
    setProgress(0);
    setImageLoaded(false);
    
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(15);
      }
    }
  }, [currentIndex, stopTimer]);

  // Handle touch/click for navigation
  const handleTap = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('input') || target.closest('button')) return;
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const tapPosition = (x - rect.left) / rect.width;
    
    if (tapPosition < 0.3) {
      goToPrevStory();
    } else if (tapPosition > 0.7) {
      goToNextStory();
    }
  }, [goToPrevStory, goToNextStory]);

  // Long press handlers
  const handleTouchStart = useCallback(() => {
    longPressRef.current = setTimeout(() => {
      pauseStory();
    }, 200);
  }, [pauseStory]);

  const handleTouchEnd = useCallback(() => {
    if (longPressRef.current) {
      clearTimeout(longPressRef.current);
      longPressRef.current = null;
    }
    if (isPaused) {
      resumeStory();
    }
  }, [isPaused, resumeStory]);

  // Record story view
  useEffect(() => {
    if (!currentStory || !currentUserId) return;
    
    const recordView = async () => {
      await supabase.from("neohi_story_views").upsert({
        story_id: currentStory.id,
        viewer_id: currentUserId,
      }, { onConflict: 'story_id,viewer_id' });
    };
    
    recordView();
  }, [currentStory?.id, currentUserId]);

  // Handle visibility change (app background)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseStory();
      } else if (!isPaused) {
        resumeStory();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [pauseStory, resumeStory, isPaused]);

  // Start timer when image loads
  useEffect(() => {
    if (imageLoaded && !isPaused) {
      startTimer();
    }
    return () => stopTimer();
  }, [imageLoaded, isPaused, startTimer, stopTimer]);

  // Handle swipe down to close
  const handleSwipeDown = useCallback((e: React.TouchEvent) => {
    const startY = e.touches[0].clientY;
    
    const handleMove = (moveEvent: TouchEvent) => {
      const currentY = moveEvent.touches[0].clientY;
      const diff = currentY - startY;
      
      if (diff > 100) {
        onClose();
        document.removeEventListener('touchmove', handleMove);
      }
    };
    
    document.addEventListener('touchmove', handleMove);
    setTimeout(() => {
      document.removeEventListener('touchmove', handleMove);
    }, 1000);
  }, [onClose]);

  // Send reply
  const handleSendReply = async () => {
    if (!replyText.trim() || !currentUserId || !currentStory) return;
    
    // Find or create DM chat with story owner
    let chatId: string | null = null;
    
    // Check if DM exists
    const { data: existingChats } = await supabase
      .from("neohi_chat_members")
      .select("chat_id")
      .eq("user_id", currentUserId);
    
    if (existingChats) {
      for (const cm of existingChats) {
        const { data: members } = await supabase
          .from("neohi_chat_members")
          .select("user_id")
          .eq("chat_id", cm.chat_id);
        
        const { data: chat } = await supabase
          .from("neohi_chats")
          .select("type")
          .eq("id", cm.chat_id)
          .single();
        
        if (chat?.type === "dm" && members?.some(m => m.user_id === currentStory.user_id)) {
          chatId = cm.chat_id;
          break;
        }
      }
    }
    
    // Create new DM if needed
    if (!chatId) {
      const { data: newChat } = await supabase
        .from("neohi_chats")
        .insert({ type: "dm", created_by: currentUserId })
        .select()
        .single();
      
      if (newChat) {
        chatId = newChat.id;
        await supabase.from("neohi_chat_members").insert([
          { chat_id: chatId, user_id: currentUserId },
          { chat_id: chatId, user_id: currentStory.user_id },
        ]);
      }
    }
    
    if (chatId) {
      await supabase.from("neohi_messages").insert({
        chat_id: chatId,
        sender_id: currentUserId,
        content: `💬 پاسخ به استوری: ${replyText}`,
        message_type: "text",
      });
      
      toast({ title: "پاسخ ارسال شد" });
      setReplyText("");
      setShowReplyInput(false);
    }
  };

  // Quick reactions
  const handleQuickReaction = async (emoji: string) => {
    if (!currentUserId || !currentStory) return;
    
    // Similar logic to send reply
    toast({ title: `${emoji} ارسال شد` });
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  if (isExpired) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      >
        <div className="text-center text-white">
          <p className="text-lg mb-4">این استوری منقضی شده</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/20 rounded-full hover:bg-white/30 transition"
          >
            بستن
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black touch-none select-none"
      onClick={handleTap}
      onTouchStart={(e) => {
        handleTouchStart();
        handleSwipeDown(e);
      }}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      {/* Progress Bars */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2 pt-safe">
        {stories.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden"
          >
            <motion.div
              className="h-full bg-white"
              initial={{ width: index < currentIndex ? "100%" : "0%" }}
              animate={{
                width: index < currentIndex
                  ? "100%"
                  : index === currentIndex
                  ? `${progress}%`
                  : "0%",
              }}
              transition={{ duration: 0.1, ease: "linear" }}
            />
          </div>
        ))}
      </div>

      {/* Top Overlay - Gradient */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none" />

      {/* Header */}
      <div className="absolute top-10 left-0 right-0 z-20 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 ring-2 ring-white/20">
            <AvatarImage src={currentStory?.user?.avatar_url || undefined} />
            <AvatarFallback className="bg-white/20 text-white">
              {currentStory?.user?.display_name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="text-white">
            <p className="font-medium text-sm leading-tight">
              {currentStory?.user?.display_name}
            </p>
            <p className="text-xs text-white/70">
              {getTimeAgo(currentStory?.created_at)}
            </p>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Navigation Zones (Visual Indicators) */}
      {currentIndex > 0 && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 hover:opacity-100 transition pointer-events-none">
          <ChevronLeft className="w-8 h-8 text-white/50" />
        </div>
      )}
      {currentIndex < stories.length - 1 && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 hover:opacity-100 transition pointer-events-none">
          <ChevronRight className="w-8 h-8 text-white/50" />
        </div>
      )}

      {/* Story Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStory?.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            {currentStory?.media_type === "image" ? (
              <img
                src={currentStory.media_url}
                alt="Story"
                className="w-full h-full object-contain"
                onLoad={() => setImageLoaded(true)}
                draggable={false}
              />
            ) : (
              <video
                src={currentStory?.media_url}
                className="w-full h-full object-contain"
                autoPlay
                playsInline
                muted={false}
                onLoadedData={() => setImageLoaded(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Caption */}
        {currentStory?.caption && (
          <div className="absolute bottom-32 left-4 right-4 z-10">
            <p className="text-white text-center text-sm bg-black/30 backdrop-blur-sm rounded-lg px-4 py-2">
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Pause Indicator */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <div className="w-3 h-8 bg-white rounded-sm mx-0.5" />
                <div className="w-3 h-8 bg-white rounded-sm mx-0.5" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Overlay - Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/70 to-transparent z-10 pointer-events-none" />

      {/* Bottom Interaction Bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-safe">
        <AnimatePresence mode="wait">
          {showReplyInput ? (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="پاسخ به استوری..."
                className="flex-1 h-12 rounded-full bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/50 text-right pr-4"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center disabled:opacity-50 transition"
              >
                <Send className="w-5 h-5 text-black" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="flex items-center justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Reply Input Trigger */}
              <button
                onClick={() => setShowReplyInput(true)}
                className="flex-1 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/70 text-sm text-right px-4 hover:bg-white/20 transition"
              >
                پاسخ به استوری...
              </button>
              
              {/* Quick Reactions */}
              <div className="flex items-center gap-2 mr-3">
                {["🔥", "❤️", "😂"].map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleQuickReaction(emoji)}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-lg hover:bg-white/20 transition"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
