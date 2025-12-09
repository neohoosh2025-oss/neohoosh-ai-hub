import { Dispatch, SetStateAction } from 'react';
import { useFilesStore } from '@/store/filesStore';
import { GitBranch, FileCode2, Zap, Circle, Wifi, Code2, Eye, Columns } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewMode = 'code' | 'preview' | 'split';

interface StatusBarProps {
  viewMode?: ViewMode;
  onViewModeChange?: Dispatch<SetStateAction<ViewMode>>;
}

export const StatusBar = ({ viewMode, onViewModeChange }: StatusBarProps = {}) => {
  const { files, activeFileId } = useFilesStore();
  const activeFile = activeFileId ? files[activeFileId] : null;

  const getLanguage = (filename: string): string => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'JavaScript';
      case 'jsx': return 'JavaScript JSX';
      case 'ts': return 'TypeScript';
      case 'tsx': return 'TypeScript TSX';
      case 'css': return 'CSS';
      case 'html': return 'HTML';
      case 'json': return 'JSON';
      default: return 'Plain Text';
    }
  };

  const lineCount = activeFile?.content?.split('\n').length || 0;
  const charCount = activeFile?.content?.length || 0;

  return (
    <footer className={cn(
      "h-8 bg-[#050507] flex items-center justify-between px-4 text-[11px]",
      "relative border-t border-[rgba(255,255,255,0.04)]"
    )}>
      {/* Top Gradient Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(139,92,246,0.4)] to-transparent" />

      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Circle className="w-2 h-2 fill-[#34d399] text-[#34d399]" />
          <span className="text-[#71717a]">Ready</span>
        </div>

        <div className="w-px h-3 bg-[rgba(255,255,255,0.06)]" />

        <div className="flex items-center gap-1.5 text-[#71717a]">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>

        {activeFile && (
          <>
            <div className="w-px h-3 bg-[rgba(255,255,255,0.06)]" />
            <div className="flex items-center gap-1.5 text-[#71717a]">
              <FileCode2 className="w-3 h-3" />
              <span className="font-mono">{activeFile.path}</span>
            </div>
            <div className="w-px h-3 bg-[rgba(255,255,255,0.06)]" />
            <span className="text-[#a1a1aa]">{getLanguage(activeFile.name)}</span>
            <div className="w-px h-3 bg-[rgba(255,255,255,0.06)]" />
            <span className="text-[#71717a]">Ln {lineCount}, Col 1</span>
          </>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Wifi className="w-3 h-3 text-[#34d399]" />
          <span className="text-[#71717a]">Connected</span>
        </div>
        
        <div className="w-px h-3 bg-[rgba(255,255,255,0.06)]" />

        <div className={cn(
          "flex items-center gap-2 px-2 py-0.5 rounded",
          "bg-[rgba(255,255,255,0.03)]"
        )}>
          <span className="text-[#71717a]">React + Vite</span>
        </div>
        
        <span className="text-[#71717a]">UTF-8</span>
        
        <div className="w-px h-3 bg-[rgba(255,255,255,0.06)]" />
        
        <div className="flex items-center gap-1.5">
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded",
            "bg-gradient-to-r from-[rgba(139,92,246,0.1)] to-[rgba(34,211,238,0.1)]",
            "border border-[rgba(139,92,246,0.2)]"
          )}>
            <Zap className="w-3 h-3 text-[#8b5cf6]" />
            <span className="font-medium nf-gradient-text">AI Powered</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
