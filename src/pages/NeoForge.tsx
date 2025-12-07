import { useEffect, useState, useRef } from 'react';
import '@/styles/neoforge.css';
import { TopBar } from '@/components/neoforge/TopBar';
import { Sidebar } from '@/components/neoforge/Sidebar';
import { Editor } from '@/components/neoforge/Editor';
import { Preview } from '@/components/neoforge/Preview';
import { AiPanel } from '@/components/neoforge/AiPanel';
import { StatusBar } from '@/components/neoforge/StatusBar';
import { cn } from '@/lib/utils';
import { Code2, Eye, FolderTree, Bot, X, MessageCircle } from 'lucide-react';

type ViewMode = 'code' | 'preview';
type MobilePanel = 'ai' | 'explorer' | null;

const NeoForge = () => {
  const [triggerBuild, setTriggerBuild] = useState(0);
  const [aiPanelWidth, setAiPanelWidth] = useState(340);
  const [explorerWidth, setExplorerWidth] = useState(260);
  const [viewMode, setViewMode] = useState<ViewMode>('code');
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>(null);
  const [showMobileAiChat, setShowMobileAiChat] = useState(false);
  
  const isResizingAi = useRef(false);
  const isResizingExplorer = useRef(false);
  
  // Expose triggerBuild globally for AI panel to trigger rebuilds
  useEffect(() => {
    (window as any).neoforgeRefresh = () => {
      setTriggerBuild(prev => prev + 1);
      setViewMode('preview');
    };
    return () => { delete (window as any).neoforgeRefresh; };
  }, []);

  useEffect(() => {
    document.title = 'NeoForge - AI Code Playground';
  }, []);

  const handleRun = () => {
    setTriggerBuild(prev => prev + 1);
    setViewMode('preview');
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingAi.current) {
        const newWidth = Math.max(300, Math.min(480, e.clientX));
        setAiPanelWidth(newWidth);
      }
      if (isResizingExplorer.current) {
        const newWidth = Math.max(200, Math.min(400, window.innerWidth - e.clientX));
        setExplorerWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizingAi.current = false;
      isResizingExplorer.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResizeAi = () => {
    isResizingAi.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const startResizeExplorer = () => {
    isResizingExplorer.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const closeMobilePanel = () => setMobilePanel(null);

  return (
    <div className="neoforge-app h-screen flex flex-col overflow-hidden">
      <TopBar onRun={handleRun} />

      {/* Mobile View Mode Toggle */}
      <div className="lg:hidden flex items-center gap-1 p-2 bg-[#0a0a0d] border-b border-[rgba(255,255,255,0.06)]">
        <button
          onClick={() => setViewMode('code')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            viewMode === 'code' 
              ? "bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              : "bg-[rgba(255,255,255,0.04)] text-[#71717a]"
          )}
        >
          <Code2 className="w-4 h-4" />
          <span>کد</span>
        </button>
        <button
          onClick={() => {
            setViewMode('preview');
            setTriggerBuild(prev => prev + 1);
          }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            viewMode === 'preview' 
              ? "bg-gradient-to-r from-[#22d3ee] to-[#06b6d4] text-white shadow-[0_0_20px_rgba(34,211,238,0.3)]"
              : "bg-[rgba(255,255,255,0.04)] text-[#71717a]"
          )}
        >
          <Eye className="w-4 h-4" />
          <span>پیش‌نمایش</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop: AI Panel - Left */}
        <div style={{ width: aiPanelWidth }} className="hidden lg:block shrink-0">
          <AiPanel />
        </div>

        {/* Desktop: AI Panel Resize Handle */}
        <div
          className="hidden lg:block nf-resize-handle"
          onMouseDown={startResizeAi}
        />

        {/* Main Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Desktop: View with tabs */}
          <div className="hidden lg:flex flex-1 overflow-hidden">
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center bg-[#050507] border-b border-[rgba(255,255,255,0.06)]">
                <button
                  onClick={() => setViewMode('code')}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 relative",
                    viewMode === 'code' 
                      ? "text-[#fafafa] bg-[#0a0a0d]"
                      : "text-[#71717a] hover:text-[#a1a1aa] hover:bg-[rgba(255,255,255,0.02)]"
                  )}
                >
                  {viewMode === 'code' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#8b5cf6] to-[#22d3ee]" />
                  )}
                  <Code2 className="w-4 h-4" />
                  <span>Code</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode('preview');
                    setTriggerBuild(prev => prev + 1);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all duration-200 relative",
                    viewMode === 'preview' 
                      ? "text-[#fafafa] bg-[#0a0a0d]"
                      : "text-[#71717a] hover:text-[#a1a1aa] hover:bg-[rgba(255,255,255,0.02)]"
                  )}
                >
                  {viewMode === 'preview' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#22d3ee] to-[#06b6d4]" />
                  )}
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
              </div>
              
              <div className="flex-1 overflow-hidden">
                {viewMode === 'code' ? <Editor /> : <Preview triggerBuild={triggerBuild} />}
              </div>
            </div>
          </div>

          {/* Mobile: Single view based on mode */}
          <div className="flex-1 lg:hidden overflow-hidden">
            {viewMode === 'code' ? <Editor /> : <Preview triggerBuild={triggerBuild} />}
          </div>
        </div>

        {/* Desktop: Explorer Resize Handle */}
        <div
          className="hidden lg:block nf-resize-handle"
          onMouseDown={startResizeExplorer}
        />

        {/* Desktop: Explorer - Right */}
        <div style={{ width: explorerWidth }} className="hidden lg:block shrink-0">
          <Sidebar />
        </div>

        {/* Mobile: Overlay Panels */}
        {(mobilePanel || showMobileAiChat) && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => {
              closeMobilePanel();
              setShowMobileAiChat(false);
            }}
          />
        )}
        
        {/* Mobile: AI Panel Drawer */}
        <div className={cn(
          "lg:hidden fixed inset-y-0 left-0 w-[90vw] max-w-[400px] z-50 transform transition-transform duration-300 ease-out",
          showMobileAiChat ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-full relative bg-[#0a0a0d]">
            <button
              onClick={() => setShowMobileAiChat(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-[rgba(255,255,255,0.1)] text-[#a1a1aa] hover:bg-[rgba(255,255,255,0.15)]"
            >
              <X className="w-5 h-5" />
            </button>
            <AiPanel />
          </div>
        </div>

        {/* Mobile: Explorer Drawer */}
        <div className={cn(
          "lg:hidden fixed inset-y-0 right-0 w-[80vw] max-w-[320px] z-50 transform transition-transform duration-300 ease-out",
          mobilePanel === 'explorer' ? "translate-x-0" : "translate-x-full"
        )}>
          <div className="h-full relative bg-[#0a0a0d]">
            <button
              onClick={closeMobilePanel}
              className="absolute top-4 left-4 z-10 p-2 rounded-lg bg-[rgba(255,255,255,0.1)] text-[#a1a1aa] hover:bg-[rgba(255,255,255,0.15)]"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Enhanced with AI Chat button */}
      <div className="lg:hidden flex items-center justify-around py-3 px-4 bg-[#0a0a0d] border-t border-[rgba(255,255,255,0.08)]">
        <button
          onClick={() => setShowMobileAiChat(true)}
          className={cn(
            "flex flex-col items-center gap-1.5 px-5 py-2 rounded-xl transition-all duration-200 relative",
            showMobileAiChat 
              ? "bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]"
              : "text-[#71717a] hover:text-[#a1a1aa]"
          )}
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#34d399] rounded-full border-2 border-[#0a0a0d]" />
          </div>
          <span className="text-[10px] font-medium">چت با AI</span>
        </button>
        
        <button
          onClick={() => setMobilePanel(mobilePanel === 'explorer' ? null : 'explorer')}
          className={cn(
            "flex flex-col items-center gap-1.5 px-5 py-2 rounded-xl transition-all duration-200",
            mobilePanel === 'explorer' 
              ? "bg-[rgba(34,211,238,0.15)] text-[#22d3ee]"
              : "text-[#71717a] hover:text-[#a1a1aa]"
          )}
        >
          <FolderTree className="w-6 h-6" />
          <span className="text-[10px] font-medium">فایل‌ها</span>
        </button>
      </div>

      <div className="hidden lg:block">
        <StatusBar />
      </div>
    </div>
  );
};

export default NeoForge;