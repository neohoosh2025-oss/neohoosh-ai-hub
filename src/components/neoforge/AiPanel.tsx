import { useState, useRef, useEffect } from 'react';
import { useFilesStore, FileOperation } from '@/store/filesStore';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { 
  Sparkles, Send, FileEdit, FilePlus, 
  Loader2, Copy, Check, Rocket,
  FolderPlus, Trash2, Bot, User,
  CheckCircle2, Wand2
} from 'lucide-react';
import { toast } from 'sonner';

type ActionType = 'scaffold' | 'generate' | 'modify' | 'chat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  operations?: FileOperation[];
  timestamp: Date;
  applied?: boolean;
}

const actions = [
  { id: 'scaffold' as ActionType, label: 'Create Project', icon: <Rocket className="w-4 h-4" />, placeholder: 'Describe your project...' },
  { id: 'generate' as ActionType, label: 'Generate', icon: <Wand2 className="w-4 h-4" />, placeholder: 'What component to generate...' },
  { id: 'modify' as ActionType, label: 'Modify', icon: <FileEdit className="w-4 h-4" />, placeholder: 'What changes to make...' },
  { id: 'chat' as ActionType, label: 'Chat', icon: <Sparkles className="w-4 h-4" />, placeholder: 'Ask anything...' },
];

interface AiPanelProps {
  onClose?: () => void;
}

export const AiPanel = ({ onClose }: AiPanelProps) => {
  const { files, activeFileId, applyOperations, setActiveFile, getFileByPath } = useFilesStore();
  const [selectedAction, setSelectedAction] = useState<ActionType>('scaffold');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeFile = activeFileId ? files[activeFileId] : null;
  const currentAction = actions.find(a => a.id === selectedAction);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [prompt]);

  const getAllFilesContext = () => {
    return Object.values(files)
      .filter(f => f.type === 'file')
      .map(f => `${f.path}:\n\`\`\`\n${f.content.slice(0, 400)}${f.content.length > 400 ? '...' : ''}\n\`\`\``)
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

      console.log('Sending to NeoForge AI:', { action: selectedAction, prompt: prompt.slice(0, 100) });

      const { data, error } = await supabase.functions.invoke('neoforge-ai', {
        body: {
          action: selectedAction,
          prompt: prompt,
          context,
          allFiles: getAllFilesContext(),
        },
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      console.log('NeoForge AI Response:', data);

      if (data.type === 'error') {
        throw new Error(data.error);
      }

      let assistantContent = '';
      let operations: FileOperation[] = [];

      if (data.type === 'explanation') {
        assistantContent = data.content;
      } else if (data.type === 'operations') {
        operations = data.operations || [];
        assistantContent = data.summary || `✅ ${operations.length} file(s) ready`;
        
        if (data.nextSteps?.length > 0) {
          assistantContent += '\n\n**Next steps:**\n' + data.nextSteps.map((s: string) => `• ${s}`).join('\n');
        }
      } else {
        assistantContent = data.content || JSON.stringify(data);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: assistantContent,
        operations,
        timestamp: new Date(),
        applied: operations.length > 0,
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Apply file operations directly
      if (operations.length > 0) {
        console.log('Applying operations:', operations);
        applyOperations(operations);
        
        // Set active file to first created/updated file
        const firstFileOp = operations.find(op => op.type === 'create_file' || op.type === 'update_file');
        if (firstFileOp) {
          setTimeout(() => {
            const file = getFileByPath(firstFileOp.path);
            if (file) {
              setActiveFile(file.id);
            }
          }, 150);
        }
        
        // Trigger preview rebuild
        setTimeout(() => {
          if ((window as any).neoforgeRefresh) {
            (window as any).neoforgeRefresh();
          }
        }, 300);
        
        toast.success(`${operations.length} file(s) updated!`, {
          description: operations.map(op => op.path.split('/').pop()).join(', '),
        });
      }

    } catch (error) {
      console.error('AI error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ Error: ${error instanceof Error ? error.message : 'Failed to process request'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Error processing request');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    toast.success('Copied!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderOperationsList = (operations: FileOperation[], applied?: boolean) => (
    <div className="mt-3 space-y-1.5">
      <div className="flex items-center gap-2 text-[11px] text-[#71717a] uppercase tracking-wider mb-2">
        {applied && <CheckCircle2 className="w-3.5 h-3.5 text-[#34d399]" />}
        <span>{applied ? 'Changes Applied' : 'File Operations'}</span>
      </div>
      {operations.map((op, i) => (
        <div key={i} className={cn(
          "flex items-center gap-2 text-sm p-2 rounded-lg",
          "bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]"
        )}>
          {op.type === 'create_file' && <FilePlus className="w-3.5 h-3.5 text-[#34d399]" />}
          {op.type === 'create_folder' && <FolderPlus className="w-3.5 h-3.5 text-[#fbbf24]" />}
          {op.type === 'update_file' && <FileEdit className="w-3.5 h-3.5 text-[#22d3ee]" />}
          {op.type === 'delete_file' && <Trash2 className="w-3.5 h-3.5 text-[#f87171]" />}
          <span className="text-[#a1a1aa] truncate text-xs font-mono">{op.path}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[#0f0f12] rounded-xl border border-[rgba(255,255,255,0.08)] shadow-2xl overflow-hidden" dir="ltr">
      {/* Header */}
      <div className="p-4 border-b border-[rgba(255,255,255,0.06)] shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "relative w-10 h-10 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br from-[#8b5cf6] via-[#7c3aed] to-[#22d3ee]",
            "shadow-[0_0_25px_rgba(139,92,246,0.35)]"
          )}>
            <Bot className="w-5 h-5 text-white" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#34d399] border-2 border-[#0f0f12]" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[#fafafa] font-semibold text-sm">NeoForge AI</h2>
            <p className="text-[#52525b] text-xs">Autonomous Builder</p>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex gap-1 p-1 bg-[rgba(255,255,255,0.03)] rounded-lg">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => setSelectedAction(action.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all",
                selectedAction === action.id 
                  ? "bg-[rgba(139,92,246,0.2)] text-[#a78bfa]"
                  : "text-[#71717a] hover:text-[#a1a1aa]"
              )}
            >
              {action.icon}
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="w-14 h-14 rounded-2xl bg-[rgba(139,92,246,0.1)] flex items-center justify-center mb-4">
              <Sparkles className="w-7 h-7 text-[#8b5cf6]" />
            </div>
            <p className="text-[#fafafa] text-sm font-medium mb-1">Start Building with AI</p>
            <p className="text-[#52525b] text-xs text-center leading-relaxed">
              Create projects, generate components,<br/>modify files and more
            </p>
            
            {/* Quick examples */}
            <div className="mt-6 w-full space-y-2">
              <p className="text-[#52525b] text-[10px] uppercase tracking-wider mb-2 text-center">Examples</p>
              {[
                'Create a modern landing page',
                'Build a product card component',
                'Add a contact form',
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(example)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-[#a1a1aa] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.04)] transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={cn(
              "flex gap-2.5",
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <div className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
              msg.role === 'user' 
                ? "bg-[rgba(139,92,246,0.15)]" 
                : "bg-gradient-to-br from-[#8b5cf6] to-[#22d3ee]"
            )}>
              {msg.role === 'user' ? (
                <User className="w-3.5 h-3.5 text-[#8b5cf6]" />
              ) : (
                <Bot className="w-3.5 h-3.5 text-white" />
              )}
            </div>
            <div className={cn(
              "max-w-[85%] rounded-2xl p-3 text-sm",
              msg.role === 'user' 
                ? "bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white rounded-tr-md" 
                : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] text-[#e4e4e7] rounded-tl-md"
            )}>
              <div className="whitespace-pre-wrap leading-relaxed text-[13px]">{msg.content}</div>
              
              {msg.operations && msg.operations.length > 0 && renderOperationsList(msg.operations, msg.applied)}
              
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-[rgba(255,255,255,0.06)]">
                  <button
                    onClick={() => copyToClipboard(msg.content, i)}
                    className="text-[#71717a] hover:text-[#fafafa] transition-colors"
                  >
                    {copiedIndex === i ? <Check className="w-3 h-3 text-[#34d399]" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <span className="text-[#3f3f46] text-[10px]">
                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#22d3ee] flex items-center justify-center">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex items-center gap-2 p-3 rounded-2xl rounded-tl-md bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]">
              <Loader2 className="w-4 h-4 text-[#8b5cf6] animate-spin" />
              <span className="text-[#71717a] text-xs">Thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Active File Indicator */}
      {activeFile && selectedAction === 'modify' && (
        <div className="px-4 py-2 border-t border-[rgba(255,255,255,0.06)] shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#71717a]">
            <FileEdit className="w-3 h-3 text-[#8b5cf6]" />
            <span>Selected:</span>
            <span className="text-[#a1a1aa] font-mono bg-[rgba(255,255,255,0.04)] px-2 py-0.5 rounded text-[11px]">
              {activeFile.name}
            </span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-[rgba(255,255,255,0.06)] shrink-0">
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
            placeholder={currentAction?.placeholder}
            className={cn(
              "w-full resize-none rounded-xl px-4 py-3 pr-12 text-sm",
              "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)]",
              "text-[#fafafa] placeholder:text-[#3f3f46]",
              "focus:outline-none focus:border-[rgba(139,92,246,0.4)] focus:ring-1 focus:ring-[rgba(139,92,246,0.2)]",
              "transition-all duration-200"
            )}
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isLoading}
            className={cn(
              "absolute right-2 bottom-2 p-2 rounded-lg transition-all duration-200",
              prompt.trim() && !isLoading
                ? "bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                : "bg-[rgba(255,255,255,0.03)] text-[#3f3f46]"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
