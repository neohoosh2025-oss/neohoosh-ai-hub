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
  const [aiPanelWidth, setAiPanelWidth] = useState(340);
  const [previewWidth, setPreviewWidth] = useState(45);
  const [explorerWidth, setExplorerWidth] = useState(260);
  
  const isResizingAi = useRef(false);
  const isResizingPreview = useRef(false);
  const isResizingExplorer = useRef(false);

  useEffect(() => {
    document.title = 'NeoForge - AI Code Playground';
  }, []);

  const handleRun = () => {
    setTriggerBuild(prev => prev + 1);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingAi.current) {
        const newWidth = Math.max(300, Math.min(480, e.clientX));
        setAiPanelWidth(newWidth);
      }
      if (isResizingPreview.current) {
        const containerWidth = window.innerWidth - aiPanelWidth - explorerWidth;
        const mouseX = e.clientX - aiPanelWidth;
        const newWidth = Math.max(30, Math.min(70, (mouseX / containerWidth) * 100));
        setPreviewWidth(100 - newWidth);
      }
      if (isResizingExplorer.current) {
        const newWidth = Math.max(200, Math.min(400, window.innerWidth - e.clientX));
        setExplorerWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizingAi.current = false;
      isResizingPreview.current = false;
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
  }, [aiPanelWidth, explorerWidth]);

  const startResizeAi = () => {
    isResizingAi.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const startResizePreview = () => {
    isResizingPreview.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const startResizeExplorer = () => {
    isResizingExplorer.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div className="neoforge-app h-screen flex flex-col overflow-hidden">
      <TopBar onRun={handleRun} />

      <div className="flex-1 flex overflow-hidden relative">
        {/* AI Panel - Left */}
        <div style={{ width: aiPanelWidth }} className="shrink-0">
          <AiPanel />
        </div>

        {/* AI Panel Resize Handle */}
        <div
          className="nf-resize-handle"
          onMouseDown={startResizeAi}
        />

        {/* Main Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor */}
          <div style={{ width: `${previewWidth}%` }} className="shrink-0 min-w-0">
            <Editor />
          </div>

          {/* Editor/Preview Resize Handle */}
          <div
            className="nf-resize-handle"
            onMouseDown={startResizePreview}
          />

          {/* Preview */}
          <div className="flex-1 min-w-0">
            <Preview triggerBuild={triggerBuild} />
          </div>
        </div>

        {/* Explorer Resize Handle */}
        <div
          className="nf-resize-handle"
          onMouseDown={startResizeExplorer}
        />

        {/* Explorer - Right */}
        <div style={{ width: explorerWidth }} className="shrink-0">
          <Sidebar />
        </div>
      </div>

      <StatusBar />
    </div>
  );
};

export default NeoForge;
