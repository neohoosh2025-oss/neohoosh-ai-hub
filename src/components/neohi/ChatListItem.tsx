import { useState, useRef, TouchEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, PanInfo, useMotionValue, useTransform } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pin, Archive, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ChatListItemProps {
  chat: {
    id: string;
    name: string | null;
    avatar_url: string | null;
    type: string;
    last_message_at: string | null;
  };
  onDelete?: () => void;
}

const ChatListItem = ({ chat, onDelete }: ChatListItemProps) => {
  const navigate = useNavigate();
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, 0], [0.8, 1]);

  const handleDragEnd = async (_event: any, info: PanInfo) => {
    if (info.offset.x < -100) {
      // Archive action
      toast({ title: "چت آرشیو شد" });
      x.set(0);
    } else if (info.offset.x > 100) {
      // Pin action
      toast({ title: "چت پین شد" });
      x.set(0);
    } else {
      x.set(0);
    }
  };

  const handleDelete = async () => {
    const { error } = await supabase
      .from("neohi_chats")
      .delete()
      .eq("id", chat.id);

    if (error) {
      toast({
        title: "خطا در حذف چت",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({ title: "چت حذف شد" });
    onDelete?.();
  };

  return (
    <div className="relative overflow-hidden bg-card">
      {/* Background Actions */}
      <motion.div 
        className="absolute inset-0 flex items-center justify-between px-4"
        style={{ opacity: useTransform(x, [0, -150], [0, 1]) }}
      >
        <motion.div className="flex items-center gap-2 text-primary">
          <Pin className="h-5 w-5" />
          <span className="text-sm font-medium">سنجاق</span>
        </motion.div>
        
        <motion.div className="flex items-center gap-2 text-destructive">
          <span className="text-sm font-medium">آرشیو</span>
          <Archive className="h-5 w-5" />
        </motion.div>
      </motion.div>

      {/* Main Chat Item */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -150, right: 150 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x, opacity }}
        whileTap={{ scale: 0.98 }}
        className="relative bg-card"
      >
        <div
          onClick={() => navigate(`/neohi/chat/${chat.id}`)}
          className={cn(
            "flex items-center gap-3 p-4 cursor-pointer transition-colors min-h-[72px]",
            "hover:bg-muted/50 active:bg-muted"
          )}
        >
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Avatar className="w-14 h-14 ring-2 ring-primary/10">
              <AvatarImage src={chat.avatar_url || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {chat.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          
          {/* Chat Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-sm truncate">
                {chat.name || "بدون نام"}
              </h3>
              {chat.last_message_at && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(chat.last_message_at).toLocaleDateString("fa-IR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate mt-1">
              {chat.type === "dm" ? "گفتگوی خصوصی" : chat.type === "group" ? "گروه" : "کانال"}
            </p>
          </div>

          {/* Delete Button (visible on long press) */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChatListItem;
