import { useState, useRef, useEffect } from 'react';
import { useFilesStore, FileOperation } from '@/store/filesStore';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { 
  Sparkles, Send, FileEdit, FilePlus, MessageSquare, 
  RefreshCw, Wand2, Loader2, Copy, Check, Rocket,
  Bug, FolderPlus, Trash2, ChevronDown, Zap, Bot, User
} from 'lucide-react';
import { toast } from 'sonner';

type ActionType = 'modify' | 'create' | 'explain' | 'refactor' | 'generate' | 'scaffold' | 'fix' | 'chat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  operations?: FileOperation[];
  timestamp: Date;
}

const actions: { id: ActionType; label: string; icon: React.ReactNode; description: string; color: string }[] = [
  { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-4 h-4" />, description: 'Ask anything', color: '#8b5cf6' },
  { id: 'modify', label: 'Modify', icon: <FileEdit className="w-4 h-4" />, description: 'Edit file', color: '#fbbf24' },
  { id: 'create', label: 'Create', icon: <FilePlus className="w-4 h-4" />, description: 'New file', color: '#34d399' },
  { id: 'generate', label: 'Generate', icon: <Wand2 className="w-4 h-4" />, description: 'Component', color: '#22d3ee' },
  { id: 'scaffold', label: 'Scaffold', icon: <Rocket className="w-4 h-4" />, description: 'Project', color: '#f472b6' },
  { id: 'refactor', label: 'Refactor', icon: <RefreshCw className="w-4 h-4" />, description: 'Improve', color: '#a78bfa' },
  { id: 'fix', label: 'Fix', icon: <Bug className="w-4 h-4" />, description: 'Debug', color: '#f87171' },
  { id: 'explain', label: 'Explain', icon: <Sparkles className="w-4 h-4" />, description: 'Explain', color: '#60a5fa' },
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

      if (operations.length > 0) {
        applyOperations(operations);
        
        const firstFileOp = operations.find(op => op.type === 'create_file' || op.type === 'update_file');
        if (firstFileOp) {
          setTimeout(() => {
            const file = getFileByPath(firstFileOp.path);
            if (file) {
              setActiveFile(file.id);
            }
          }, 100);
        }
        
        // Trigger preview rebuild
        setTimeout(() => {
          if ((window as any).neoforgeRefresh) {
            (window as any).neoforgeRefresh();
          }
        }, 200);
        
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
      <div className="text-[11px] text-[#71717a] uppercase tracking-wider mb-2">File Operations</div>
      {operations.map((op, i) => (
        <div key={i} className={cn(
          "flex items-center gap-2 text-sm p-2.5 rounded-lg",
          "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]"
        )}>
          {op.type === 'create_file' && <FilePlus className="w-4 h-4 text-[#34d399]" />}
          {op.type === 'create_folder' && <FolderPlus className="w-4 h-4 text-[#fbbf24]" />}
          {op.type === 'update_file' && <FileEdit className="w-4 h-4 text-[#22d3ee]" />}
          {op.type === 'delete_file' && <Trash2 className="w-4 h-4 text-[#f87171]" />}
          <span className="text-[#a1a1aa] truncate text-xs font-mono">{op.path}</span>
        </div>
      ))}
    </div>
  );

  const currentAction = actions.find(a => a.id === selectedAction);

  return (
    <div className="h-full flex flex-col bg-[#0a0a0d] border-r border-[rgba(255,255,255,0.06)]">
      {/* Header */}
      <div className="p-3 sm:p-4 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <div className={cn(
            "relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#22d3ee]",
            "shadow-[0_0_30px_rgba(139,92,246,0.4)]"
          )}>
            <Bot className="w-5 h-5 text-white" />
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#34d399] border-2 border-[#0a0a0d]" />
          </div>
          <div>
            <h2 className="text-[#fafafa] font-semibold text-sm flex items-center gap-2">
              NeoForge AI
              <span className="nf-badge">Pro</span>
            </h2>
            <p className="text-[#71717a] text-xs">Autonomous Builder</p>
          </div>
        </div>

        {/* Action Selector */}
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className={cn(
              "w-full flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm",
              "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]",
              "hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(139,92,246,0.3)]",
              "transition-all duration-200"
            )}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span style={{ color: currentAction?.color }}>{currentAction?.icon}</span>
              <span className="text-[#fafafa] font-medium">{currentAction?.label}</span>
              <span className="text-[#52525b] text-xs hidden sm:inline">— {currentAction?.description}</span>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-[#71717a] transition-transform duration-200",
              showActions && "rotate-180"
            )} />
          </button>
          
          {showActions && (
            <div className={cn(
              "absolute top-full left-0 right-0 mt-2 py-2 z-20",
              "bg-[#131316] border border-[rgba(255,255,255,0.08)]",
              "rounded-xl shadow-xl backdrop-blur-xl",
              "nf-animate-scale-in max-h-[50vh] overflow-y-auto"
            )}>
              {actions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => {
                    setSelectedAction(action.id);
                    setShowActions(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-200",
                    selectedAction === action.id 
                      ? "bg-[rgba(139,92,246,0.1)]" 
                      : "hover:bg-[rgba(255,255,255,0.04)]"
                  )}
                >
                  <span style={{ color: action.color }}>{action.icon}</span>
                  <span className={selectedAction === action.id ? "text-[#fafafa]" : "text-[#a1a1aa]"}>
                    {action.label}
                  </span>
                  <span className="text-[#52525b] text-xs ml-auto hidden sm:inline">{action.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="nf-empty-state py-16">
            <div className="nf-empty-icon nf-animate-float">
              <Sparkles className="w-8 h-8 text-[#8b5cf6]" />
            </div>
            <p className="nf-empty-title">Start building with AI</p>
            <p className="nf-empty-description">
              Create projects, generate components, modify files, and more.
            </p>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={cn(
              "flex gap-3 nf-animate-slide-up",
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              msg.role === 'user' 
                ? "bg-[rgba(139,92,246,0.15)]" 
                : "bg-gradient-to-br from-[#8b5cf6] to-[#22d3ee]"
            )}>
              {msg.role === 'user' ? (
                <User className="w-4 h-4 text-[#8b5cf6]" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
            <div className={cn(
              "max-w-[85%] rounded-2xl p-4 text-sm",
              msg.role === 'user' 
                ? "bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white rounded-tr-md" 
                : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-[#e4e4e7] rounded-tl-md"
            )}>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              
              {msg.operations && msg.operations.length > 0 && renderOperationsList(msg.operations)}
              
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                  <button
                    onClick={() => copyToClipboard(msg.content, i)}
                    className="text-[#71717a] hover:text-[#fafafa] transition-colors"
                  >
                    {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-[#34d399]" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <span className="text-[#52525b] text-[11px]">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 nf-animate-fade-in">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#22d3ee] flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="nf-loading">
              <div className="nf-loading-spinner" />
              <span className="text-[#71717a] text-sm">Thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Active File Indicator */}
      {activeFile && (selectedAction === 'modify' || selectedAction === 'refactor' || selectedAction === 'explain' || selectedAction === 'fix') && (
        <div className="px-4 py-2 border-t border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2 text-xs text-[#71717a]">
            <FileEdit className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <span>Working on:</span>
            <span className="text-[#a1a1aa] font-mono bg-[rgba(255,255,255,0.04)] px-2 py-0.5 rounded">
              {activeFile.name}
            </span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-[rgba(255,255,255,0.06)]">
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
              selectedAction === 'scaffold' ? "Describe your project..." :
              selectedAction === 'generate' ? "Describe the component..." :
              selectedAction === 'create' ? "What file should I create?" :
              selectedAction === 'modify' ? "What changes should I make?" :
              "Ask anything or describe what you want to build..."
            }
            className={cn(
              "w-full resize-none rounded-xl px-4 py-3 pr-12 text-sm",
              "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]",
              "text-[#fafafa] placeholder:text-[#52525b]",
              "focus:outline-none focus:border-[rgba(139,92,246,0.4)]",
              "focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)]",
              "transition-all duration-200 min-h-[52px] max-h-[150px]"
            )}
            rows={1}
          />
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            className={cn(
              "absolute right-2 bottom-2 p-2.5 rounded-lg transition-all duration-200",
              prompt.trim() && !isLoading
                ? "bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white shadow-[0_0_16px_rgba(139,92,246,0.4)] hover:shadow-[0_0_24px_rgba(139,92,246,0.5)]"
                : "bg-[rgba(255,255,255,0.04)] text-[#52525b] cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[#52525b] text-[11px]">Shift + Enter for new line</span>
          <span className="text-[11px] flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-[#8b5cf6]" />
            <span className="text-[#52525b]">Powered by</span>
            <span className="text-[#8b5cf6]">DeepSeek</span>
          </span>
        </div>
      </div>
    </div>
  );
};
