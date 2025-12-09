import { useEffect, useState, useRef } from 'react';
import '@/styles/neoforge.css';
import { TopBar } from '@/components/neoforge/TopBar';
import { Sidebar } from '@/components/neoforge/Sidebar';
import { Editor } from '@/components/neoforge/Editor';
import { Preview } from '@/components/neoforge/Preview';
import { AiPanel } from '@/components/neoforge/AiPanel';
import { StatusBar } from '@/components/neoforge/StatusBar';
import { cn } from '@/lib/utils';
import { Code2, Eye, FolderTree, Sparkles, X, PanelLeftClose, PanelRightClose } from 'lucide-react';

type ViewMode = 'code' | 'preview' | 'split';

const NeoForge = () => {
  const [triggerBuild, setTriggerBuild] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [previewWidth, setPreviewWidth] = useState(50); // percentage
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [mobileView, setMobileView] = useState<'code' | 'preview'>('code');
  
  const isResizingSidebar = useRef(false);
  const isResizingPreview = useRef(false);
  
  // Expose triggerBuild globally for AI panel to trigger rebuilds
  useEffect(() => {
    (window as any).neoforgeRefresh = () => {
      setTriggerBuild(prev => prev + 1);
    };
    return () => { delete (window as any).neoforgeRefresh; };
  }, []);

  useEffect(() => {
    document.title = 'NeoForge - AI Code Playground';
  }, []);

  const handleRun = () => {
    setTriggerBuild(prev => prev + 1);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar.current) {
        const newWidth = Math.max(180, Math.min(400, e.clientX));
        setSidebarWidth(newWidth);
      }
      if (isResizingPreview.current) {
        const containerWidth = window.innerWidth - (showSidebar ? sidebarWidth : 0);
        const mouseX = e.clientX - (showSidebar ? sidebarWidth : 0);
        const percentage = Math.max(30, Math.min(70, (mouseX / containerWidth) * 100));
        setPreviewWidth(100 - percentage);
      }
    };

    const handleMouseUp = () => {
      isResizingSidebar.current = false;
      isResizingPreview.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [showSidebar, sidebarWidth]);

  const startResizeSidebar = () => {
    isResizingSidebar.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const startResizePreview = () => {
    isResizingPreview.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div className="neoforge-app h-screen flex flex-col overflow-hidden" dir="ltr">
      <TopBar onRun={handleRun} onToggleAi={() => setShowAiPanel(!showAiPanel)} showAiPanel={showAiPanel} />

      {/* Mobile View Toggle */}
      <div className="lg:hidden flex items-center gap-1 p-2 bg-[#0a0a0d] border-b border-[rgba(255,255,255,0.06)]">
        <button
          onClick={() => setMobileView('code')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            mobileView === 'code' 
              ? "bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              : "bg-[rgba(255,255,255,0.04)] text-[#71717a]"
          )}
        >
          <Code2 className="w-4 h-4" />
          <span>Code</span>
        </button>
        <button
          onClick={() => {
            setMobileView('preview');
            setTriggerBuild(prev => prev + 1);
          }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            mobileView === 'preview' 
              ? "bg-gradient-to-r from-[#22d3ee] to-[#06b6d4] text-white shadow-[0_0_20px_rgba(34,211,238,0.3)]"
              : "bg-[rgba(255,255,255,0.04)] text-[#71717a]"
          )}
        >
          <Eye className="w-4 h-4" />
          <span>Preview</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop: Left Sidebar (File Explorer) */}
        {showSidebar && (
          <>
            <div style={{ width: sidebarWidth }} className="hidden lg:block shrink-0">
              <Sidebar />
            </div>
            <div
              className="hidden lg:block w-1 cursor-col-resize hover:bg-[rgba(139,92,246,0.3)] transition-colors"
              onMouseDown={startResizeSidebar}
            />
          </>
        )}

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="hidden lg:flex absolute left-2 top-2 z-10 p-1.5 rounded-md bg-[rgba(255,255,255,0.05)] text-[#71717a] hover:text-[#fafafa] hover:bg-[rgba(255,255,255,0.1)] transition-all"
          style={{ left: showSidebar ? sidebarWidth + 8 : 8 }}
        >
          {showSidebar ? <PanelLeftClose className="w-4 h-4" /> : <FolderTree className="w-4 h-4" />}
        </button>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Desktop: Split View */}
          <div className="hidden lg:flex flex-1 overflow-hidden">
            {/* Code Editor */}
            {(viewMode === 'code' || viewMode === 'split') && (
              <div 
                className="flex-1 overflow-hidden"
                style={{ width: viewMode === 'split' ? `${100 - previewWidth}%` : '100%' }}
              >
                <Editor />
              </div>
            )}
            
            {/* Resize Handle */}
            {viewMode === 'split' && (
              <div
                className="w-1 cursor-col-resize hover:bg-[rgba(139,92,246,0.3)] bg-[rgba(255,255,255,0.04)] transition-colors"
                onMouseDown={startResizePreview}
              />
            )}
            
            {/* Preview */}
            {(viewMode === 'preview' || viewMode === 'split') && (
              <div 
                className="overflow-hidden"
                style={{ width: viewMode === 'split' ? `${previewWidth}%` : '100%' }}
              >
                <Preview triggerBuild={triggerBuild} onShowAiPanel={() => setShowAiPanel(true)} />
              </div>
            )}
          </div>

          {/* Mobile: Single View */}
          <div className="flex-1 lg:hidden overflow-hidden">
            {mobileView === 'code' ? <Editor /> : <Preview triggerBuild={triggerBuild} onShowAiPanel={() => setShowAiPanel(true)} />}
          </div>
        </div>

        {/* AI Panel Overlay */}
        {showAiPanel && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowAiPanel(false)}
            />
            <div className="fixed inset-x-4 bottom-4 top-20 lg:inset-auto lg:right-4 lg:bottom-4 lg:top-16 lg:w-[420px] z-50">
              <div className="h-full relative">
                <button
                  onClick={() => setShowAiPanel(false)}
                  className="absolute -top-2 -right-2 z-10 p-2 rounded-full bg-[#1a1a1f] text-[#a1a1aa] hover:bg-[rgba(255,255,255,0.15)] border border-[rgba(255,255,255,0.1)]"
                >
                  <X className="w-4 h-4" />
                </button>
                <AiPanel onClose={() => setShowAiPanel(false)} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden flex items-center justify-around py-3 px-4 bg-[#0a0a0d] border-t border-[rgba(255,255,255,0.08)]">
        <button
          onClick={() => setShowAiPanel(true)}
          className={cn(
            "flex flex-col items-center gap-1.5 px-5 py-2 rounded-xl transition-all duration-200 relative",
            showAiPanel 
              ? "bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]"
              : "text-[#71717a] hover:text-[#a1a1aa]"
          )}
        >
          <div className="relative">
            <Sparkles className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#34d399] rounded-full border-2 border-[#0a0a0d]" />
          </div>
          <span className="text-[10px] font-medium">AI</span>
        </button>
        
        <button
          onClick={() => {}}
          className="flex flex-col items-center gap-1.5 px-5 py-2 rounded-xl transition-all duration-200 text-[#71717a] hover:text-[#a1a1aa]"
        >
          <FolderTree className="w-6 h-6" />
          <span className="text-[10px] font-medium">Files</span>
        </button>
      </div>

      <div className="hidden lg:block">
        <StatusBar viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>
    </div>
  );
};

export default NeoForge;
