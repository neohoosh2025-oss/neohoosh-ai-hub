import { useEffect, useState, useRef } from 'react';
import '@/styles/neoforge.css';
import { TopBar } from '@/components/neoforge/TopBar';
import { Sidebar } from '@/components/neoforge/Sidebar';
import { Editor } from '@/components/neoforge/Editor';
import { Preview } from '@/components/neoforge/Preview';
import { AiPanel } from '@/components/neoforge/AiPanel';
import { StatusBar } from '@/components/neoforge/StatusBar';
import { cn } from '@/lib/utils';

const NeoForge = () => {
  const [triggerBuild, setTriggerBuild] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [previewWidth, setPreviewWidth] = useState(45); // percentage
  const [aiPanelWidth, setAiPanelWidth] = useState(320);
  
  const isResizingSidebar = useRef(false);
  const isResizingPreview = useRef(false);
  const isResizingAi = useRef(false);

  useEffect(() => {
    document.title = 'NeoForge - AI Code Playground';
  }, []);

  const handleRun = () => {
    setTriggerBuild(prev => prev + 1);
  };

  // Handle resize events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar.current) {
        const newWidth = Math.max(180, Math.min(400, e.clientX));
        setSidebarWidth(newWidth);
      }
      if (isResizingPreview.current) {
        const containerWidth = window.innerWidth - sidebarWidth - aiPanelWidth;
        const mouseX = e.clientX - sidebarWidth;
        const newPreviewWidth = Math.max(25, Math.min(75, (mouseX / containerWidth) * 100));
        setPreviewWidth(newPreviewWidth);
      }
      if (isResizingAi.current) {
        const newWidth = Math.max(280, Math.min(500, window.innerWidth - e.clientX));
        setAiPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizingSidebar.current = false;
      isResizingPreview.current = false;
      isResizingAi.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [sidebarWidth, aiPanelWidth]);

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

  const startResizeAi = () => {
    isResizingAi.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div className="neoforge-app h-screen flex flex-col overflow-hidden">
      {/* Top Bar */}
      <TopBar onRun={handleRun} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div style={{ width: sidebarWidth }} className="shrink-0">
          <Sidebar />
        </div>

        {/* Sidebar Resize Handle */}
        <div
          className="w-1 bg-transparent hover:bg-[#7C3AED]/50 cursor-col-resize transition-colors"
          onMouseDown={startResizeSidebar}
        />

        {/* Main Area (Preview + Editor) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Preview */}
          <div style={{ width: `${previewWidth}%` }} className="shrink-0">
            <Preview triggerBuild={triggerBuild} />
          </div>

          {/* Preview/Editor Resize Handle */}
          <div
            className="w-1 bg-transparent hover:bg-[#7C3AED]/50 cursor-col-resize transition-colors"
            onMouseDown={startResizePreview}
          />

          {/* Editor */}
          <div className="flex-1 min-w-0">
            <Editor />
          </div>
        </div>

        {/* AI Panel Resize Handle */}
        <div
          className="w-1 bg-transparent hover:bg-[#7C3AED]/50 cursor-col-resize transition-colors"
          onMouseDown={startResizeAi}
        />

        {/* AI Panel */}
        <div style={{ width: aiPanelWidth }} className="shrink-0">
          <AiPanel />
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};

export default NeoForge;
