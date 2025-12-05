import { useState, useRef } from 'react';
import { 
  Send, 
  Loader2, 
  FileEdit, 
  FilePlus,
  Wand2,
  MessageSquare,
  ChevronDown,
  Bot,
  Zap,
  Sparkles
} from 'lucide-react';
import { useFilesStore } from '@/store/filesStore';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AIAction = 'modify' | 'create' | 'explain' | 'refactor';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const actions: { key: AIAction; label: string; icon: React.ReactNode; desc: string }[] = [
  { key: 'modify', label: 'Modify', icon: <FileEdit className="w-4 h-4" />, desc: 'Edit the current file' },
  { key: 'create', label: 'Create', icon: <FilePlus className="w-4 h-4" />, desc: 'Generate a new file' },
  { key: 'explain', label: 'Explain', icon: <MessageSquare className="w-4 h-4" />, desc: 'Explain the code' },
  { key: 'refactor', label: 'Refactor', icon: <Wand2 className="w-4 h-4" />, desc: 'Improve code quality' },
];

export const AiPanel = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<AIAction>('modify');
  const [messages, setMessages] = useState<Message[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { files, activeFileId, updateFileContent, createFile } = useFilesStore();
  const activeFile = activeFileId ? files[activeFileId] : null;

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;
    
    const userMessage = prompt;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setPrompt('');
    setIsLoading(true);

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
          prompt: userMessage,
          context,
          allFiles: allFilesContext,
        },
      });

      if (error) throw error;

      let responseText = '';
      if (data.type === 'code' && data.code) {
        if (action === 'create' && data.fileName) {
          createFile(data.fileName, 'src', data.code);
          toast.success(`Created: ${data.fileName}`);
        } else if (activeFileId && (action === 'modify' || action === 'refactor')) {
          updateFileContent(activeFileId, data.code);
          toast.success('File updated!');
        }
        responseText = data.explanation || 'Done! Changes applied successfully.';
      } else if (data.type === 'explanation') {
        responseText = data.content;
      } else {
        responseText = data.content || 'AI response received.';
      }

      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (error) {
      console.error('AI Error:', error);
      toast.error('AI request failed');
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Failed to get AI response.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#111113] border-r border-[#1E1E1E]">
      {/* Header */}
      <div className="px-4 py-4 border-b border-[#1E1E1E]">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -inset-0.5 rounded-xl bg-[#7C3AED] opacity-30 blur-sm -z-10" />
          </div>
          <div>
            <h2 className="font-semibold text-[#F5F5F5] text-sm">NeoForge AI</h2>
            <p className="text-xs text-[#71717A]">Your coding assistant</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {actions.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setAction(key)}
              className={cn(
                "flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all",
                action === key
                  ? "bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/40"
                  : "bg-[#18181A] text-[#71717A] border border-[#27272A] hover:border-[#3F3F46] hover:text-[#A1A1AA]"
              )}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-[#18181A] flex items-center justify-center mx-auto mb-4 border border-[#27272A]">
              <Bot className="w-8 h-8 text-[#52525B]" />
            </div>
            <p className="text-sm text-[#71717A] mb-2">
              Describe what you want to build
            </p>
            <p className="text-xs text-[#52525B]">
              I can help you modify, create, or explain code
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={msg.role === 'user' ? 'pl-6' : 'pr-6'}>
              <div
                className={cn(
                  "rounded-xl p-3.5 text-[13px] leading-relaxed",
                  msg.role === 'user'
                    ? "bg-[#7C3AED]/15 text-[#E4E4E7] border border-[#7C3AED]/20"
                    : "bg-[#18181A] text-[#A1A1AA] border border-[#27272A]"
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#27272A]">
                    <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
                    <span className="text-xs font-medium text-[#7C3AED]">NeoForge AI</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex items-center gap-2 text-[#71717A] text-sm pl-4">
            <Loader2 className="w-4 h-4 animate-spin text-[#7C3AED]" />
            <span>Thinking...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#1E1E1E]">
        {activeFile && (
          <div className="flex items-center gap-2 mb-3 px-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span className="text-xs text-[#71717A]">
              Working on: <span className="text-[#A1A1AA]">{activeFile.name}</span>
            </span>
          </div>
        )}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe the changes you want..."
            className="w-full bg-[#18181A] border border-[#27272A] rounded-xl px-4 py-3 pr-12 text-sm text-[#F5F5F5] placeholder:text-[#52525B] resize-none focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED]/30 transition-all min-h-[100px]"
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={isLoading || !prompt.trim()}
            className={cn(
              "absolute right-3 bottom-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all",
              prompt.trim() && !isLoading
                ? "bg-[#7C3AED] text-white hover:bg-[#8B5CF6] shadow-[0_0_15px_rgba(124,58,237,0.3)]"
                : "bg-[#27272A] text-[#52525B]"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <div className="flex justify-end mt-2">
          <span className="text-[10px] text-[#52525B]">Enter to send</span>
        </div>
      </div>
    </div>
  );
};
