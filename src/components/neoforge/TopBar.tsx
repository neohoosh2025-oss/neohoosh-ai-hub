import { useState } from 'react';
import { 
  Play, 
  Download, 
  History, 
  Github, 
  Settings,
  ChevronDown,
  Home,
  Zap,
  GitBranch
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

interface TopBarProps {
  onRun: () => void;
}

export const TopBar = ({ onRun }: TopBarProps) => {
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
    <header className="h-[60px] nf-glass border-b border-[#1E1E1E] flex items-center justify-between px-5 relative z-50">
      {/* Left - Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-[#27272A] transition-colors text-[#71717A] hover:text-[#A1A1AA]"
        >
          <Home className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -inset-1 rounded-lg bg-[#7C3AED] opacity-20 blur-md -z-10" />
          </div>
          <span className="nf-font-logo text-xl text-[#F5F5F5] nf-glow-text">
            NeoForge
          </span>
        </div>
      </div>

      {/* Center - Project Info */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-md hover:bg-[#27272A] transition-colors">
            <span className="text-sm font-medium text-[#F5F5F5]">{projectName}</span>
            <ChevronDown className="w-4 h-4 text-[#71717A]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#18181A] border-[#27272A]">
            <DropdownMenuItem className="text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#27272A]">
              Rename Project
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#27272A]">
              Duplicate Project
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#27272A]" />
            <DropdownMenuItem 
              onClick={resetToDefault}
              className="text-[#EF4444] hover:bg-[#27272A]"
            >
              Reset Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#18181A] border border-[#27272A]">
          <GitBranch className="w-3.5 h-3.5 text-[#71717A]" />
          <span className="text-xs text-[#71717A]">main</span>
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleRun}
          className={`nf-btn-primary px-4 py-2.5 rounded-lg flex items-center gap-2 ${isRunning ? 'nf-animate-glow' : ''}`}
        >
          <Play className="w-4 h-4" fill="currentColor" />
          <span className="text-sm font-medium">Run</span>
        </button>

        <button 
          onClick={handleExport}
          className="nf-btn-glass px-3 py-2.5 rounded-lg flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          <span className="text-sm">Export</span>
        </button>

        <button className="nf-btn-ghost p-2.5 rounded-lg">
          <History className="w-4 h-4" />
        </button>

        <button className="nf-btn-ghost p-2.5 rounded-lg">
          <Github className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-[#27272A] mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger className="nf-btn-ghost p-2.5 rounded-lg">
            <Settings className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#18181A] border-[#27272A]" align="end">
            <DropdownMenuItem className="text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#27272A]">
              <Zap className="w-4 h-4 mr-2" />
              AI Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#27272A]">
              Editor Preferences
            </DropdownMenuItem>
            <DropdownMenuItem className="text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#27272A]">
              Keyboard Shortcuts
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#27272A]" />
            <DropdownMenuItem className="text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#27272A]">
              About NeoForge
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
