import { Button } from "@/components/ui/button";
import { ArrowRight, History, MoreVertical, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/neohoosh-logo-new.png";
import { Link } from "react-router-dom";

interface ChatHeaderProps {
  modelName?: string;
  onShowHistory: () => void;
  onClearChat: () => void;
  onNewChat: () => void;
}

export function ChatHeader({ 
  modelName, 
  onShowHistory, 
  onClearChat,
  onNewChat 
}: ChatHeaderProps) {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 safe-area-top"
    >
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <img src={logo} alt="NeoHoosh" className="w-8 h-8" />
            <div>
              <h1 className="font-semibold text-sm">نئوهوش</h1>
              {modelName && (
                <p className="text-[10px] text-muted-foreground">{modelName}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onShowHistory}
            className="rounded-full"
          >
            <History className="w-5 h-5" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onNewChat}>
                گفتگوی جدید
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onClearChat} className="text-destructive">
                <Trash2 className="w-4 h-4 ml-2" />
                پاک کردن چت
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
}
