import { 
  Play, 
  Download, 
  History, 
  Github, 
  Settings,
  ChevronDown,
  Sparkles,
  Moon,
  Sun,
  Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
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
  const { theme, setTheme } = useTheme();
  const { projectName, files, resetToDefault } = useFilesStore();

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
    <header className="h-14 neoforge-glass border-b border-[#27272A] flex items-center justify-between px-5">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors"
        >
          <Home className="w-4 h-4 text-[#A1A1AA]" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="neoforge-logo text-lg text-[#F5F5F5]">
            NeoForge
          </span>
        </div>

        <div className="h-5 w-px bg-[#27272A]" />

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1A1A1A] border border-[#27272A]">
          <span className="text-sm text-[#A1A1AA]">{projectName}</span>
          <ChevronDown className="w-3 h-3 text-[#71717A]" />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-lg hover:bg-[#2A2A2A] transition-colors text-[#A1A1AA] hover:text-[#F5F5F5]"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button className="p-2.5 rounded-lg hover:bg-[#2A2A2A] transition-colors text-[#A1A1AA] hover:text-[#F5F5F5]">
          <History className="w-4 h-4" />
        </button>

        <button className="p-2.5 rounded-lg hover:bg-[#2A2A2A] transition-colors text-[#A1A1AA] hover:text-[#F5F5F5]">
          <Github className="w-4 h-4" />
        </button>

        <button 
          onClick={handleExport}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#2A2A2A] transition-colors text-[#A1A1AA] hover:text-[#F5F5F5] text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Export
        </button>

        <button 
          onClick={onRun}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C3AED] hover:bg-[#8B5CF6] transition-all text-white text-sm font-medium shadow-[0_0_20px_rgba(124,58,237,0.25)] hover:shadow-[0_0_30px_rgba(124,58,237,0.4)]"
        >
          <Play className="w-4 h-4" fill="currentColor" />
          Run
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2.5 rounded-lg hover:bg-[#2A2A2A] transition-colors text-[#A1A1AA] hover:text-[#F5F5F5]">
              <Settings className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[#111111] border-[#27272A]">
            <DropdownMenuItem onClick={handleExport} className="text-[#A1A1AA] hover:text-[#F5F5F5] hover:bg-[#2A2A2A]">
              <Download className="w-4 h-4 mr-2" />
              Export Project
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#27272A]" />
            <DropdownMenuItem 
              onClick={resetToDefault}
              className="text-red-400 hover:text-red-300 hover:bg-[#2A2A2A]"
            >
              Reset Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
