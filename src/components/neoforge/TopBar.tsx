import { useState } from 'react';
import { 
  Play, 
  Download, 
  Clock, 
  Github, 
  Settings,
  ChevronDown,
  ArrowLeft,
  Zap,
  GitBranch,
  Sparkles,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFilesStore } from '@/store/filesStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TopBarProps {
  onRun: () => void;
  onToggleAi?: () => void;
  showAiPanel?: boolean;
}

export const TopBar = ({ onRun, onToggleAi, showAiPanel }: TopBarProps) => {
  const navigate = useNavigate();
  const { projectName, files, resetToDefault } = useFilesStore();
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    setIsRunning(true);
    onRun();
    setTimeout(() => setIsRunning(false), 1500);
  };

  const handleExport = () => {
    const exportData = {
      name: projectName,
      files: Object.values(files).filter(f => f.type === 'file').map(f => ({
        path: f.path,
        content: f.content,
      })),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.neoforge.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Project exported successfully!');
  };

  return (
    <header className="h-[52px] sm:h-[56px] nf-glass-strong flex items-center justify-between px-3 sm:px-4 relative z-50">
      {/* Gradient Border Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(139,92,246,0.3)] to-transparent" />
      
      {/* Left - Logo & Navigation */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => navigate('/')}
          className="nf-icon-btn group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        </button>

        <div className="w-px h-5 sm:h-6 bg-[rgba(255,255,255,0.08)] hidden sm:block" />

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative group">
            <div className={cn(
              "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center",
              "bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#22d3ee]",
              "shadow-[0_0_24px_rgba(139,92,246,0.4)]",
              "transition-all duration-300 group-hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]",
              "group-hover:scale-105"
            )}>
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#22d3ee] opacity-0 blur-lg group-hover:opacity-30 transition-opacity -z-10" />
          </div>
          <div className="flex flex-col">
            <span className="nf-font-logo text-base sm:text-lg text-[#fafafa] leading-tight">
              NeoForge
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#71717a] tracking-wider uppercase hidden sm:block">
              AI Playground
            </span>
          </div>
        </div>
      </div>

      {/* Center - Project Info (Desktop only) */}
      <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl",
            "bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)]",
            "border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.1)]",
            "transition-all duration-200"
          )}>
            <Sparkles className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <span className="text-sm font-medium text-[#fafafa]">{projectName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#71717a]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#131316] border-[rgba(255,255,255,0.08)] backdrop-blur-xl" align="center">
            <DropdownMenuItem className="text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[rgba(255,255,255,0.06)]">
              Rename Project
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[rgba(255,255,255,0.06)]">
              Duplicate Project
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.06)]" />
            <DropdownMenuItem 
              onClick={resetToDefault}
              className="text-[#f87171] hover:bg-[rgba(248,113,113,0.1)]"
            >
              Reset Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg",
          "bg-[rgba(34,211,238,0.08)] border border-[rgba(34,211,238,0.15)]"
        )}>
          <GitBranch className="w-3.5 h-3.5 text-[#22d3ee]" />
          <span className="text-xs font-medium text-[#22d3ee]">main</span>
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={handleRun}
          className={cn(
            "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl",
            "bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed]",
            "text-white font-medium text-xs sm:text-sm",
            "shadow-[0_0_24px_rgba(139,92,246,0.4)]",
            "hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]",
            "hover:from-[#a78bfa] hover:to-[#8b5cf6]",
            "transition-all duration-300",
            "active:scale-[0.98]",
            isRunning && "animate-pulse"
          )}
        >
          <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" />
          <span>Run</span>
        </button>

        <button 
          onClick={handleExport}
          className="nf-btn-glass rounded-lg sm:rounded-xl hidden sm:flex"
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Export</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="nf-icon-btn">
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#131316] border-[rgba(255,255,255,0.08)] backdrop-blur-xl" align="end">
            <DropdownMenuItem onClick={handleExport} className="text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[rgba(255,255,255,0.06)] sm:hidden">
              <Download className="w-4 h-4 mr-2" />
              Export
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[rgba(255,255,255,0.06)]">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[rgba(255,255,255,0.06)]">
              <Clock className="w-4 h-4 mr-2" />
              History
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[rgba(255,255,255,0.06)]">
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.06)]" />
            <DropdownMenuItem className="text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[rgba(255,255,255,0.06)]">
              <Zap className="w-4 h-4 mr-2 text-[#8b5cf6]" />
              AI Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[rgba(255,255,255,0.06)]">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={resetToDefault}
              className="text-[#f87171] hover:bg-[rgba(248,113,113,0.1)] lg:hidden"
            >
              Reset Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
