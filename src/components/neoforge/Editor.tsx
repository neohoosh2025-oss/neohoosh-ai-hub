import { useEffect, useRef, useState } from 'react';
import { useFilesStore } from '@/store/filesStore';
import { cn } from '@/lib/utils';
import { X, FileCode2, Code2, FileJson, FileType } from 'lucide-react';

const highlightCode = (code: string, language: string): string => {
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Comments
  highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span style="color: #6A737D">$1</span>');
  highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6A737D">$1</span>');

  // Strings
  highlighted = highlighted.replace(/(`[^`]*`)/g, '<span style="color: #98C379">$1</span>');
  highlighted = highlighted.replace(/("[^"]*")/g, '<span style="color: #98C379">$1</span>');
  highlighted = highlighted.replace(/('[^']*')/g, '<span style="color: #98C379">$1</span>');

  // Keywords
  const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'from', 'default', 'class', 'extends', 'new', 'this', 'async', 'await', 'try', 'catch', 'throw'];
  keywords.forEach((kw) => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'g');
    highlighted = highlighted.replace(regex, '<span style="color: #C678DD">$1</span>');
  });

  // Functions
  highlighted = highlighted.replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g, '<span style="color: #61AFEF">$1</span>');

  // Numbers
  highlighted = highlighted.replace(/\b(\d+)\b/g, '<span style="color: #D19A66">$1</span>');

  // JSX tags
  highlighted = highlighted.replace(/(&lt;\/?)([\w-]+)/g, '$1<span style="color: #E06C75">$2</span>');

  // CSS
  if (language === 'css') {
    highlighted = highlighted.replace(/([\w-]+)(\s*:)/g, '<span style="color: #56B6C2">$1</span>$2');
    highlighted = highlighted.replace(/([.#][\w-]+)/g, '<span style="color: #E5C07B">$1</span>');
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
      return <Code2 className="w-3.5 h-3.5 text-[#61DAFB]" />;
    case 'js':
    case 'ts':
      return <FileCode2 className="w-3.5 h-3.5 text-[#F7DF1E]" />;
    case 'css':
      return <FileType className="w-3.5 h-3.5 text-[#38BDF8]" />;
    case 'json':
      return <FileJson className="w-3.5 h-3.5 text-[#F59E0B]" />;
    case 'html':
      return <FileCode2 className="w-3.5 h-3.5 text-[#E34F26]" />;
    default:
      return <FileCode2 className="w-3.5 h-3.5 text-[#71717A]" />;
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
      setLineNumbers(Array.from({ length: Math.max(lines, 25) }, (_, i) => i + 1));
    } else {
      setLineNumbers(Array.from({ length: 25 }, (_, i) => i + 1));
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
      <div className="h-full flex items-center justify-center bg-[#1F1F22]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#18181A] border border-[#27272A] flex items-center justify-center">
            <FileCode2 className="w-10 h-10 text-[#52525B]" />
          </div>
          <p className="text-[#71717A] text-sm">Select a file to start editing</p>
        </div>
      </div>
    );
  }

  const language = getLanguage(activeFile.name);

  return (
    <div className="h-full flex flex-col bg-[#1F1F22]">
      {/* Tabs */}
      <div className="h-10 flex items-center bg-[#18181A] border-b border-[#1E1E1E] overflow-x-auto">
        {openFiles.map((file) => (
          <button
            key={file.id}
            className={cn(
              "group flex items-center gap-2 h-full px-4 text-[13px] border-r border-[#1E1E1E] transition-all whitespace-nowrap",
              file.id === activeFileId 
                ? "bg-[#1F1F22] text-[#F5F5F5] border-b-2 border-b-[#7C3AED]" 
                : "text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#1F1F22]/50"
            )}
            onClick={() => setActiveFile(file.id)}
          >
            {getFileIcon(file.name)}
            <span>{file.name}</span>
            <X className="w-3 h-3 opacity-0 group-hover:opacity-100 hover:text-[#F5F5F5] transition-opacity ml-1" />
          </button>
        ))}
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div className="w-14 bg-[#18181A] border-r border-[#1E1E1E] py-4 select-none overflow-hidden shrink-0">
          {lineNumbers.map((num) => (
            <div 
              key={num} 
              className="text-[13px] leading-6 text-right pr-4 nf-font-code text-[#52525B]"
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
            className="absolute inset-0 p-4 overflow-auto pointer-events-none nf-font-code text-[14px] leading-6 whitespace-pre-wrap break-words text-[#ABB2BF]"
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
              "absolute inset-0 p-4 resize-none outline-none nf-font-code text-[14px] leading-6",
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
