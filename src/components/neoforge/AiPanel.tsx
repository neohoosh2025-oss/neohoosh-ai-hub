import { useState, useRef, useEffect } from 'react';
import { useFilesStore, FileOperation } from '@/store/filesStore';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { 
  Sparkles, Send, FileEdit, FilePlus, MessageSquare, 
  RefreshCw, Wand2, Loader2, Copy, Check, Rocket,
  Bug, FolderPlus, Trash2, ChevronDown, Zap
} from 'lucide-react';
import { toast } from 'sonner';

type ActionType = 'modify' | 'create' | 'explain' | 'refactor' | 'generate' | 'scaffold' | 'fix' | 'chat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  operations?: FileOperation[];
  timestamp: Date;
}

const actions: { id: ActionType; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-4 h-4" />, description: 'Ask anything' },
  { id: 'modify', label: 'Modify', icon: <FileEdit className="w-4 h-4" />, description: 'Edit current file' },
  { id: 'create', label: 'Create', icon: <FilePlus className="w-4 h-4" />, description: 'Create new file' },
  { id: 'generate', label: 'Generate', icon: <Wand2 className="w-4 h-4" />, description: 'Generate component' },
  { id: 'scaffold', label: 'Scaffold', icon: <Rocket className="w-4 h-4" />, description: 'Create project' },
  { id: 'refactor', label: 'Refactor', icon: <RefreshCw className="w-4 h-4" />, description: 'Improve code' },
  { id: 'fix', label: 'Fix', icon: <Bug className="w-4 h-4" />, description: 'Fix bugs' },
  { id: 'explain', label: 'Explain', icon: <Sparkles className="w-4 h-4" />, description: 'Explain code' },
];

export const AiPanel = () => {
  const { files, activeFileId, applyOperations, setActiveFile, getFileByPath } = useFilesStore();
  const [selectedAction, setSelectedAction] = useState<ActionType>('chat');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showActions, setShowActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeFile = activeFileId ? files[activeFileId] : null;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [prompt]);

  const getAllFilesContext = () => {
    return Object.values(files)
      .filter(f => f.type === 'file')
      .map(f => `${f.path}:\n\`\`\`\n${f.content.slice(0, 500)}${f.content.length > 500 ? '...' : ''}\n\`\`\``)
      .join('\n\n');
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: prompt, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsLoading(true);

    try {
      const context = activeFile ? {
        fileName: activeFile.name,
        filePath: activeFile.path,
        fileContent: activeFile.content,
      } : undefined;

      const { data, error } = await supabase.functions.invoke('neoforge-ai', {
        body: {
          action: selectedAction,
          prompt: prompt,
          context,
          allFiles: getAllFilesContext(),
        },
      });

      if (error) throw error;

      if (data.type === 'error') {
        throw new Error(data.error);
      }

      let assistantContent = '';
      let operations: FileOperation[] = [];

      if (data.type === 'explanation') {
        assistantContent = data.content;
      } else if (data.type === 'operations') {
        operations = data.operations || [];
        assistantContent = data.summary || 'Changes ready to apply!';
        
        if (data.nextSteps?.length > 0) {
          assistantContent += '\n\n**Next steps:**\n' + data.nextSteps.map((s: string) => `• ${s}`).join('\n');
        }
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent,
        operations,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Auto-apply operations if there are any
      if (operations.length > 0) {
        applyOperations(operations);
        
        // Open the first created/modified file
        const firstFileOp = operations.find(op => op.type === 'create_file' || op.type === 'update_file');
        if (firstFileOp) {
          setTimeout(() => {
            const file = getFileByPath(firstFileOp.path);
            if (file) {
              setActiveFile(file.id);
            }
          }, 100);
        }
        
        toast.success(`${operations.length} file operation(s) applied!`);
      }

    } catch (error) {
      console.error('AI error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to process request'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('AI request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderOperationsList = (operations: FileOperation[]) => (
    <div className="mt-3 space-y-2">
      <div className="text-xs text-[#71717A] uppercase tracking-wider mb-2">File Operations</div>
      {operations.map((op, i) => (
        <div key={i} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-[#18181A]">
          {op.type === 'create_file' && <FilePlus className="w-4 h-4 text-green-400" />}
          {op.type === 'create_folder' && <FolderPlus className="w-4 h-4 text-blue-400" />}
          {op.type === 'update_file' && <FileEdit className="w-4 h-4 text-yellow-400" />}
          {op.type === 'delete_file' && <Trash2 className="w-4 h-4 text-red-400" />}
          <span className="text-[#A1A1AA] truncate">{op.path}</span>
        </div>
      ))}
    </div>
  );

  const currentAction = actions.find(a => a.id === selectedAction);

  return (
    <div className="h-full flex flex-col bg-[#111113] border-r border-[#1F1F22]">
      {/* Header */}
      <div className="p-4 border-b border-[#1F1F22]">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-[#F5F5F5] font-semibold text-sm">NeoForge AI</h2>
            <p className="text-[#71717A] text-xs">Autonomous Builder</p>
          </div>
        </div>

        {/* Action Selector */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className={cn(
              "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-all",
              "bg-[#18181A] border border-[#27272A] hover:border-[#7C3AED]/50"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-[#7C3AED]">{currentAction?.icon}</span>
              <span className="text-[#F5F5F5]">{currentAction?.label}</span>
              <span className="text-[#52525B] text-xs">— {currentAction?.description}</span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-[#71717A] transition-transform", showActions && "rotate-180")} />
          </button>
          
          {showActions && (
            <div className="absolute top-full left-0 right-0 mt-1 py-1 bg-[#18181A] border border-[#27272A] rounded-lg shadow-xl z-10">
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    setSelectedAction(action.id);
                    setShowActions(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors",
                    selectedAction === action.id 
                      ? "bg-[#7C3AED]/10 text-[#7C3AED]" 
                      : "text-[#A1A1AA] hover:bg-[#27272A]"
                  )}
                >
                  {action.icon}
                  <span>{action.label}</span>
                  <span className="text-[#52525B] text-xs ml-auto">{action.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 nf-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#18181A] border border-[#27272A] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#7C3AED]" />
            </div>
            <p className="text-[#71717A] text-sm mb-2">Start building with AI</p>
            <p className="text-[#52525B] text-xs max-w-[200px] mx-auto">
              Create projects, generate components, modify files, and more.
            </p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn(
              "max-w-[90%] rounded-2xl p-3 text-sm",
              msg.role === 'user' 
                ? "bg-[#7C3AED] text-white rounded-br-md" 
                : "bg-[#18181A] text-[#E4E4E7] border border-[#27272A] rounded-bl-md"
            )}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              
              {msg.operations && msg.operations.length > 0 && renderOperationsList(msg.operations)}
              
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#27272A]">
                  <button
                    onClick={() => copyToClipboard(msg.content, i)}
                    className="text-[#71717A] hover:text-[#F5F5F5] transition-colors"
                  >
                    {copiedIndex === i ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-[#52525B] text-xs">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#18181A] border border-[#27272A] rounded-2xl rounded-bl-md p-4">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#7C3AED] animate-spin" />
                <span className="text-[#71717A] text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Active File Indicator */}
      {activeFile && (selectedAction === 'modify' || selectedAction === 'refactor' || selectedAction === 'explain' || selectedAction === 'fix') && (
        <div className="px-4 py-2 border-t border-[#1F1F22]">
          <div className="flex items-center gap-2 text-xs text-[#71717A]">
            <FileEdit className="w-3.5 h-3.5" />
            <span>Working on:</span>
            <span className="text-[#A1A1AA] font-mono">{activeFile.name}</span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-[#1F1F22]">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={
              selectedAction === 'scaffold' ? "Describe your project (e.g., 'A todo app with dark theme')..." :
              selectedAction === 'generate' ? "Describe the component to generate..." :
              selectedAction === 'create' ? "What file should I create?" :
              selectedAction === 'modify' ? "What changes should I make?" :
              "Ask anything or describe what you want to build..."
            }
            className={cn(
              "w-full resize-none rounded-xl px-4 py-3 pr-12 text-sm",
              "bg-[#18181A] border border-[#27272A] text-[#F5F5F5]",
              "placeholder:text-[#52525B]",
              "focus:outline-none focus:border-[#7C3AED]/50 focus:ring-1 focus:ring-[#7C3AED]/20",
              "transition-all min-h-[48px] max-h-[150px]"
            )}
            rows={1}
          />
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            className={cn(
              "absolute right-2 bottom-2 p-2 rounded-lg transition-all",
              prompt.trim() && !isLoading
                ? "bg-[#7C3AED] text-white hover:bg-[#7C3AED]/90"
                : "bg-[#27272A] text-[#52525B] cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-[#52525B] text-xs">Shift + Enter for new line</span>
          <span className="text-[#52525B] text-xs">Powered by Gemini</span>
        </div>
      </div>
    </div>
  );
};
