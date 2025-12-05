import { useFilesStore } from '@/store/filesStore';
import { Sparkles, GitBranch, FileCode2, Zap } from 'lucide-react';

export const StatusBar = () => {
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
    <footer className="h-7 bg-[#0B0B0D] flex items-center justify-between px-4 text-[11px] relative">
      {/* Top Glow Border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#7C3AED]/30 to-transparent" />

      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[#71717A]">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>

        {activeFile && (
          <>
            <div className="w-px h-3 bg-[#27272A]" />
            <div className="flex items-center gap-1.5 text-[#71717A]">
              <FileCode2 className="w-3 h-3" />
              <span>{activeFile.path}</span>
            </div>
            <div className="w-px h-3 bg-[#27272A]" />
            <span className="text-[#71717A]">{getLanguage(activeFile.name)}</span>
            <div className="w-px h-3 bg-[#27272A]" />
            <span className="text-[#71717A]">Ln {lineCount}, Col 1</span>
          </>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-2 py-0.5 rounded bg-[#18181A]">
          <span className="text-[#71717A]">React + Vite</span>
        </div>
        
        <span className="text-[#71717A]">UTF-8</span>
        
        <div className="w-px h-3 bg-[#27272A]" />
        
        <div className="flex items-center gap-1.5 text-[#7C3AED]">
          <Zap className="w-3 h-3" />
          <span className="font-medium">Powered by DeepSeek</span>
        </div>
      </div>
    </footer>
  );
};
