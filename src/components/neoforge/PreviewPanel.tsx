import { useEffect, useRef, useState } from 'react';
import { useFilesStore } from '@/store/filesStore';
import { Play, RefreshCw, ExternalLink, Monitor, Smartphone, Tablet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const viewportSizes: Record<ViewportSize, { width: string; icon: React.ReactNode }> = {
  desktop: { width: '100%', icon: <Monitor className="w-4 h-4" /> },
  tablet: { width: '768px', icon: <Tablet className="w-4 h-4" /> },
  mobile: { width: '375px', icon: <Smartphone className="w-4 h-4" /> },
};

export const PreviewPanel = () => {
  const { files } = useFilesStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [lastBuildTime, setLastBuildTime] = useState<Date | null>(null);

  const buildPreview = () => {
    setIsLoading(true);

    // Get file contents
    const htmlFile = files['index-html'];
    const cssFile = files['style-css'];
    const mainJsFile = files['main-js'];
    const appJsxFile = files['app-jsx'];

    if (!htmlFile || !cssFile || !mainJsFile || !appJsxFile) {
      setIsLoading(false);
      return;
    }

    // Create a combined HTML document
    const combinedHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
${cssFile.content}
  </style>
</head>
<body>
  <div id="app"></div>
  <script>
// App.jsx content
${appJsxFile.content.replace(/export\s+/g, '')}

// main.js content (modified)
const app = document.getElementById('app');
if (app && typeof createApp === 'function') {
  app.innerHTML = createApp();
  
  // Initialize counter
  let count = 0;
  const countEl = document.getElementById('count');
  const incrementBtn = document.getElementById('increment');
  const decrementBtn = document.getElementById('decrement');
  
  if (incrementBtn && decrementBtn && countEl) {
    incrementBtn.addEventListener('click', () => {
      count++;
      countEl.textContent = count;
    });
    
    decrementBtn.addEventListener('click', () => {
      count--;
      countEl.textContent = count;
    });
  }
}

console.log('🚀 Preview loaded!');
  </script>
</body>
</html>
`;

    // Write to iframe
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(combinedHtml);
        doc.close();
      }
    }

    setLastBuildTime(new Date());
    setTimeout(() => setIsLoading(false), 300);
  };

  // Auto-build on mount
  useEffect(() => {
    buildPreview();
  }, []);

  const openInNewTab = () => {
    const htmlFile = files['index-html'];
    const cssFile = files['style-css'];
    const appJsxFile = files['app-jsx'];

    if (!htmlFile || !cssFile || !appJsxFile) return;

    const combinedHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>${cssFile.content}</style>
</head>
<body>
  <div id="app"></div>
  <script>
${appJsxFile.content.replace(/export\s+/g, '')}
const app = document.getElementById('app');
if (app && typeof createApp === 'function') {
  app.innerHTML = createApp();
  let count = 0;
  const countEl = document.getElementById('count');
  const incrementBtn = document.getElementById('increment');
  const decrementBtn = document.getElementById('decrement');
  if (incrementBtn && decrementBtn && countEl) {
    incrementBtn.addEventListener('click', () => { count++; countEl.textContent = count; });
    decrementBtn.addEventListener('click', () => { count--; countEl.textContent = count; });
  }
}
  </script>
</body>
</html>`;

    const blob = new Blob([combinedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Preview</span>
          {lastBuildTime && (
            <span className="text-xs text-muted-foreground">
              Built: {lastBuildTime.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Viewport Toggles */}
          {(Object.keys(viewportSizes) as ViewportSize[]).map((size) => (
            <Button
              key={size}
              variant={viewport === size ? 'secondary' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewport(size)}
            >
              {viewportSizes[size].icon}
            </Button>
          ))}
          
          <div className="w-px h-4 bg-border mx-1" />
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={buildPreview}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={openInNewTab}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-7 gap-1.5"
            onClick={buildPreview}
            disabled={isLoading}
          >
            <Play className="w-3.5 h-3.5" />
            Run
          </Button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-hidden bg-background p-4 flex items-start justify-center">
        <div
          className={cn(
            "h-full bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300",
            viewport !== 'desktop' && "border border-border"
          )}
          style={{ 
            width: viewportSizes[viewport].width,
            maxWidth: '100%'
          }}
        >
          {isLoading ? (
            <div className="h-full flex items-center justify-center bg-background">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Building...</span>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              title="Preview"
              sandbox="allow-scripts allow-modals"
            />
          )}
        </div>
      </div>
    </div>
  );
};
