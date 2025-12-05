import { useEffect, useRef, useState } from 'react';
import { useFilesStore } from '@/store/filesStore';
import { cn } from '@/lib/utils';
import { X, FileCode2 } from 'lucide-react';

// Syntax highlighting for code
const highlightCode = (code: string, language: string): string => {
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Comments
  highlighted = highlighted.replace(
    /(\/\/.*$)/gm,
    '<span style="color: #6A737D">$1</span>'
  );
  highlighted = highlighted.replace(
    /(\/\*[\s\S]*?\*\/)/g,
    '<span style="color: #6A737D">$1</span>'
  );

  // Strings
  highlighted = highlighted.replace(
    /(`[^`]*`)/g,
    '<span style="color: #9ECBFF">$1</span>'
  );
  highlighted = highlighted.replace(
    /("[^"]*")/g,
    '<span style="color: #9ECBFF">$1</span>'
  );
  highlighted = highlighted.replace(
    /('[^']*')/g,
    '<span style="color: #9ECBFF">$1</span>'
  );

  // Keywords
  const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'from', 'default', 'class', 'extends', 'new', 'this', 'async', 'await', 'try', 'catch', 'throw'];
  keywords.forEach((kw) => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'g');
    highlighted = highlighted.replace(regex, '<span style="color: #F97583">$1</span>');
  });

  // Functions
  highlighted = highlighted.replace(
    /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,
    '<span style="color: #B392F0">$1</span>'
  );

  // Numbers
  highlighted = highlighted.replace(
    /\b(\d+)\b/g,
    '<span style="color: #79B8FF">$1</span>'
  );

  // HTML tags
  if (language === 'html') {
    highlighted = highlighted.replace(
      /(&lt;\/?)([\w-]+)/g,
      '$1<span style="color: #85E89D">$2</span>'
    );
    highlighted = highlighted.replace(
      /([\w-]+)(=)/g,
      '<span style="color: #FFAB70">$1</span>$2'
    );
  }

  // CSS
  if (language === 'css') {
    highlighted = highlighted.replace(
      /([\w-]+)(\s*:)/g,
      '<span style="color: #79B8FF">$1</span>$2'
    );
    highlighted = highlighted.replace(
      /([.#][\w-]+)/g,
      '<span style="color: #B392F0">$1</span>'
    );
  }

  return highlighted;
};

const getLanguage = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'css':
    case 'scss':
      return 'css';
    case 'html':
      return 'html';
    case 'json':
      return 'json';
    default:
      return 'text';
  }
};

export const Editor = () => {
  const { files, activeFileId, updateFileContent, setActiveFile } = useFilesStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const [lineNumbers, setLineNumbers] = useState<number[]>([1]);

  const activeFile = activeFileId ? files[activeFileId] : null;

  // Get open files (for tabs - just show active for now)
  const openFiles = activeFile ? [activeFile] : [];

  useEffect(() => {
    if (activeFile?.content) {
      const lines = activeFile.content.split('\n').length;
      setLineNumbers(Array.from({ length: Math.max(lines, 20) }, (_, i) => i + 1));
    } else {
      setLineNumbers(Array.from({ length: 20 }, (_, i) => i + 1));
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
      <div className="h-full flex items-center justify-center bg-[#0D0D0D]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#1A1A1A] flex items-center justify-center">
            <FileCode2 className="w-8 h-8 text-[#71717A]" />
          </div>
          <p className="text-[#A1A1AA] text-lg font-medium">No file selected</p>
          <p className="text-[#71717A] text-sm mt-1">Select a file from the explorer</p>
        </div>
      </div>
    );
  }

  const language = getLanguage(activeFile.name);

  return (
    <div className="h-full flex flex-col bg-[#0D0D0D]">
      {/* Tabs */}
      <div className="h-10 flex items-center bg-[#111111] border-b border-[#27272A] px-2">
        {openFiles.map((file) => (
          <div
            key={file.id}
            className={cn(
              "group flex items-center gap-2 h-8 px-3 rounded-t-lg cursor-pointer transition-all",
              file.id === activeFileId 
                ? "bg-[#0D0D0D] text-[#F5F5F5] border-t-2 border-t-[#7C3AED]" 
                : "text-[#A1A1AA] hover:text-[#F5F5F5]"
            )}
            onClick={() => setActiveFile(file.id)}
          >
            <FileCode2 className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-[13px]">{file.name}</span>
          </div>
        ))}
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div className="w-12 bg-[#0D0D0D] border-r border-[#1F1F23] py-4 select-none overflow-hidden">
          {lineNumbers.map((num) => (
            <div 
              key={num} 
              className="text-[13px] leading-6 text-right pr-3 neoforge-code text-[#4B5563]"
            >
              {num}
            </div>
          ))}
        </div>

        {/* Code Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Syntax Highlighted Layer */}
          <pre
            ref={highlightRef}
            className="absolute inset-0 p-4 overflow-auto pointer-events-none neoforge-code text-[13px] leading-6 whitespace-pre-wrap break-words text-[#E1E4E8]"
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
              "absolute inset-0 p-4 resize-none outline-none neoforge-code text-[13px] leading-6",
              "bg-transparent text-transparent caret-[#7C3AED]",
              "whitespace-pre-wrap break-words overflow-auto"
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
