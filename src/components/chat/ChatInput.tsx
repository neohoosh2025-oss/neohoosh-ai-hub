import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Square, Mic, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  isLoading,
  disabled,
  placeholder = "پیام خود را بنویسید..."
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [value]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  };
  
  return (
    <div className="sticky bottom-0 bg-background/80 backdrop-blur-xl border-t border-border/50 p-4 safe-area-bottom">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-2">
          {/* Attachment button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full flex-shrink-0 h-10 w-10"
            disabled={disabled || isLoading}
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          
          {/* Input area */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              rows={1}
              className={cn(
                "resize-none rounded-2xl pr-4 pl-12 py-3 min-h-[44px] max-h-[120px]",
                "bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50",
                "text-sm placeholder:text-muted-foreground/70"
              )}
            />
            
            {/* Voice button inside input */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 bottom-1.5 rounded-full h-8 w-8"
              disabled={disabled || isLoading}
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Send/Stop button */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="stop"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <Button
                  size="icon"
                  variant="destructive"
                  className="rounded-full h-10 w-10 flex-shrink-0"
                  onClick={onStop}
                >
                  <Square className="w-4 h-4 fill-current" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="send"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <Button
                  size="icon"
                  className={cn(
                    "rounded-full h-10 w-10 flex-shrink-0 transition-all",
                    value.trim() 
                      ? "bg-primary hover:bg-primary/90" 
                      : "bg-muted text-muted-foreground"
                  )}
                  onClick={onSend}
                  disabled={disabled || !value.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Hint text */}
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          نئوهوش ممکن است اشتباه کند. اطلاعات مهم را بررسی کنید.
        </p>
      </div>
    </div>
  );
}
