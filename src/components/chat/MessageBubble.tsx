import { memo } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Copy, Check, ThumbsUp, ThumbsDown, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock, InlineCode } from "@/components/CodeBlock";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  isLast?: boolean;
  isLoading?: boolean;
  copied?: boolean;
  rated?: "like" | "dislike" | null;
  onCopy?: () => void;
  onRate?: (type: "like" | "dislike") => void;
}

export const MessageBubble = memo(function MessageBubble({
  role,
  content,
  imageUrl,
  isLast,
  isLoading,
  copied,
  rated,
  onCopy,
  onRate
}: MessageBubbleProps) {
  const isUser = role === "user";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex gap-3 px-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <Avatar className={cn(
        "w-8 h-8 flex-shrink-0",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-gradient-to-br from-primary to-secondary text-white"
      )}>
        <AvatarFallback className="bg-transparent">
          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>
      
      {/* Message Content */}
      <div className={cn(
        "max-w-[80%] flex flex-col gap-1",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-2.5 max-w-fit",
          isUser 
            ? "bg-primary text-primary-foreground rounded-[18px] rounded-br-[4px]" 
            : "bg-muted rounded-[18px] rounded-bl-[4px]"
        )}>
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="Generated" 
              className="rounded-lg mb-2 max-w-full"
            />
          )}
          
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed overflow-hidden">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: ({ className, children, node, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    // Check if it's a block code (has language) or truly inline
                    const isBlock = match || (node?.position?.start?.line !== node?.position?.end?.line);
                    
                    if (!isBlock) {
                      return <InlineCode {...props}>{children}</InlineCode>;
                    }
                    
                    return (
                      <CodeBlock 
                        language={match?.[1] || 'text'} 
                        code={String(children).replace(/\n$/, '')}
                      />
                    );
                  },
                  pre: ({ children }) => <>{children}</>,
                  table: ({ children }) => (
                    <div className="overflow-x-auto max-w-full my-2 rounded-lg border border-border/50">
                      <table className="min-w-full text-sm">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
                  tbody: ({ children }) => <tbody className="divide-y divide-border/30">{children}</tbody>,
                  tr: ({ children }) => <tr className="hover:bg-muted/30">{children}</tr>,
                  th: ({ children }) => <th className="px-3 py-2 text-right font-medium text-xs whitespace-nowrap">{children}</th>,
                  td: ({ children }) => <td className="px-3 py-2 text-xs whitespace-nowrap">{children}</td>,
                  h1: ({ children }) => <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>,
                  h2: ({ children }) => <h4 className="text-base font-bold mt-3 mb-2">{children}</h4>,
                  h3: ({ children }) => <h5 className="text-sm font-bold mt-2 mb-1">{children}</h5>,
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {children}
                    </a>
                  ),
                }}
              />
              
              {/* Loading indicator */}
              {isLoading && !content && (
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Action buttons for assistant messages */}
        {!isUser && content && !isLoading && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={onCopy}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 rounded-full",
                rated === "like" && "text-success bg-success/10"
              )}
              onClick={() => onRate?.("like")}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 rounded-full",
                rated === "dislike" && "text-destructive bg-destructive/10"
              )}
              onClick={() => onRate?.("dislike")}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
});
