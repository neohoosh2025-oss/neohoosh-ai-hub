import { useState, useRef, TouchEvent } from "react";
import { useNavigate } from "react-router-dom";
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
  const [translateX, setTranslateX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setSwiping(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!swiping) return;
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;
    
    // Only allow swipe to left (negative values)
    if (diff < 0) {
      setTranslateX(Math.max(diff, -150));
    }
  };

  const handleTouchEnd = () => {
    setSwiping(false);
    
    if (translateX < -50) {
      setTranslateX(-150); // Snap to show actions
    } else {
      setTranslateX(0); // Snap back
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
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

    toast({
      title: "چت حذف شد",
    });
    
    onDelete?.();
    setTranslateX(0);
  };

  const handlePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "چت پین شد",
    });
    setTranslateX(0);
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "چت آرشیو شد",
    });
    setTranslateX(0);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons (revealed on swipe) */}
      <div className="absolute left-0 top-0 bottom-0 flex items-center gap-2 pr-2">
        <button
          onClick={handlePin}
          className="bg-blue-500 text-white p-3 rounded-xl min-w-[48px] h-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <Pin className="w-5 h-5" />
        </button>
        <button
          onClick={handleArchive}
          className="bg-orange-500 text-white p-3 rounded-xl min-w-[48px] h-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <Archive className="w-5 h-5" />
        </button>
        <button
          onClick={handleDelete}
          className="bg-destructive text-destructive-foreground p-3 rounded-xl min-w-[48px] h-full flex items-center justify-center active:scale-95 transition-transform"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main chat item */}
      <div
        className={cn(
          "flex items-center gap-3 p-4 bg-background cursor-pointer transition-all duration-200 min-h-[72px]",
          "hover:bg-muted/50 active:bg-muted"
        )}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: swiping ? "none" : "transform 0.3s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => navigate(`/neohi/chat/${chat.id}`)}
      >
        <Avatar className="w-14 h-14 ring-2 ring-primary/10">
          <AvatarImage src={chat.avatar_url || ""} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {chat.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        
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
      </div>
    </div>
  );
};

export default ChatListItem;
