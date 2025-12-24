import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Brain } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ContextProgressProps {
  messages: Message[];
}

// Approximate token limits based on edge function settings
const MAX_CHARS = 80000; // Same as MAX_TOTAL_CHARS in edge function
const MAX_MESSAGES = 30; // Same as MAX_MESSAGES in edge function

export function ContextProgress({ messages }: ContextProgressProps) {
  const { charCount, percentage, messageCount, status, color } = useMemo(() => {
    const totalChars = messages.reduce((sum, m) => sum + (m.content?.length || 0), 0);
    const msgCount = messages.length;
    
    // Calculate percentage based on both chars and message count
    const charPercentage = (totalChars / MAX_CHARS) * 100;
    const msgPercentage = (msgCount / MAX_MESSAGES) * 100;
    
    // Use the higher percentage as the limiting factor
    const percent = Math.min(Math.max(charPercentage, msgPercentage), 100);
    
    // Determine status and color
    let statusText = "عالی";
    let statusColor = "text-emerald-500";
    let progressColor = "bg-emerald-500";
    
    if (percent >= 80) {
      statusText = "پر شده";
      statusColor = "text-red-500";
      progressColor = "bg-red-500";
    } else if (percent >= 60) {
      statusText = "محدود";
      statusColor = "text-amber-500";
      progressColor = "bg-amber-500";
    } else if (percent >= 40) {
      statusText = "متوسط";
      statusColor = "text-yellow-500";
      progressColor = "bg-yellow-500";
    }
    
    return {
      charCount: totalChars,
      percentage: Math.round(percent),
      messageCount: msgCount,
      status: statusText,
      color: { text: statusColor, progress: progressColor }
    };
  }, [messages]);

  // Don't show if no messages
  if (messages.length === 0) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors cursor-help">
            <Brain className={`w-4 h-4 ${color.text}`} />
            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${color.progress}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${color.text}`}>
              {percentage}%
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-right">
          <div className="space-y-1.5 p-1">
            <p className="font-semibold">وضعیت حافظه گفتگو</p>
            <div className="text-xs space-y-1 text-muted-foreground">
              <p>تعداد پیام‌ها: {messageCount} از {MAX_MESSAGES}</p>
              <p>حجم متن: {(charCount / 1000).toFixed(1)}K از {MAX_CHARS / 1000}K کاراکتر</p>
              <p className={color.text}>وضعیت: {status}</p>
            </div>
            {percentage >= 80 && (
              <p className="text-xs text-red-400 mt-2">
                ⚠️ حافظه پر شده! پیام‌های قدیمی نادیده گرفته می‌شوند.
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
