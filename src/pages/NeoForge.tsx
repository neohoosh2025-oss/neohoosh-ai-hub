import { useEffect } from 'react';
import { Header } from '@/components/neoforge/Header';
import { FileTree } from '@/components/neoforge/FileTree';
import { CodeEditor } from '@/components/neoforge/CodeEditor';
import { PreviewPanel } from '@/components/neoforge/PreviewPanel';
import { AICommandBar } from '@/components/neoforge/AICommandBar';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

const NeoForge = () => {
  useEffect(() => {
    document.title = 'NeoForge - AI Code Playground';
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* File Explorer */}
          <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
            <FileTree />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Editor + AI */}
          <ResizablePanel defaultSize={45} minSize={30}>
            <div className="h-full flex flex-col">
              <div className="flex-1 overflow-hidden">
                <CodeEditor />
              </div>
              <AICommandBar />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Preview */}
          <ResizablePanel defaultSize={40} minSize={25}>
            <PreviewPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default NeoForge;
