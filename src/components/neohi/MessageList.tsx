import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCheck, MoreVertical, Trash2, Trash } from "lucide-react";
import { AudioPlayer } from "./AudioPlayer";
import { VideoPlayer } from "./VideoPlayer";
import { FileMessage } from "./FileMessage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MessageListProps {
  messages: any[];
  loading: boolean;
}

export function MessageList({ messages, loading }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      
      // Fetch current user's profile
      const { data: profile } = await supabase
        .from("neohi_users")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setCurrentUser(profile);
      }
    }
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

  const handleDeleteForMe = async (messageId: string) => {
    if (!currentUserId) return;

    const { error } = await supabase
      .from("neohi_message_deletions")
      .insert({
        message_id: messageId,
        user_id: currentUserId,
      });

    if (error) {
      toast.error("خطا در حذف پیام");
      console.error(error);
    } else {
      toast.success("پیام حذف شد");
    }
  };

  const handleDeleteForEveryone = async (messageId: string) => {
    const { error } = await supabase
      .from("neohi_messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      toast.error("خطا در حذف پیام");
      console.error(error);
    } else {
      toast.success("پیام برای همه حذف شد");
    }
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
    <div className="h-full overflow-y-auto bg-[hsl(var(--neohi-bg-chat))]" style={{ scrollBehavior: 'smooth' }}>
      <div className="flex flex-col px-3 py-3">
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
                className={`flex items-end gap-2 mb-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className="w-8 h-8 flex-shrink-0">
                  {/* Show avatar for other users when it's the last message in sequence */}
                  {!isOwn && showAvatar && message.sender && (
                    <Avatar className="h-8 w-8 ring-1 ring-[hsl(var(--neohi-border))]">
                      <AvatarImage src={message.sender.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--neohi-accent))] to-primary text-white text-[11px] font-medium">
                        {message.sender.display_name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  {/* Show avatar for own messages */}
                  {isOwn && currentUser && (
                    <Avatar className="h-8 w-8 ring-1 ring-[hsl(var(--neohi-border))]">
                      <AvatarImage src={currentUser.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-[hsl(var(--neohi-accent))] to-primary text-white text-[11px] font-medium">
                        {currentUser.display_name?.charAt(0)?.toUpperCase() || "M"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>

                {/* Message Bubble (Telegram Style) */}
                <div className={`flex flex-col max-w-[70%] sm:max-w-[65%] ${isOwn ? "items-end" : "items-start"} group/message`}>
                  <div className="flex items-center gap-2 w-full">
                    {!isOwn && message.sender && showAvatar && (
                      <span className="text-[12px] text-[hsl(var(--neohi-text-secondary))] mb-1 px-3 font-medium">
                        {message.sender.display_name}
                      </span>
                    )}
                    
                    {/* Delete Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-6 w-6 p-0 opacity-0 group-hover/message:opacity-100 transition-opacity ${
                            isOwn ? "order-first" : "order-last ml-auto"
                          }`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={isOwn ? "end" : "start"}>
                        <DropdownMenuItem
                          onClick={() => handleDeleteForMe(message.id)}
                          className="gap-2"
                        >
                          <Trash className="h-4 w-4" />
                          <span>حذف برای من</span>
                        </DropdownMenuItem>
                        {isOwn && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteForEveryone(message.id)}
                            className="gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>حذف برای همه</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`rounded-[12px] px-3 py-2 shadow-sm ${
                      isOwn
                        ? "bg-[hsl(var(--neohi-bubble-user))] text-[hsl(var(--neohi-text-primary))] rounded-br-md"
                        : "bg-[hsl(var(--neohi-bubble-other))] text-[hsl(var(--neohi-text-primary))] rounded-bl-md border border-[hsl(var(--neohi-border))]"
                    }`}
                  >
                    {message.media_url && (
                      <div className="mb-2">
                        {/* Images */}
                        {message.message_type === "image" && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group max-w-[280px]"
                          >
                            <img
                              src={message.media_url}
                              alt="Shared"
                              className="rounded-2xl w-full h-auto border border-[hsl(var(--neohi-border))]/50"
                            />
                          </motion.div>
                        )}

                        {/* Videos */}
                        {message.message_type === "video" && (
                          <VideoPlayer src={message.media_url} isOwn={isOwn} />
                        )}

                        {/* Voice Messages */}
                        {message.message_type === "voice" && (
                          <AudioPlayer src={message.media_url} isOwn={isOwn} />
                        )}

                        {/* Audio Files */}
                        {message.message_type === "audio" && (
                          <AudioPlayer src={message.media_url} isOwn={isOwn} />
                        )}

                        {/* Documents */}
                        {message.message_type === "document" && (
                          <FileMessage 
                            url={message.media_url} 
                            type="document"
                            fileName={message.content?.replace("📁 ", "")}
                            isOwn={isOwn}
                          />
                        )}

                        {/* Other Files */}
                        {message.message_type === "file" && (
                          <FileMessage 
                            url={message.media_url} 
                            type="file"
                            fileName={message.content?.replace("📎 ", "")}
                            isOwn={isOwn}
                          />
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
