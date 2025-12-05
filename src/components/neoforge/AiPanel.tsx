import { useState, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  FileEdit, 
  FilePlus,
  Wand2,
  MessageSquare,
  ChevronDown,
  Bot
} from 'lucide-react';
import { useFilesStore } from '@/store/filesStore';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AIAction = 'modify' | 'create' | 'explain' | 'refactor';

const actions: { key: AIAction; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: 'modify', label: 'Modify File', icon: <FileEdit className="w-4 h-4" />, desc: 'Edit the current file' },
  { key: 'create', label: 'Create File', icon: <FilePlus className="w-4 h-4" />, desc: 'Generate a new file' },
  { key: 'explain', label: 'Explain', icon: <MessageSquare className="w-4 h-4" />, desc: 'Explain the code' },
  { key: 'refactor', label: 'Refactor', icon: <Wand2 className="w-4 h-4" />, desc: 'Improve code quality' },
];

export const AiPanel = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<AIAction>('modify');
  const [response, setResponse] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { files, activeFileId, updateFileContent, createFile } = useFilesStore();
  const activeFile = activeFileId ? files[activeFileId] : null;

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setResponse(null);

    try {
      const context = activeFile ? {
        fileName: activeFile.name,
        filePath: activeFile.path,
        fileContent: activeFile.content,
      } : null;

      const allFilesContext = Object.values(files)
        .filter(f => f.type === 'file')
        .map(f => `--- ${f.path} ---\n${f.content}`)
        .join('\n\n');

      const { data, error } = await supabase.functions.invoke('neoforge-ai', {
        body: {
          action,
          prompt,
          context,
          allFiles: allFilesContext,
        },
      });

      if (error) throw error;

      if (data.type === 'code' && data.code) {
        if (action === 'create' && data.fileName) {
          createFile(data.fileName, 'src', data.code);
          toast.success(`Created: ${data.fileName}`);
        } else if (activeFileId && (action === 'modify' || action === 'refactor')) {
          updateFileContent(activeFileId, data.code);
          toast.success('File updated!');
        }
        setResponse(data.explanation || 'Done!');
      } else if (data.type === 'explanation') {
        setResponse(data.content);
      } else {
        setResponse(data.content || 'AI response received.');
      }

      setPrompt('');
    } catch (error) {
      console.error('AI Error:', error);
      toast.error('AI request failed');
      setResponse('Error: Failed to get AI response.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const currentAction = actions.find(a => a.key === action)!;

  return (
    <div className="h-full flex flex-col bg-[#111111] border-l border-[#27272A]">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#27272A]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[13px] font-medium text-[#F5F5F5]">AI Assistant</span>
        </div>
        <span className="text-[11px] text-[#71717A] bg-[#1A1A1A] px-2 py-1 rounded">DeepSeek</span>
      </div>

      {/* Response Area */}
      <div className="flex-1 overflow-auto p-4">
        {response ? (
          <div className="bg-[#1A1A1A] rounded-xl p-4 border border-[#27272A]">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED]/20 to-[#38BDF8]/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <div className="flex-1 text-[14px] text-[#E1E4E8] leading-relaxed whitespace-pre-wrap">
                {response}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7C3AED]/20 to-[#38BDF8]/20 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-[#7C3AED]" />
            </div>
            <h3 className="text-[#F5F5F5] font-medium mb-2">AI-Powered Coding</h3>
            <p className="text-[#71717A] text-sm">
              Describe what you want to build or modify, and let AI handle the code.
            </p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-[#27272A]">
        {/* Action Selector */}
        <div className="relative mb-3">
          <button
            onClick={() => setShowActions(!showActions)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1A1A1A] border border-[#27272A] hover:border-[#3F3F46] transition-colors w-full"
          >
            {currentAction.icon}
            <span className="text-[13px] text-[#F5F5F5] flex-1 text-left">{currentAction.label}</span>
            <ChevronDown className={cn("w-4 h-4 text-[#71717A] transition-transform", showActions && "rotate-180")} />
          </button>

          {showActions && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#111111] border border-[#27272A] rounded-xl overflow-hidden shadow-lg z-10">
              {actions.map((a) => (
                <button
                  key={a.key}
                  onClick={() => {
                    setAction(a.key);
                    setShowActions(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-3 text-left transition-colors",
                    action === a.key 
                      ? "bg-[#7C3AED]/10 text-[#F5F5F5]" 
                      : "text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-[#F5F5F5]"
                  )}
                >
                  {a.icon}
                  <div>
                    <div className="text-[13px] font-medium">{a.label}</div>
                    <div className="text-[11px] text-[#71717A]">{a.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Input */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe changes you want..."
            className="w-full min-h-[100px] max-h-[200px] p-4 pr-12 bg-[#1A1A1A] border border-[#27272A] rounded-xl text-[14px] text-[#F5F5F5] placeholder-[#71717A] resize-none focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !prompt.trim()}
            className={cn(
              "absolute right-3 bottom-3 p-2.5 rounded-lg transition-all",
              prompt.trim() && !isLoading
                ? "bg-[#7C3AED] text-white hover:bg-[#8B5CF6] shadow-[0_0_20px_rgba(124,58,237,0.25)]"
                : "bg-[#27272A] text-[#71717A]"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Context Info */}
        <div className="flex items-center justify-between mt-3 text-[11px] text-[#71717A]">
          {activeFile && (
            <span>
              File: <span className="text-[#A1A1AA]">{activeFile.name}</span>
            </span>
          )}
          <span>⌘+Enter to send</span>
        </div>
      </div>
    </div>
  );
};
