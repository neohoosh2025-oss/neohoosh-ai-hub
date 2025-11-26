import { useState } from "react";
import { 
  Copy, 
  Bookmark, 
  MessageSquarePlus, 
  Expand, 
  Sparkles, 
  RefreshCw,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AIMessageMenuProps {
  message: any;
  isOwn: boolean;
  onAction?: (action: string, result?: any) => void;
}

export function AIMessageMenu({ message, isOwn, onAction }: AIMessageMenuProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      toast.success("کپی شد");
    }
  };

  const handleSave = async () => {
    // Save to favorites or bookmarks
    toast.success("ذخیره شد");
    onAction?.("save");
  };

  const handleFollowUp = async () => {
    // Open input with context for follow-up
    onAction?.("followup", message);
  };

  const handleExpand = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-enhance", {
        body: { 
          action: "expand",
          content: message.content,
          chatId: message.chat_id
        }
      });

      if (error) throw error;
      
      toast.success("پاسخ گسترده‌تر آماده شد");
      onAction?.("expand", data);
    } catch (error) {
      console.error(error);
      toast.error("خطا در گسترش پاسخ");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImprove = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-enhance", {
        body: { 
          action: "improve",
          content: message.content,
          chatId: message.chat_id
        }
      });

      if (error) throw error;
      
      toast.success("پاسخ بهبود یافت");
      onAction?.("improve", data);
    } catch (error) {
      console.error(error);
      toast.error("خطا در بهبود پاسخ");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegenerate = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-enhance", {
        body: { 
          action: "regenerate",
          content: message.content,
          chatId: message.chat_id
        }
      });

      if (error) throw error;
      
      toast.success("پاسخ جدید تولید شد");
      onAction?.("regenerate", data);
    } catch (error) {
      console.error(error);
      toast.error("خطا در تولید مجدد");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={isProcessing}
          className={`h-6 w-6 p-0 opacity-0 group-hover/message:opacity-100 transition-opacity ${
            isOwn ? "order-first" : "order-last ml-auto"
          }`}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={isOwn ? "end" : "start"}
        className="w-56 bg-background/95 backdrop-blur-lg border-border"
      >
        <DropdownMenuItem onClick={handleCopy} className="gap-2 cursor-pointer">
          <Copy className="h-4 w-4" />
          <span>کپی</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleSave} className="gap-2 cursor-pointer">
          <Bookmark className="h-4 w-4" />
          <span>ذخیره</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleFollowUp} className="gap-2 cursor-pointer">
          <MessageSquarePlus className="h-4 w-4" />
          <span>سوال بعدی</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem 
          onClick={handleExpand} 
          disabled={isProcessing}
          className="gap-2 cursor-pointer"
        >
          <Expand className="h-4 w-4" />
          <span>گسترش پاسخ</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={handleImprove} 
          disabled={isProcessing}
          className="gap-2 cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          <span>بهبود پاسخ</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={handleRegenerate} 
          disabled={isProcessing}
          className="gap-2 cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          <span>تولید مجدد</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
