import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCheck, MoreVertical, Trash2, Trash, Reply, Forward, Pencil, Smile } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ForwardDialog } from "./ForwardDialog";
import { MediaViewer } from "./MediaViewer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MessageListProps {
  messages: any[];
  loading: boolean;
  onMessageDeleted?: (messageId: string) => void;
  onReply?: (message: any) => void;
}

export function MessageList({ messages, loading, onMessageDeleted, onReply }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [forwardMessage, setForwardMessage] = useState<any>(null);
  const [mediaViewer, setMediaViewer] = useState<{ url: string; type: "image" | "video" } | null>(null);
  const [repliedMessages, setRepliedMessages] = useState<Record<string, any>>({});
  const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(null);
  const [reactions, setReactions] = useState<Record<string, any[]>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const commonEmojis = ["❤️", "👍", "😂", "😮", "😢", "🙏", "🔥", "👏"];

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    scrollToBottom();
    loadRepliedMessages();
    loadReactions();
  }, [messages]);

  useEffect(() => {
    // Subscribe to reactions
    const reactionsChannel = supabase
      .channel('reactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'neohi_reactions',
        },
        () => {
          loadReactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(reactionsChannel);
    };
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

  const loadRepliedMessages = async () => {
    const replyToIds = messages
      .filter(m => m.reply_to)
      .map(m => m.reply_to)
      .filter(id => id && !repliedMessages[id]);

    if (replyToIds.length === 0) return;

    const { data } = await supabase
      .from("neohi_messages")
      .select(`
        id,
        content,
        message_type,
        sender:neohi_users(display_name)
      `)
      .in("id", replyToIds);

    if (data) {
      const newRepliedMessages: Record<string, any> = {};
      data.forEach(msg => {
        newRepliedMessages[msg.id] = msg;
      });
      setRepliedMessages(prev => ({ ...prev, ...newRepliedMessages }));
    }
  };

  const loadReactions = async () => {
    const messageIds = messages.map(m => m.id);
    if (messageIds.length === 0) return;

    const { data } = await supabase
      .from("neohi_reactions")
      .select(`
        id,
        message_id,
        user_id,
        emoji,
        user:neohi_users(display_name)
      `)
      .in("message_id", messageIds);

    if (data) {
      const reactionsMap: Record<string, any[]> = {};
      data.forEach(reaction => {
        if (!reactionsMap[reaction.message_id]) {
          reactionsMap[reaction.message_id] = [];
        }
        reactionsMap[reaction.message_id].push(reaction);
      });
      setReactions(reactionsMap);
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
      onMessageDeleted?.(messageId);
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
      onMessageDeleted?.(messageId);
    }
  };

  const handleEditMessage = async () => {
    if (!editingMessage || !editingMessage.content.trim()) return;

    const { error } = await supabase
      .from("neohi_messages")
      .update({ 
        content: editingMessage.content,
        is_edited: true 
      })
      .eq("id", editingMessage.id);

    if (error) {
      toast.error("خطا در ویرایش پیام");
      console.error(error);
    } else {
      toast.success("پیام ویرایش شد");
      setEditingMessage(null);
      // Update local state
      const updatedMessages = messages.map(m => 
        m.id === editingMessage.id 
          ? { ...m, content: editingMessage.content, is_edited: true }
          : m
      );
      onMessageDeleted?.(editingMessage.id); // Trigger refresh
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!currentUserId) return;

    // Check if user already reacted with this emoji
    const existingReaction = reactions[messageId]?.find(
      r => r.user_id === currentUserId && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      const { error } = await supabase
        .from("neohi_reactions")
        .delete()
        .eq("id", existingReaction.id);

      if (error) {
        toast.error("خطا در حذف ری‌اکشن");
      }
    } else {
      // Add reaction
      const { error } = await supabase
        .from("neohi_reactions")
        .insert({
          message_id: messageId,
          user_id: currentUserId,
          emoji: emoji,
        });

      if (error) {
        toast.error("خطا در افزودن ری‌اکشن");
      }
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
                            onClick={() => onReply?.(message)}
                            className="gap-2"
                          >
                            <Reply className="h-4 w-4" />
                            <span>ریپلای</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setForwardMessage(message)}
                            className="gap-2"
                          >
                            <Forward className="h-4 w-4" />
                            <span>فوروارد</span>
                          </DropdownMenuItem>
                          {isOwn && (
                            <DropdownMenuItem
                              onClick={() => setEditingMessage({ id: message.id, content: message.content || "" })}
                              className="gap-2"
                            >
                              <Pencil className="h-4 w-4" />
                              <span>ویرایش</span>
                            </DropdownMenuItem>
                          )}
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
                    {/* Reply Preview */}
                    {message.reply_to && repliedMessages[message.reply_to] && (
                      <div className={`mb-2 pb-2 border-b ${
                        isOwn ? "border-neohi-border/30" : "border-neohi-border/50"
                      }`}>
                        <div className={`flex items-start gap-2 p-2 rounded-lg ${
                          isOwn ? "bg-neohi-bg-hover/20" : "bg-neohi-bg-hover/40"
                        } border-r-2 border-neohi-accent`}>
                          <Reply className="h-3 w-3 text-neohi-accent flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-neohi-accent font-medium mb-0.5">
                              {repliedMessages[message.reply_to].sender?.display_name || "کاربر"}
                            </p>
                            <p className="text-xs text-neohi-text-secondary truncate">
                              {repliedMessages[message.reply_to].message_type === "image" ? "🖼️ تصویر" :
                               repliedMessages[message.reply_to].message_type === "video" ? "🎥 ویدیو" :
                               repliedMessages[message.reply_to].message_type === "voice" ? "🎤 پیام صوتی" :
                               repliedMessages[message.reply_to].message_type === "file" ? "📎 فایل" :
                               repliedMessages[message.reply_to].content || "پیام"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {message.media_url && (
                      <div className="mb-2">
                        {/* Images */}
                        {message.message_type === "image" && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative group max-w-[280px] cursor-pointer"
                            onClick={() => setMediaViewer({ url: message.media_url, type: "image" })}
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
                          <div 
                            className="cursor-pointer"
                            onClick={() => setMediaViewer({ url: message.media_url, type: "video" })}
                          >
                            <VideoPlayer src={message.media_url} isOwn={isOwn} />
                          </div>
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
                    
                    {message.content && !["image", "video", "voice", "audio", "document", "file"].includes(message.message_type || "") && (
                      <p className="text-[15px] leading-[1.4] whitespace-pre-wrap break-words mb-0.5">
                        {message.content}
                      </p>
                    )}
                    
                    <div className={`flex items-center gap-1 mt-0.5 text-[11px] ${
                      isOwn ? "justify-end text-[hsl(var(--neohi-text-secondary))]/80" : "justify-end text-[hsl(var(--neohi-text-secondary))]/70"
                    }`}>
                      <span className="leading-none">{formatTime(message.created_at)}</span>
                      {message.is_edited && (
                        <span className="text-[hsl(var(--neohi-text-secondary))]/60 text-[10px]">(ویرایش شده)</span>
                      )}
                      {isOwn && (
                        <CheckCheck className="h-3.5 w-3.5 text-[hsl(var(--neohi-status-read))]" />
                      )}
                    </div>
                  </motion.div>

                  {/* Reactions */}
                  {reactions[message.id] && reactions[message.id].length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(
                        reactions[message.id].reduce((acc: Record<string, any>, r) => {
                          if (!acc[r.emoji]) acc[r.emoji] = [];
                          acc[r.emoji].push(r);
                          return acc;
                        }, {})
                      ).map(([emoji, reactionList]: [string, any]) => (
                        <button
                          key={emoji}
                          onClick={() => handleAddReaction(message.id, emoji)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all ${
                            reactionList.some((r: any) => r.user_id === currentUserId)
                              ? "bg-neohi-accent/20 border border-neohi-accent"
                              : "bg-neohi-bg-hover border border-neohi-border"
                          }`}
                        >
                          <span>{emoji}</span>
                          <span className="text-[10px] text-neohi-text-secondary">{reactionList.length}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Add Reaction Button */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover/message:opacity-100 transition-opacity mt-1"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 bg-neohi-bg-sidebar border-neohi-border">
                      <div className="flex gap-1">
                        {commonEmojis.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleAddReaction(message.id, emoji)}
                            className="text-xl hover:scale-125 transition-transform p-1"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={scrollRef} />
      </div>

      {/* Edit Message Dialog */}
      {editingMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-neohi-bg-sidebar rounded-2xl p-6 max-w-md w-full border border-neohi-border"
          >
            <h3 className="text-neohi-text-primary font-semibold text-lg mb-4">ویرایش پیام</h3>
            <Input
              value={editingMessage.content}
              onChange={(e) => setEditingMessage({ ...editingMessage, content: e.target.value })}
              className="bg-neohi-bg-chat border-neohi-border text-neohi-text-primary mb-4"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleEditMessage();
                }
              }}
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => setEditingMessage(null)}
                className="text-neohi-text-secondary"
              >
                لغو
              </Button>
              <Button
                onClick={handleEditMessage}
                className="bg-neohi-accent hover:bg-neohi-accent/90 text-white"
              >
                ذخیره
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <ForwardDialog
        open={!!forwardMessage}
        onClose={() => setForwardMessage(null)}
        message={forwardMessage}
      />

      <MediaViewer
        open={!!mediaViewer}
        onClose={() => setMediaViewer(null)}
        mediaUrl={mediaViewer?.url || ""}
        mediaType={mediaViewer?.type || "image"}
      />
    </div>
  );
}
