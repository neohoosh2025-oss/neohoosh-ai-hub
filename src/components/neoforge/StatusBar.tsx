import { useFilesStore } from '@/store/filesStore';
import { Sparkles, GitBranch, FileCode2 } from 'lucide-react';

export const StatusBar = () => {
  const { files, activeFileId } = useFilesStore();
  const activeFile = activeFileId ? files[activeFileId] : null;

  const getLanguage = (filename: string): string => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js': return 'JavaScript';
      case 'jsx': return 'JavaScript React';
      case 'ts': return 'TypeScript';
      case 'tsx': return 'TypeScript React';
      case 'css': return 'CSS';
      case 'html': return 'HTML';
      case 'json': return 'JSON';
      default: return 'Plain Text';
    }
  };

  const lineCount = activeFile?.content?.split('\n').length || 0;

  return (
    <footer className="h-7 bg-[#111111] border-t border-[#27272A] flex items-center justify-between px-4 text-[11px]">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-[#7C3AED]">
          <Sparkles className="w-3 h-3" />
          <span>AI Powered by DeepSeek</span>
        </div>
        
        <div className="flex items-center gap-1.5 text-[#71717A]">
          <GitBranch className="w-3 h-3" />
          <span>main</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 text-[#71717A]">
        {activeFile && (
          <>
            <div className="flex items-center gap-1.5">
              <FileCode2 className="w-3 h-3" />
              <span>{activeFile.path}</span>
            </div>
            <span>{getLanguage(activeFile.name)}</span>
            <span>Ln {lineCount}</span>
          </>
        )}
        <span className="text-[#A1A1AA]">UTF-8</span>
      </div>
    </footer>
  );
};
