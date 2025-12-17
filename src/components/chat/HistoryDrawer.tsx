import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Trash2, MessageCircle, Clock } from "lucide-react";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  model_type: string;
  updated_at: string;
}

interface HistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HistoryDrawer({
  open,
  onOpenChange,
  conversations,
  currentConversationId,
  onSelect,
  onDelete
}: HistoryDrawerProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "همین الان";
    if (diffMins < 60) return `${diffMins} دقیقه پیش`;
    if (diffHours < 24) return `${diffHours} ساعت پیش`;
    if (diffDays < 7) return `${diffDays} روز پیش`;
    
    return date.toLocaleDateString("fa-IR");
  };

  // Group conversations by date
  const groupConversations = () => {
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const thisWeek: Conversation[] = [];
    const older: Conversation[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 86400000);
    const weekStart = new Date(todayStart.getTime() - 7 * 86400000);

    conversations.forEach(conv => {
      const date = new Date(conv.updated_at);
      if (date >= todayStart) {
        today.push(conv);
      } else if (date >= yesterdayStart) {
        yesterday.push(conv);
      } else if (date >= weekStart) {
        thisWeek.push(conv);
      } else {
        older.push(conv);
      }
    });

    return { today, yesterday, thisWeek, older };
  };

  const groups = groupConversations();
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-[320px] sm:w-[380px] p-0 border-l border-border/50 bg-background/95 backdrop-blur-xl"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-foreground">تاریخچه</h2>
                <p className="text-[11px] text-muted-foreground">{conversations.length} گفتگو</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-3">
            {conversations.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-muted-foreground/40" />
                </div>
                <p className="text-sm text-muted-foreground/60">هنوز گفتگویی نداری</p>
                <p className="text-xs text-muted-foreground/40 mt-1">اولین گفتگوت رو شروع کن</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {/* Today */}
                {groups.today.length > 0 && (
                  <ConversationGroup 
                    title="امروز" 
                    conversations={groups.today}
                    currentConversationId={currentConversationId}
                    onSelect={onSelect}
                    onDelete={onDelete}
                    onOpenChange={onOpenChange}
                    formatDate={formatDate}
                  />
                )}
                
                {/* Yesterday */}
                {groups.yesterday.length > 0 && (
                  <ConversationGroup 
                    title="دیروز" 
                    conversations={groups.yesterday}
                    currentConversationId={currentConversationId}
                    onSelect={onSelect}
                    onDelete={onDelete}
                    onOpenChange={onOpenChange}
                    formatDate={formatDate}
                  />
                )}
                
                {/* This Week */}
                {groups.thisWeek.length > 0 && (
                  <ConversationGroup 
                    title="این هفته" 
                    conversations={groups.thisWeek}
                    currentConversationId={currentConversationId}
                    onSelect={onSelect}
                    onDelete={onDelete}
                    onOpenChange={onOpenChange}
                    formatDate={formatDate}
                  />
                )}
                
                {/* Older */}
                {groups.older.length > 0 && (
                  <ConversationGroup 
                    title="قدیمی‌تر" 
                    conversations={groups.older}
                    currentConversationId={currentConversationId}
                    onSelect={onSelect}
                    onDelete={onDelete}
                    onOpenChange={onOpenChange}
                    formatDate={formatDate}
                  />
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

interface ConversationGroupProps {
  title: string;
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenChange: (open: boolean) => void;
  formatDate: (date: string) => string;
}

function ConversationGroup({
  title,
  conversations,
  currentConversationId,
  onSelect,
  onDelete,
  onOpenChange,
  formatDate
}: ConversationGroupProps) {
  return (
    <div>
      <p className="text-[11px] font-medium text-muted-foreground/50 px-2 mb-2 uppercase tracking-wider">
        {title}
      </p>
      <div className="space-y-1">
        <AnimatePresence>
          {conversations.map((conv, index) => (
            <motion.div
              key={conv.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: index * 0.02, duration: 0.2 }}
              className={cn(
                "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200",
                conv.id === currentConversationId
                  ? "bg-primary/10"
                  : "hover:bg-muted/40"
              )}
              onClick={() => {
                onSelect(conv.id);
                onOpenChange(false);
              }}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
                conv.id === currentConversationId 
                  ? "bg-primary/20" 
                  : "bg-muted/50"
              )}>
                <MessageCircle className={cn(
                  "w-3.5 h-3.5",
                  conv.id === currentConversationId 
                    ? "text-primary" 
                    : "text-muted-foreground/60"
                )} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-[13px] font-medium truncate leading-tight",
                  conv.id === currentConversationId 
                    ? "text-primary" 
                    : "text-foreground/80"
                )}>
                  {conv.title || "گفتگوی جدید"}
                </p>
                <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                  {formatDate(conv.updated_at)}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 absolute left-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
