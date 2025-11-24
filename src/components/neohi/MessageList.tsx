import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCheck } from "lucide-react";

interface MessageListProps {
  messages: any[];
  loading: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setCurrentUserId(user.id);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[hsl(var(--neohi-bg-chat))]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-3 border-[hsl(var(--neohi-accent))] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-[hsl(var(--neohi-bg-chat))]" style={{ scrollBehavior: 'smooth' }}>
      <div className="flex flex-col px-3 py-3 min-h-full">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const isOwn = message.sender_id === currentUserId;
            const showAvatar = !isOwn && (
              index === messages.length - 1 ||
              messages[index + 1]?.sender_id !== message.sender_id
            );

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
                className={`flex items-end gap-1.5 mb-1 ${isOwn ? "flex-row-reverse ml-auto" : "flex-row mr-auto"}`}
              >
                {/* Avatar */}
                <div className="w-8 h-8 flex-shrink-0">
                  {showAvatar && message.sender && (
                    <Avatar className="h-8 w-8 ring-1 ring-[hsl(var(--neohi-border))]">
                      <AvatarImage src={message.sender.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--neohi-accent))] to-primary text-white text-[11px] font-medium">
                        {message.sender.display_name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                {/* Message Bubble (Telegram Style) */}
                <div className={`flex flex-col max-w-[70%] sm:max-w-[65%] ${isOwn ? "items-end" : "items-start"}`}>
                  {!isOwn && message.sender && showAvatar && (
                    <span className="text-[12px] text-[hsl(var(--neohi-text-secondary))] mb-1 px-3 font-medium">
                      {message.sender.display_name}
                    </span>
                  )}
                  
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`rounded-[12px] px-3 py-1.5 shadow-sm ${
                      isOwn
                        ? "bg-[hsl(var(--neohi-bubble-user))] text-[hsl(var(--neohi-text-primary))] rounded-br-none"
                        : "bg-[hsl(var(--neohi-bubble-other))] text-[hsl(var(--neohi-text-primary))] rounded-bl-none border border-[hsl(var(--neohi-border))]"
                    }`}
                  >
                    {message.media_url && (
                      <div className="mb-2">
                        {message.message_type === "image" && (
                          <img
                            src={message.media_url}
                            alt="Shared"
                            className="rounded-xl max-w-[280px] border border-[hsl(var(--neohi-border))]"
                          />
                        )}
                        {message.message_type === "video" && (
                          <video
                            src={message.media_url}
                            controls
                            className="rounded-xl max-w-[280px] border border-[hsl(var(--neohi-border))]"
                          />
                        )}
                        {message.message_type === "voice" && (
                          <audio src={message.media_url} controls className="w-full" />
                        )}
                      </div>
                    )}
                    
                    {message.content && (
                      <p className="text-[15px] leading-[1.4] whitespace-pre-wrap break-words mb-0.5">
                        {message.content}
                      </p>
                    )}
                    
                    <div className={`flex items-center gap-1 mt-0.5 text-[11px] ${
                      isOwn ? "justify-end text-[hsl(var(--neohi-text-secondary))]/80" : "justify-end text-[hsl(var(--neohi-text-secondary))]/70"
                    }`}>
                      <span className="leading-none">{formatTime(message.created_at)}</span>
                      {isOwn && (
                        <CheckCheck className="h-3.5 w-3.5 text-[hsl(var(--neohi-status-read))]" />
                      )}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>
    </div>
  );
}
