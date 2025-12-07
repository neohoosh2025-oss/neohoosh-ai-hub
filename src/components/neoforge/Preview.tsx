import { useEffect, useRef, useState, useCallback } from 'react';
import { useFilesStore } from '@/store/filesStore';
import { RefreshCw, ExternalLink, Monitor, Tablet, Smartphone, Globe, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const viewportSizes: Record<ViewportSize, { width: string; height: string; label: string }> = {
  desktop: { width: '100%', height: '100%', label: 'Desktop' },
  tablet: { width: '768px', height: '1024px', label: 'Tablet' },
  mobile: { width: '375px', height: '667px', label: 'Mobile' },
};

interface PreviewProps {
  triggerBuild: number;
}

export const Preview = ({ triggerBuild }: PreviewProps) => {
  const { files } = useFilesStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [lastBuildTime, setLastBuildTime] = useState<number>(0);

  // Helper to find file by path or name patterns
  const findFile = useCallback((patterns: string[]) => {
    const fileList = Object.values(files);
    for (const pattern of patterns) {
      // Try exact path match
      const exactMatch = fileList.find(f => f.path === pattern || f.path === `/${pattern}`);
      if (exactMatch) return exactMatch;
      
      // Try name match
      const nameMatch = fileList.find(f => f.name === pattern);
      if (nameMatch) return nameMatch;
      
      // Try path contains
      const containsMatch = fileList.find(f => f.path.includes(pattern));
      if (containsMatch) return containsMatch;
    }
    return null;
  }, [files]);

  // Get all CSS content
  const getAllCss = useCallback(() => {
    return Object.values(files)
      .filter(f => f.type === 'file' && (f.name.endsWith('.css') || f.path.includes('.css')))
      .map(f => f.content)
      .join('\n\n');
  }, [files]);

  // Get main JavaScript/JSX content
  const getMainJs = useCallback(() => {
    const fileList = Object.values(files).filter(f => f.type === 'file');
    
    // Priority order for main entry
    const priorities = [
      'App.jsx', 'App.tsx', 'app.jsx', 'app.tsx',
      'main.jsx', 'main.tsx', 'main.js', 'index.jsx', 'index.tsx'
    ];
    
    for (const name of priorities) {
      const file = fileList.find(f => f.name === name);
      if (file) return file.content;
    }
    
    // Fallback: any jsx/tsx/js file in src
    const jsFile = fileList.find(f => 
      (f.name.endsWith('.jsx') || f.name.endsWith('.tsx') || f.name.endsWith('.js')) &&
      f.path.includes('/src/')
    );
    
    return jsFile?.content || '';
  }, [files]);

  const buildPreview = useCallback(() => {
    setIsLoading(true);
    
    const cssContent = getAllCss();
    const jsContent = getMainJs();
    
    // Find HTML file or use default
    const htmlFile = findFile(['index.html', 'public/index.html']);
    
    // Clean JS content (remove imports/exports for simple execution)
    let cleanJs = jsContent
      .replace(/import\s+.*?from\s+['"][^'"]+['"];?\s*/g, '')
      .replace(/import\s+['"][^'"]+['"];?\s*/g, '')
      .replace(/export\s+(default\s+)?/g, '');
    
    const combinedHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
${cssContent}
  </style>
</head>
<body>
  <div id="app"></div>
  <div id="root"></div>
  <script>
    try {
${cleanJs}

      // Try different app initialization patterns
      const app = document.getElementById('app') || document.getElementById('root');
      
      if (app) {
        // Pattern 1: createApp function
        if (typeof createApp === 'function') {
          const result = createApp();
          if (typeof result === 'string') {
            app.innerHTML = result;
          }
        }
        // Pattern 2: App component function
        else if (typeof App === 'function') {
          const result = App();
          if (typeof result === 'string') {
            app.innerHTML = result;
          }
        }
        // Pattern 3: render function
        else if (typeof render === 'function') {
          render(app);
        }
      }
      
      // Initialize any counters or interactive elements
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
      
      console.log('🚀 Preview loaded!');
    } catch (error) {
      console.error('Preview error:', error);
      document.body.innerHTML = '<div style="padding: 20px; color: #ef4444; font-family: monospace;"><h3>Error:</h3><pre>' + error.message + '</pre></div>';
    }
  </script>
</body>
</html>
`;

    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(combinedHtml);
        doc.close();
      }
    }

    setLastBuildTime(Date.now());
    setTimeout(() => setIsLoading(false), 300);
  }, [getAllCss, getMainJs, findFile]);

  // Build when triggered or when files change
  useEffect(() => {
    buildPreview();
  }, [triggerBuild]);
  
  // Auto-rebuild when files change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only rebuild if enough time has passed since last build
      if (Date.now() - lastBuildTime > 500) {
        buildPreview();
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, [files, lastBuildTime]);

  const openInNewTab = () => {
    const cssContent = getAllCss();
    const jsContent = getMainJs();
    
    let cleanJs = jsContent
      .replace(/import\s+.*?from\s+['"][^'"]+['"];?\s*/g, '')
      .replace(/import\s+['"][^'"]+['"];?\s*/g, '')
      .replace(/export\s+(default\s+)?/g, '');

    const combinedHtml = `<!DOCTYPE html><html><head><style>${cssContent}</style></head><body><div id="app"></div><script>try{${cleanJs}
const app=document.getElementById('app');if(app&&typeof createApp==='function'){app.innerHTML=createApp();}}catch(e){document.body.innerHTML='<pre>'+e.message+'</pre>';}</script></body></html>`;

    const blob = new Blob([combinedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="h-full flex flex-col bg-[#050507]">
      {/* Toolbar */}
      <div className="nf-panel-header bg-[#0a0a0d]">
        <span className="nf-panel-title">Preview</span>

        <div className="flex items-center gap-1">
          {/* Viewport Toggles */}
          <div className={cn(
            "flex items-center p-1 rounded-lg mr-2",
            "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]"
          )}>
            {(['desktop', 'tablet', 'mobile'] as ViewportSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setViewport(size)}
                className={cn(
                  "p-1.5 rounded-md transition-all duration-200",
                  viewport === size 
                    ? "bg-[rgba(139,92,246,0.15)] text-[#8b5cf6]" 
                    : "text-[#52525b] hover:text-[#a1a1aa]"
                )}
                title={viewportSizes[size].label}
              >
                {size === 'desktop' && <Monitor className="w-4 h-4" />}
                {size === 'tablet' && <Tablet className="w-4 h-4" />}
                {size === 'mobile' && <Smartphone className="w-4 h-4" />}
              </button>
            ))}
          </div>

          <button
            onClick={buildPreview}
            disabled={isLoading}
            className="nf-icon-btn w-8 h-8"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin text-[#8b5cf6]")} />
          </button>
          <button
            onClick={openInNewTab}
            className="nf-icon-btn w-8 h-8"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            className="nf-icon-btn w-8 h-8"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className={cn(
        "flex-1 overflow-auto p-6 flex items-start justify-center",
        "bg-[#050507] nf-dots-pattern"
      )}>
        <div
          className={cn(
            "transition-all duration-300",
            viewport !== 'desktop' && "shadow-2xl"
          )}
          style={{ 
            width: viewportSizes[viewport].width,
            height: viewport === 'desktop' ? '100%' : viewportSizes[viewport].height,
            maxWidth: '100%',
            minHeight: '400px'
          }}
        >
          {/* Browser Chrome */}
          <div className="nf-preview-frame h-full flex flex-col overflow-hidden">
            <div className="nf-preview-header shrink-0">
              <div className="nf-preview-dots">
                <div className="nf-preview-dot nf-preview-dot-red" />
                <div className="nf-preview-dot nf-preview-dot-yellow" />
                <div className="nf-preview-dot nf-preview-dot-green" />
              </div>
              <div className="nf-preview-url flex items-center gap-2">
                <Globe className="w-3 h-3 text-[#71717a]" />
                <span>localhost:3000</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-white relative overflow-hidden">
              {isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#fafafa]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[rgba(139,92,246,0.2)] border-t-[#8b5cf6] rounded-full animate-spin" />
                    <span className="text-[13px] text-[#71717a]">Building...</span>
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
      </div>
    </div>
  );
};
