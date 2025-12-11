import { useEffect, useState, useRef } from 'react';
import { useFilesStore } from '@/store/filesStore';
import { useNeoForgeStore } from '@/store/neoforgeStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Sparkles, Send, Loader2, ArrowLeft, Play,
  Bot, User, History, Plus, Trash2, ChevronRight,
  AlertTriangle, Wrench, X, Code2, Eye,
  FilePlus, FileEdit, FolderPlus, CheckCircle2
} from 'lucide-react';
import type { FileOperation } from '@/store/filesStore';

const NeoForge = () => {
  const [prompt, setPrompt] = useState('');
  const [view, setView] = useState<'chat' | 'preview' | 'code'>('chat');
  const [showHistory, setShowHistory] = useState(false);
  const [previewError, setPreviewError] = useState<{message: string; stack?: string} | null>(null);
  const [triggerBuild, setTriggerBuild] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const { files, applyOperations, clearProject, getFileByPath } = useFilesStore();
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
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [prompt]);

  // Build preview HTML
  const buildPreview = () => {
    try {
      const htmlFile = Object.values(files).find(f => f.name === 'index.html');
      const cssFiles = Object.values(files).filter(f => f.name.endsWith('.css') && f.type === 'file');
      const jsFiles = Object.values(files).filter(f => (f.name.endsWith('.js') || f.name.endsWith('.jsx')) && f.type === 'file');
      
      if (!htmlFile) {
        return `<!DOCTYPE html><html><head><style>body{background:#0a0a0f;color:#888;font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;}</style></head><body><p>No preview available</p></body></html>`;
      }
      
      let html = htmlFile.content || '';
      
      const allCSS = cssFiles.map(f => f.content).join('\n');
      if (allCSS) {
        html = html.replace('</head>', `<style>${allCSS}</style></head>`);
      }
      
      const allJS = jsFiles.map(f => {
        let content = f.content || '';
        content = content.replace(/export\s+(function|const|let|var|class)\s+/g, '$1 ');
        content = content.replace(/export\s+default\s+/g, '');
        content = content.replace(/import\s+.*?from\s+['"].*?['"]\s*;?/g, '');
        return `// ${f.name}\n${content}`;
      }).join('\n\n');
      
      if (allJS) {
        html = html.replace('</body>', `<script type="module">\ntry {\n${allJS}\n} catch(e) { console.error('Runtime error:', e); }\n</script></body>`);
      }
      
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

  // Update iframe
  useEffect(() => {
    if (iframeRef.current && view === 'preview') {
      const html = buildPreview();
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;
      return () => URL.revokeObjectURL(url);
    }
  }, [files, triggerBuild, view]);

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

    addMessage({ role: 'assistant', content: 'Building...', timestamp: Date.now() });

    try {
      const isNewProject = finalPrompt.toLowerCase().includes('create') || 
                           finalPrompt.toLowerCase().includes('build') ||
                           finalPrompt.toLowerCase().includes('make') ||
                           messages.length === 0;

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

      if (operations.length > 0) {
        applyOperations(operations);
        setView('preview');
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
    setView('chat');
  };

  const handleNewProject = () => {
    createConversation();
    clearProject();
    setView('chat');
    setShowHistory(false);
  };

  const renderOperations = (operations: FileOperation[]) => (
    <div className="mt-3 space-y-1">
      <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-wider">
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
        <span>Files Created</span>
      </div>
      {operations.slice(0, 5).map((op, i) => (
        <div key={i} className="flex items-center gap-2 text-xs p-2 rounded-lg bg-white/[0.02]">
          {op.type === 'create_file' && <FilePlus className="w-3 h-3 text-emerald-400" />}
          {op.type === 'update_file' && <FileEdit className="w-3 h-3 text-cyan-400" />}
          {op.type === 'create_folder' && <FolderPlus className="w-3 h-3 text-amber-400" />}
          {op.type === 'delete_file' && <Trash2 className="w-3 h-3 text-red-400" />}
          <span className="text-zinc-400 font-mono truncate">{op.path}</span>
        </div>
      ))}
      {operations.length > 5 && (
        <p className="text-[10px] text-zinc-600">+{operations.length - 5} more files</p>
      )}
    </div>
  );

  // History Panel
  if (showHistory) {
    return (
      <div dir="ltr" className="h-screen flex flex-col bg-[#09090b] text-left">
        <header className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-violet-400" />
            <h2 className="text-white font-semibold">History</h2>
          </div>
          <button
            onClick={() => setShowHistory(false)}
            className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05]"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <button
            onClick={handleNewProject}
            className="w-full flex items-center gap-2 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:border-violet-500/40"
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
              className={`w-full text-left p-4 rounded-xl transition-all group ${
                conv.id === activeConversationId
                  ? "bg-violet-500/10 border border-violet-500/20"
                  : "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${
                    conv.id === activeConversationId ? "text-violet-400" : "text-zinc-200"
                  }`}>
                    {conv.title}
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    {new Date(conv.updatedAt).toLocaleDateString()} · {conv.messages.length} messages
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="p-1.5 rounded opacity-0 group-hover:opacity-100 text-red-400 hover:bg-red-400/10"
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
    <div dir="ltr" className="h-screen flex flex-col bg-[#09090b] text-left">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          <a href="/" className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05]">
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-lg">NeoForge</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05]"
          >
            <History className="w-5 h-5" />
          </button>
          <button
            onClick={handleNewProject}
            className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05]"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* View Toggle - Mobile Tabs */}
      <div className="flex border-b border-white/[0.06] shrink-0">
        <button
          onClick={() => setView('chat')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            view === 'chat' 
              ? 'text-violet-400 border-b-2 border-violet-400' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Chat</span>
        </button>
        <button
          onClick={() => { setView('preview'); setTriggerBuild(prev => prev + 1); }}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            view === 'preview' 
              ? 'text-violet-400 border-b-2 border-violet-400' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Preview</span>
        </button>
        <button
          onClick={() => setView('code')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
            view === 'code' 
              ? 'text-violet-400 border-b-2 border-violet-400' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Code</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Chat View */}
        {view === 'chat' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-400/20 flex items-center justify-center mb-6">
                    <Sparkles className="w-10 h-10 text-violet-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">What do you want to build?</h1>
                  <p className="text-zinc-500 text-center mb-8 max-w-md">
                    Describe your project and I'll create it for you.
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
                        className="text-left px-4 py-3 rounded-xl text-sm text-zinc-400 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-all"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.role === 'user' 
                      ? "bg-violet-500/15" 
                      : "bg-gradient-to-br from-violet-500 to-cyan-400"
                  }`}>
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-violet-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${
                    msg.role === 'user' 
                      ? "bg-gradient-to-r from-violet-500 to-violet-600 text-white" 
                      : "bg-white/[0.04] text-zinc-200"
                  }`}>
                    {msg.content === 'Building...' ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                        <span className="text-zinc-400">Building your project...</span>
                      </div>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        {msg.operations && msg.operations.length > 0 && renderOperations(msg.operations)}
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/[0.06]">
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
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
                    placeholder="What do you want to build?"
                    disabled={isLoading}
                    rows={1}
                    className="w-full resize-none bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-transparent disabled:opacity-50"
                    style={{ direction: 'ltr', textAlign: 'left' }}
                  />
                </div>
                <button
                  onClick={() => handleSubmit()}
                  disabled={isLoading || !prompt.trim()}
                  className="p-3 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-violet-600 hover:to-violet-700 transition-all shadow-lg shadow-violet-500/25"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Preview View */}
        {view === 'preview' && (
          <div className="h-full flex flex-col">
            {previewError && (
              <div className="m-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-red-400 font-medium mb-1">Preview Error</p>
                    <p className="text-xs text-red-300/70 break-words">{previewError.message}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleTryToFix}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500 text-white hover:bg-violet-600"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      Try to Fix
                    </button>
                    <button
                      onClick={() => setPreviewError(null)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex-1 bg-zinc-900 m-4 rounded-xl overflow-hidden border border-white/[0.06]">
              <iframe
                ref={iframeRef}
                title="Preview"
                className="w-full h-full bg-white"
                sandbox="allow-scripts allow-modals"
              />
            </div>
            
            <div className="p-4 border-t border-white/[0.06]">
              <button
                onClick={() => setTriggerBuild(prev => prev + 1)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white font-medium shadow-lg shadow-violet-500/25"
              >
                <Play className="w-4 h-4" />
                Run
              </button>
            </div>
          </div>
        )}

        {/* Code View */}
        {view === 'code' && (
          <div className="h-full overflow-y-auto p-4 space-y-4">
            {Object.values(files).filter(f => f.type === 'file').length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Code2 className="w-12 h-12 text-zinc-600 mb-4" />
                <p className="text-zinc-500">No files yet</p>
                <p className="text-zinc-600 text-sm mt-1">Start building to see your code</p>
              </div>
            ) : (
              Object.values(files)
                .filter(f => f.type === 'file')
                .map(file => (
                  <div key={file.id} className="rounded-xl border border-white/[0.06] overflow-hidden">
                    <div className="px-4 py-2 bg-white/[0.02] border-b border-white/[0.06] flex items-center gap-2">
                      <Code2 className="w-4 h-4 text-violet-400" />
                      <span className="text-sm text-zinc-400 font-mono">{file.path}</span>
                    </div>
                    <pre 
                      className="p-4 text-xs text-zinc-300 font-mono overflow-x-auto bg-zinc-900/50"
                      style={{ direction: 'ltr', textAlign: 'left' }}
                    >
                      <code>{file.content}</code>
                    </pre>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NeoForge;
