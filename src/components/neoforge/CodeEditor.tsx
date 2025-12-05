import { useEffect, useRef, useState } from 'react';
import { useFilesStore } from '@/store/filesStore';
import { cn } from '@/lib/utils';
import { FileCode, X } from 'lucide-react';

// Simple syntax highlighting for common patterns
const highlightCode = (code: string, language: string): string => {
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Comments
  highlighted = highlighted.replace(
    /(\/\/.*$)/gm,
    '<span class="text-emerald-500/70">$1</span>'
  );
  highlighted = highlighted.replace(
    /(\/\*[\s\S]*?\*\/)/g,
    '<span class="text-emerald-500/70">$1</span>'
  );

  // Strings
  highlighted = highlighted.replace(
    /(`[^`]*`)/g,
    '<span class="text-amber-400">$1</span>'
  );
  highlighted = highlighted.replace(
    /("[^"]*")/g,
    '<span class="text-amber-400">$1</span>'
  );
  highlighted = highlighted.replace(
    /('[^']*')/g,
    '<span class="text-amber-400">$1</span>'
  );

  // Keywords
  const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'import', 'export', 'from', 'default', 'class', 'extends', 'new', 'this', 'async', 'await', 'try', 'catch'];
  keywords.forEach((kw) => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'g');
    highlighted = highlighted.replace(regex, '<span class="text-purple-400">$1</span>');
  });

  // Numbers
  highlighted = highlighted.replace(
    /\b(\d+)\b/g,
    '<span class="text-cyan-400">$1</span>'
  );

  // HTML tags (for HTML files)
  if (language === 'html') {
    highlighted = highlighted.replace(
      /(&lt;\/?)([\w-]+)/g,
      '$1<span class="text-red-400">$2</span>'
    );
  }

  // CSS properties
  if (language === 'css') {
    highlighted = highlighted.replace(
      /([\w-]+)(\s*:)/g,
      '<span class="text-cyan-400">$1</span>$2'
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

export const CodeEditor = () => {
  const { files, activeFileId, updateFileContent, setActiveFile } = useFilesStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const [lineNumbers, setLineNumbers] = useState<number[]>([1]);

  const activeFile = activeFileId ? files[activeFileId] : null;
  const openTabs = Object.values(files).filter(
    (f) => f.type === 'file' && (f.id === activeFileId)
  );

  useEffect(() => {
    if (activeFile?.content) {
      const lines = activeFile.content.split('\n').length;
      setLineNumbers(Array.from({ length: lines }, (_, i) => i + 1));
    } else {
      setLineNumbers([1]);
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
        // Set cursor position after the tab
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
      <div className="h-full flex items-center justify-center bg-background text-muted-foreground">
        <div className="text-center">
          <FileCode className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">Select a file to edit</p>
          <p className="text-sm mt-2">Use the file explorer on the left</p>
        </div>
      </div>
    );
  }

  const language = getLanguage(activeFile.name);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Tabs */}
      <div className="flex items-center bg-card border-b border-border overflow-x-auto">
        {activeFile && (
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 border-r border-border cursor-pointer",
              "bg-background text-foreground"
            )}
          >
            <FileCode className="w-4 h-4 text-yellow-400" />
            <span className="text-sm">{activeFile.name}</span>
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div className="bg-card/50 text-muted-foreground text-right py-4 px-2 select-none overflow-hidden border-r border-border/50">
          {lineNumbers.map((num) => (
            <div key={num} className="text-xs leading-6 font-mono">
              {num}
            </div>
          ))}
        </div>

        {/* Code Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Syntax Highlighted Overlay */}
          <pre
            ref={highlightRef}
            className="absolute inset-0 p-4 overflow-auto pointer-events-none font-mono text-sm leading-6 whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{
              __html: highlightCode(activeFile.content || '', language),
            }}
          />

          {/* Actual Textarea */}
          <textarea
            ref={textareaRef}
            value={activeFile.content || ''}
            onChange={handleChange}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            className={cn(
              "absolute inset-0 p-4 resize-none outline-none font-mono text-sm leading-6",
              "bg-transparent text-transparent caret-white",
              "whitespace-pre-wrap break-words overflow-auto"
            )}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 bg-card border-t border-border text-xs text-muted-foreground">
        <span>{activeFile.path}</span>
        <div className="flex items-center gap-4">
          <span>{language.toUpperCase()}</span>
          <span>Lines: {lineNumbers.length}</span>
        </div>
      </div>
    </div>
  );
};
