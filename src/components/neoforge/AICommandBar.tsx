import { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Loader2, 
  Code, 
  FileEdit, 
  FileQuestion, 
  Wand2,
  FilePlus,
  ChevronDown
} from 'lucide-react';
import { useFilesStore } from '@/store/filesStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type AIAction = 'modify' | 'create' | 'explain' | 'refactor' | 'generate';

const actionLabels: Record<AIAction, { label: string; icon: React.ReactNode; description: string }> = {
  modify: { 
    label: 'Modify File', 
    icon: <FileEdit className="w-4 h-4" />,
    description: 'Edit the current file based on your instructions'
  },
  create: { 
    label: 'Create File', 
    icon: <FilePlus className="w-4 h-4" />,
    description: 'Generate a new file from scratch'
  },
  explain: { 
    label: 'Explain Code', 
    icon: <FileQuestion className="w-4 h-4" />,
    description: 'Get an explanation of the current code'
  },
  refactor: { 
    label: 'Refactor', 
    icon: <Wand2 className="w-4 h-4" />,
    description: 'Improve code structure and quality'
  },
  generate: { 
    label: 'Generate Component', 
    icon: <Code className="w-4 h-4" />,
    description: 'Create a new component or feature'
  },
};

export const AICommandBar = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<AIAction>('modify');
  const [response, setResponse] = useState<string | null>(null);
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
          // Create new file
          const newFileId = createFile(data.fileName, 'src', data.code);
          toast.success(`Created new file: ${data.fileName}`);
        } else if (activeFileId && (action === 'modify' || action === 'refactor')) {
          // Update existing file
          updateFileContent(activeFileId, data.code);
          toast.success('File updated successfully!');
        }
        setResponse(data.explanation || 'Code applied successfully!');
      } else if (data.type === 'explanation') {
        setResponse(data.content);
      } else {
        setResponse(data.content || 'AI response received.');
      }

    } catch (error) {
      console.error('AI Error:', error);
      toast.error('Failed to get AI response. Please try again.');
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

  return (
    <div className="bg-card border-t border-border">
      {/* Response Area */}
      {response && (
        <div className="p-4 border-b border-border bg-muted/30 max-h-48 overflow-auto">
          <div className="flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-primary mt-1 shrink-0" />
            <div className="text-sm text-foreground whitespace-pre-wrap">{response}</div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4">
        <div className="flex gap-2">
          {/* Action Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 shrink-0">
                {actionLabels[action].icon}
                {actionLabels[action].label}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {(Object.keys(actionLabels) as AIAction[]).map((key) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setAction(key)}
                  className="flex items-start gap-3 py-2"
                >
                  <div className="mt-0.5">{actionLabels[key].icon}</div>
                  <div>
                    <div className="font-medium">{actionLabels[key].label}</div>
                    <div className="text-xs text-muted-foreground">
                      {actionLabels[key].description}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Prompt Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                action === 'modify' 
                  ? "Describe what changes you want to make..."
                  : action === 'create'
                  ? "Describe the file you want to create..."
                  : action === 'explain'
                  ? "Ask about the code..."
                  : action === 'refactor'
                  ? "Describe how to improve the code..."
                  : "Describe the component or feature..."
              }
              className="min-h-[44px] max-h-32 resize-none pr-12"
              disabled={isLoading}
            />
            <Button
              size="icon"
              className="absolute right-1.5 bottom-1.5 h-8 w-8"
              onClick={handleSubmit}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Context Info */}
        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI Powered by DeepSeek
          </span>
          {activeFile && (
            <span>
              Current file: <span className="text-foreground">{activeFile.name}</span>
            </span>
          )}
          <span className="ml-auto">⌘+Enter to send</span>
        </div>
      </div>
    </div>
  );
};
