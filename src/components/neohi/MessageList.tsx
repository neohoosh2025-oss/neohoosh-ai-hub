import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Check, CheckCheck } from "lucide-react";

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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-muted-foreground">Loading messages...</div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4 pb-4">
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
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                  delay: index * 0.02,
                }}
                className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className="w-8 h-8 shrink-0">
                  {showAvatar && message.sender && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Avatar className="h-8 w-8 ring-2 ring-primary/10">
                        <AvatarImage src={message.sender.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {message.sender.display_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                  {!isOwn && message.sender && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-muted-foreground mb-1 px-2"
                    >
                      {message.sender.display_name}
                    </motion.span>
                  )}
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className={`rounded-2xl px-4 py-2 ${
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    }`}
                  >
                    {message.media_url && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="mb-2"
                      >
                        {message.message_type === "image" && (
                          <img
                            src={message.media_url}
                            alt="Shared"
                            className="rounded-lg max-w-xs"
                          />
                        )}
                        {message.message_type === "video" && (
                          <video
                            src={message.media_url}
                            controls
                            className="rounded-lg max-w-xs"
                          />
                        )}
                        {message.message_type === "voice" && (
                          <audio src={message.media_url} controls className="w-full" />
                        )}
                      </motion.div>
                    )}
                    
                    {message.content && (
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    )}
                    
                    <div className={`flex items-center gap-1 mt-1 text-xs ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      <span>
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </span>
                      {isOwn && (
                      <div className="mr-1">
                        {message.is_edited ? (
                          <span className="text-xs">(edited)</span>
                        ) : (
                          <CheckCheck className="h-3 w-3" />
                        )}
                      </div>
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
    </ScrollArea>
  );
}
