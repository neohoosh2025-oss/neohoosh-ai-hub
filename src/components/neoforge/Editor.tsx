import { useEffect, useRef, useState } from 'react';
import { useFilesStore } from '@/store/filesStore';
import { cn } from '@/lib/utils';
import { X, FileCode2, Code2, FileJson, FileType, Sparkles } from 'lucide-react';

const highlightCode = (code: string, language: string): string => {
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Comments
  highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span style="color: #6b7280; font-style: italic">$1</span>');
  highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6b7280; font-style: italic">$1</span>');

  // Strings
  highlighted = highlighted.replace(/(`[^`]*`)/g, '<span style="color: #34d399">$1</span>');
  highlighted = highlighted.replace(/("[^"]*")/g, '<span style="color: #34d399">$1</span>');
  highlighted = highlighted.replace(/('[^']*')/g, '<span style="color: #34d399">$1</span>');

  // Keywords
  const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'from', 'default', 'class', 'extends', 'new', 'this', 'async', 'await', 'try', 'catch', 'throw'];
  keywords.forEach((kw) => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'g');
    highlighted = highlighted.replace(regex, '<span style="color: #a78bfa">$1</span>');
  });

  // Functions
  highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, '<span style="color: #22d3ee">$1</span>');

  // Numbers
  highlighted = highlighted.replace(/\b(\d+)\b/g, '<span style="color: #fbbf24">$1</span>');

  // JSX tags
  highlighted = highlighted.replace(/(&lt;\/?)([\w-]+)/g, '$1<span style="color: #f472b6">$2</span>');

  // CSS
  if (language === 'css') {
    highlighted = highlighted.replace(/([\w-]+)(\s*:)/g, '<span style="color: #22d3ee">$1</span>$2');
    highlighted = highlighted.replace(/([.#][\w-]+)/g, '<span style="color: #fbbf24">$1</span>');
  }

  return highlighted;
};

const getLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx': return 'javascript';
    case 'ts':
    case 'tsx': return 'typescript';
    case 'css':
    case 'scss': return 'css';
    case 'html': return 'html';
    case 'json': return 'json';
    default: return 'text';
  }
};

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'jsx':
    case 'tsx':
      return <Code2 className="w-3.5 h-3.5 text-[#22d3ee]" />;
    case 'js':
    case 'ts':
      return <FileCode2 className="w-3.5 h-3.5 text-[#fbbf24]" />;
    case 'css':
      return <FileType className="w-3.5 h-3.5 text-[#f472b6]" />;
    case 'json':
      return <FileJson className="w-3.5 h-3.5 text-[#a3e635]" />;
    case 'html':
      return <FileCode2 className="w-3.5 h-3.5 text-[#f97316]" />;
    default:
      return <FileCode2 className="w-3.5 h-3.5 text-[#71717a]" />;
  }
};

export const Editor = () => {
  const { files, activeFileId, updateFileContent, setActiveFile } = useFilesStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const [lineNumbers, setLineNumbers] = useState<number[]>([1]);

  const activeFile = activeFileId ? files[activeFileId] : null;
  const openFiles = Object.values(files).filter(f => f.type === 'file').slice(0, 6);

  useEffect(() => {
    if (activeFile?.content) {
      const lines = activeFile.content.split('\n').length;
      setLineNumbers(Array.from({ length: Math.max(lines, 30) }, (_, i) => i + 1));
    } else {
      setLineNumbers(Array.from({ length: 30 }, (_, i) => i + 1));
    }
  }, [activeFile?.content]);

  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (activeFileId) {
      updateFileContent(activeFileId, e.target.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      
      if (activeFileId) {
        updateFileContent(activeFileId, newValue);
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
          }
        }, 0);
      }
    }
  };

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0d]">
        <div className="nf-empty-state">
          <div className="nf-empty-icon nf-animate-float">
            <Sparkles className="w-8 h-8 text-[#8b5cf6]" />
          </div>
          <p className="nf-empty-title">No file selected</p>
          <p className="nf-empty-description">
            Select a file from the explorer to start editing
          </p>
        </div>
      </div>
    );
  }

  const language = getLanguage(activeFile.name);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0d]">
      {/* Tabs */}
      <div className={cn(
        "h-11 flex items-center bg-[#050507]",
        "border-b border-[rgba(255,255,255,0.06)]",
        "overflow-x-auto scrollbar-hide"
      )}>
        {openFiles.map((file) => (
          <button
            key={file.id}
            className={cn(
              "group flex items-center gap-2 h-full px-3 sm:px-4 text-[12px] sm:text-[13px] border-r border-[rgba(255,255,255,0.04)]",
              "transition-all duration-200 whitespace-nowrap relative shrink-0",
              file.id === activeFileId 
                ? "bg-[#0a0a0d] text-[#fafafa]" 
                : "text-[#71717a] hover:text-[#a1a1aa] hover:bg-[rgba(255,255,255,0.02)]"
            )}
            onClick={() => setActiveFile(file.id)}
          >
            {file.id === activeFileId && (
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#8b5cf6] to-[#22d3ee]" />
            )}
            {getFileIcon(file.name)}
            <span className="hidden sm:inline">{file.name}</span>
            <span className="sm:hidden">{file.name.split('.')[0].slice(0, 6)}</span>
            <X className={cn(
              "w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 hover:text-[#fafafa]",
              "transition-opacity duration-200 hidden sm:block"
            )} />
          </button>
        ))}
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers - Hide on mobile */}
        <div className={cn(
          "hidden sm:block w-12 lg:w-16 bg-[#050507] border-r border-[rgba(255,255,255,0.04)]",
          "py-4 select-none overflow-hidden shrink-0"
        )}>
          {lineNumbers.map((num) => (
            <div 
              key={num} 
              className="text-[12px] lg:text-[13px] leading-7 text-right pr-3 lg:pr-4 nf-font-code text-[#3f3f46]"
            >
              {num}
            </div>
          ))}
        </div>

        {/* Code Area */}
        <div className="flex-1 relative overflow-hidden bg-[#0a0a0d]">
          {/* Syntax Highlighted Layer */}
          <pre
            ref={highlightRef}
            className={cn(
              "absolute inset-0 p-3 sm:p-4 overflow-auto pointer-events-none",
              "nf-font-code text-[12px] sm:text-[13px] leading-7 whitespace-pre-wrap break-words",
              "text-[#d4d4d8]"
            )}
            dangerouslySetInnerHTML={{
              __html: highlightCode(activeFile.content || '', language),
            }}
          />

          {/* Editable Textarea */}
          <textarea
            ref={textareaRef}
            value={activeFile.content || ''}
            onChange={handleChange}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            className={cn(
              "absolute inset-0 p-3 sm:p-4 resize-none outline-none",
              "nf-font-code text-[12px] sm:text-[13px] leading-7",
              "bg-transparent text-transparent caret-[#8b5cf6]",
              "whitespace-pre-wrap break-words overflow-auto",
              "selection:bg-[rgba(139,92,246,0.3)]"
            )}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>
      </div>
    </div>
  );
};
