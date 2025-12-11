import { useEffect, useState, useRef } from 'react';
import '@/styles/neoforge.css';
import { useFilesStore } from '@/store/filesStore';
import { useNeoForgeStore } from '@/store/neoforgeStore';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  Sparkles, Send, Bot, User, Loader2, 
  Play, Code2, Eye, ArrowLeft, Settings,
  AlertTriangle, Wrench, X, Copy, Check,
  FilePlus, FileEdit, FolderPlus, Trash2,
  CheckCircle2, History, Plus, ChevronRight
} from 'lucide-react';
import type { FileOperation } from '@/store/filesStore';

const NeoForge = () => {
  const [prompt, setPrompt] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [triggerBuild, setTriggerBuild] = useState(0);
  const [previewError, setPreviewError] = useState<{message: string; stack?: string} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const { files, applyOperations, getFileByPath, setActiveFile, clearProject } = useFilesStore();
  const { 
    conversations,
    activeConversationId,
    isLoading,
    getMessages,
    addMessage,
    updateLastMessage,
    setLoading,
    createConversation,
    setActiveConversation,
    deleteConversation,
  } = useNeoForgeStore();
  
  const messages = getMessages();

  useEffect(() => {
    document.title = 'NeoForge - AI Code Builder';
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [prompt]);

  // Build preview HTML from files
  const buildPreview = () => {
    try {
      const htmlFile = Object.values(files).find(f => f.name === 'index.html');
      const cssFiles = Object.values(files).filter(f => f.name.endsWith('.css') && f.type === 'file');
      const jsFiles = Object.values(files).filter(f => (f.name.endsWith('.js') || f.name.endsWith('.jsx')) && f.type === 'file');
      
      if (!htmlFile) {
        return `<!DOCTYPE html><html><head><style>body{background:#0a0a0f;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}h1{font-size:1.5rem;opacity:0.5;}</style></head><body><h1>No preview available</h1></body></html>`;
      }
      
      let html = htmlFile.content || '';
      
      // Inject all CSS
      const allCSS = cssFiles.map(f => f.content).join('\n');
      if (allCSS) {
        html = html.replace('</head>', `<style>${allCSS}</style></head>`);
      }
      
      // Inject all JS
      const allJS = jsFiles.map(f => {
        // Handle JSX exports
        let content = f.content || '';
        content = content.replace(/export\s+(function|const|let|var|class)\s+/g, '$1 ');
        content = content.replace(/export\s+default\s+/g, '');
        content = content.replace(/import\s+.*?from\s+['"].*?['"]\s*;?/g, '');
        return `// ${f.name}\n${content}`;
      }).join('\n\n');
      
      if (allJS) {
        html = html.replace('</body>', `<script type="module">\ntry {\n${allJS}\n} catch(e) { console.error('Runtime error:', e); }\n</script></body>`);
      }
      
      // Add error handler
      html = html.replace('<head>', `<head><script>
        window.onerror = function(msg, url, line, col, error) {
          window.parent.postMessage({ type: 'preview-error', message: msg, stack: error?.stack }, '*');
          return true;
        };
        window.addEventListener('unhandledrejection', function(e) {
          window.parent.postMessage({ type: 'preview-error', message: e.reason?.message || 'Promise rejected' }, '*');
        });
      </script>`);
      
      return html;
    } catch (e) {
      console.error('Build error:', e);
      return `<!DOCTYPE html><html><head><style>body{background:#1a0a0a;color:#f87171;font-family:monospace;padding:2rem;}</style></head><body><h2>Build Error</h2><pre>${e}</pre></body></html>`;
    }
  };

  // Listen for preview errors
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'preview-error') {
        setPreviewError({ message: e.data.message, stack: e.data.stack });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Update iframe when files change or build triggered
  useEffect(() => {
    if (iframeRef.current && showPreview) {
      const html = buildPreview();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;
      return () => URL.revokeObjectURL(url);
    }
  }, [files, triggerBuild, showPreview]);

  const getAllFilesContext = () => {
    return Object.values(files)
      .filter(f => f.type === 'file')
      .map(f => `${f.path}:\n\`\`\`\n${f.content || ''}\n\`\`\``)
      .join('\n\n');
  };

  const handleSubmit = async (overridePrompt?: string) => {
    const finalPrompt = overridePrompt || prompt;
    if (!finalPrompt.trim() || isLoading) return;

    addMessage({ role: 'user', content: finalPrompt, timestamp: Date.now() });
    setPrompt('');
    setLoading(true);
    setPreviewError(null);

    // Add assistant placeholder
    addMessage({ role: 'assistant', content: 'Building...', timestamp: Date.now() });

    try {
      // Determine if this is a new project creation
      const isNewProject = finalPrompt.toLowerCase().includes('create') || 
                           finalPrompt.toLowerCase().includes('build') ||
                           finalPrompt.toLowerCase().includes('make') ||
                           messages.length === 0;

      // Clear project for new creations
      if (isNewProject && messages.length <= 2) {
        clearProject();
      }

      const { data, error } = await supabase.functions.invoke('neoforge-ai', {
        body: {
          action: isNewProject ? 'scaffold' : 'modify',
          prompt: finalPrompt,
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
        assistantContent = data.summary || `✅ Created ${operations.length} file(s)`;
        
        if (data.nextSteps?.length > 0) {
          assistantContent += '\n\n**Next steps:**\n' + data.nextSteps.map((s: string) => `• ${s}`).join('\n');
        }
      } else {
        assistantContent = data.content || JSON.stringify(data);
      }

      updateLastMessage(assistantContent, operations);

      // Apply file operations
      if (operations.length > 0) {
        applyOperations(operations);
        
        // Auto-show preview
        setShowPreview(true);
        setTriggerBuild(prev => prev + 1);
        
        toast.success(`Created ${operations.length} file(s)!`);
      }

    } catch (error) {
      console.error('AI error:', error);
      updateLastMessage(`❌ Error: ${error instanceof Error ? error.message : 'Failed'}`);
      toast.error('Error processing request');
    } finally {
      setLoading(false);
    }
  };

  const handleTryToFix = () => {
    if (!previewError) return;
    const fixPrompt = `Fix this error:\n\n${previewError.message}\n${previewError.stack || ''}`;
    handleSubmit(fixPrompt);
  };

  const handleNewProject = () => {
    createConversation();
    clearProject();
    setShowPreview(false);
    setShowHistory(false);
  };

  const copyToClipboard = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const renderOperations = (operations: FileOperation[]) => (
    <div className="mt-3 space-y-1">
      <div className="flex items-center gap-2 text-[10px] text-[#52525b] uppercase tracking-wider">
        <CheckCircle2 className="w-3 h-3 text-[#34d399]" />
        <span>Files Created</span>
      </div>
      {operations.slice(0, 5).map((op, i) => (
        <div key={i} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-[rgba(255,255,255,0.02)]">
          {op.type === 'create_file' && <FilePlus className="w-3 h-3 text-[#34d399]" />}
          {op.type === 'update_file' && <FileEdit className="w-3 h-3 text-[#22d3ee]" />}
          {op.type === 'create_folder' && <FolderPlus className="w-3 h-3 text-[#fbbf24]" />}
          {op.type === 'delete_file' && <Trash2 className="w-3 h-3 text-[#f87171]" />}
          <span className="text-[#a1a1aa] font-mono truncate">{op.path}</span>
        </div>
      ))}
      {operations.length > 5 && (
        <p className="text-[10px] text-[#52525b]">+{operations.length - 5} more files</p>
      )}
    </div>
  );

  // History Sidebar
  if (showHistory) {
    return (
      <div className="neoforge-app h-screen flex flex-col bg-[#0a0a0d]" dir="ltr">
        <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-[#8b5cf6]" />
            <h2 className="text-[#fafafa] font-semibold">History</h2>
          </div>
          <button
            onClick={() => setShowHistory(false)}
            className="p-2 rounded-lg text-[#71717a] hover:text-[#fafafa] hover:bg-[rgba(255,255,255,0.05)]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <button
            onClick={handleNewProject}
            className="w-full flex items-center gap-2 p-4 rounded-xl bg-gradient-to-r from-[#8b5cf6]/20 to-[#7c3aed]/20 border border-[#8b5cf6]/30 text-[#a78bfa] hover:border-[#8b5cf6]/50"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">New Project</span>
          </button>

          {conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => {
                setActiveConversation(conv.id);
                setShowHistory(false);
              }}
              className={cn(
                "w-full text-left p-4 rounded-xl transition-all group",
                conv.id === activeConversationId
                  ? "bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)]"
                  : "bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.05)]"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium truncate",
                    conv.id === activeConversationId ? "text-[#a78bfa]" : "text-[#e4e4e7]"
                  )}>
                    {conv.title}
                  </p>
                  <p className="text-xs text-[#52525b] mt-1">
                    {new Date(conv.updatedAt).toLocaleDateString()} · {conv.messages.length} messages
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="p-1.5 rounded opacity-0 group-hover:opacity-100 text-[#f87171] hover:bg-[rgba(248,113,113,0.1)]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="neoforge-app h-screen flex flex-col bg-[#0a0a0d]" dir="ltr">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)] shrink-0">
        <div className="flex items-center gap-3">
          <a href="/" className="p-2 rounded-lg text-[#71717a] hover:text-[#fafafa] hover:bg-[rgba(255,255,255,0.05)]">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#22d3ee] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-[#fafafa] font-semibold text-lg">NeoForge</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 rounded-lg text-[#71717a] hover:text-[#fafafa] hover:bg-[rgba(255,255,255,0.05)]"
          >
            <History className="w-5 h-5" />
          </button>
          <button
            onClick={handleNewProject}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#71717a] hover:text-[#fafafa] hover:bg-[rgba(255,255,255,0.05)]"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">New</span>
          </button>
          {showPreview && (
            <button
              onClick={() => setTriggerBuild(prev => prev + 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white font-medium text-sm shadow-[0_0_20px_rgba(139,92,246,0.3)]"
            >
              <Play className="w-4 h-4" />
              <span>Run</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel */}
        <div className={cn(
          "flex flex-col transition-all duration-300",
          showPreview ? "w-[400px] lg:w-[480px] border-r border-[rgba(255,255,255,0.06)]" : "flex-1 max-w-3xl mx-auto"
        )}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-12">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#8b5cf6]/20 to-[#22d3ee]/20 flex items-center justify-center mb-6">
                  <Sparkles className="w-10 h-10 text-[#8b5cf6]" />
                </div>
                <h1 className="text-2xl font-bold text-[#fafafa] mb-2">What do you want to build?</h1>
                <p className="text-[#71717a] text-center mb-8 max-w-md">
                  Describe your project and I'll create it for you with beautiful, production-ready code.
                </p>
                
                <div className="grid gap-3 w-full max-w-md">
                  {[
                    'Create a modern portfolio website',
                    'Build a music player with playlist',
                    'Make a todo app with animations',
                    'Design a dashboard with charts',
                  ].map((example, i) => (
                    <button
                      key={i}
                      onClick={() => handleSubmit(example)}
                      className="text-left px-4 py-3 rounded-xl text-sm text-[#a1a1aa] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.06)] transition-all"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div 
                key={msg.id} 
                className={cn(
                  "flex gap-3",
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
                    ? "bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white" 
                    : "bg-[rgba(255,255,255,0.04)] text-[#e4e4e7]"
                )}>
                  {msg.content === 'Building...' ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#8b5cf6]" />
                      <span className="text-[#71717a]">Building your project...</span>
                    </div>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      {msg.operations && msg.operations.length > 0 && renderOperations(msg.operations)}
                      {msg.role === 'assistant' && msg.content !== 'Building...' && (
                        <button
                          onClick={() => copyToClipboard(msg.content, i)}
                          className="mt-2 p-1.5 rounded text-[#52525b] hover:text-[#a1a1aa] hover:bg-[rgba(255,255,255,0.05)]"
                        >
                          {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-[#34d399]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Error Banner */}
          {previewError && (
            <div className="mx-4 mb-4 p-3 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)]">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-[#f87171] shrink-0" />
                <p className="flex-1 text-sm text-[#fca5a5] truncate">{previewError.message}</p>
                <button
                  onClick={handleTryToFix}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#8b5cf6] text-white"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Fix
                </button>
                <button onClick={() => setPreviewError(null)} className="p-1 text-[#f87171]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Input */}
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
                placeholder="Describe what you want to build..."
                className="w-full px-4 py-3 pr-12 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#fafafa] placeholder-[#52525b] resize-none focus:outline-none focus:border-[#8b5cf6]/50 text-sm"
                rows={1}
                disabled={isLoading}
                style={{ direction: 'ltr', textAlign: 'left' }}
              />
              <button
                onClick={() => handleSubmit()}
                disabled={isLoading || !prompt.trim()}
                className={cn(
                  "absolute right-2 bottom-2 p-2 rounded-lg transition-all",
                  prompt.trim() && !isLoading
                    ? "bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white"
                    : "bg-[rgba(255,255,255,0.05)] text-[#52525b]"
                )}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="flex-1 flex flex-col bg-[#111113]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#71717a]" />
                <span className="text-sm text-[#a1a1aa]">Preview</span>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1.5 rounded text-[#71717a] hover:text-[#fafafa] hover:bg-[rgba(255,255,255,0.05)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 p-4">
              <div className="h-full rounded-xl overflow-hidden bg-white shadow-2xl">
                <iframe
                  ref={iframeRef}
                  className="w-full h-full border-0"
                  title="Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Toggle */}
      {showPreview && (
        <div className="lg:hidden fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-1 p-1 bg-[#1a1a1f] rounded-full border border-[rgba(255,255,255,0.1)] shadow-xl">
          <button
            onClick={() => {}}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-[#8b5cf6] text-white"
          >
            <Bot className="w-4 h-4" />
            Chat
          </button>
          <button
            onClick={() => setTriggerBuild(prev => prev + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-[#a1a1aa]"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>
      )}
    </div>
  );
};

export default NeoForge;
