import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useFilesStore } from '@/store/filesStore';
import { RefreshCw, ExternalLink, Monitor, Tablet, Smartphone, Globe, AlertCircle } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [hasContent, setHasContent] = useState(false);
  const buildIdRef = useRef(0);

  // Get all CSS content
  const cssContent = useMemo(() => {
    return Object.values(files)
      .filter(f => f.type === 'file' && f.name.endsWith('.css'))
      .map(f => f.content || '')
      .join('\n\n');
  }, [files]);

  // Get all JS/JSX content in correct order
  const jsContent = useMemo(() => {
    const fileList = Object.values(files).filter(f => f.type === 'file');
    const jsFiles: string[] = [];
    
    // Add App.jsx first
    const appFile = fileList.find(f => f.name.toLowerCase() === 'app.jsx' || f.name.toLowerCase() === 'app.js');
    if (appFile?.content) {
      jsFiles.push(appFile.content);
    }
    
    // Then add main.js
    const mainFile = fileList.find(f => f.name === 'main.js' || f.name === 'index.js');
    if (mainFile?.content) {
      jsFiles.push(mainFile.content);
    }
    
    // Add other JS files (excluding already added)
    fileList.forEach(f => {
      if ((f.name.endsWith('.js') || f.name.endsWith('.jsx')) && f !== appFile && f !== mainFile && f.content) {
        jsFiles.push(f.content);
      }
    });
    
    return jsFiles.join('\n\n');
  }, [files]);

  // Get HTML content
  const htmlContent = useMemo(() => {
    const htmlFile = Object.values(files).find(f => f.type === 'file' && f.name.endsWith('.html'));
    return htmlFile?.content || '';
  }, [files]);

  const buildPreview = useCallback(() => {
    const currentBuildId = ++buildIdRef.current;
    setIsLoading(true);
    setError(null);
    
    // Clean JS content - remove imports/exports for browser execution
    let cleanJs = jsContent
      .replace(/import\s+.*?from\s+['"][^'"]+['"];?\s*/g, '')
      .replace(/import\s+['"][^'"]+['"];?\s*/g, '')
      .replace(/export\s+(default\s+)?/g, '')
      .trim();

    const hasAnyContent = !!(cssContent.trim() || cleanJs.trim() || htmlContent.trim());
    setHasContent(hasAnyContent);

    if (!hasAnyContent) {
      setIsLoading(false);
      return;
    }
    
    const combinedHtml = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; min-height: 100vh; }
${cssContent}
  </style>
</head>
<body>
  <div id="app"></div>
  <div id="root"></div>
  <script>
    (function() {
      try {
${cleanJs}

        // Initialize app
        var container = document.getElementById('app') || document.getElementById('root');
        
        if (container) {
          // Try different initialization patterns
          if (typeof createApp === 'function') {
            var result = createApp();
            if (typeof result === 'string') {
              container.innerHTML = result;
            }
          } else if (typeof App === 'function') {
            var result = App();
            if (typeof result === 'string') {
              container.innerHTML = result;
            }
          } else if (typeof render === 'function') {
            render(container);
          } else if (typeof init === 'function') {
            init();
          }
        }
        
        // Setup interactive elements
        var count = 0;
        var countEl = document.getElementById('count');
        var incrementBtn = document.getElementById('increment');
        var decrementBtn = document.getElementById('decrement');
        
        if (incrementBtn && decrementBtn && countEl) {
          incrementBtn.onclick = function() { count++; countEl.textContent = count; };
          decrementBtn.onclick = function() { count--; countEl.textContent = count; };
        }
        
        console.log('✅ Preview loaded');
      } catch (error) {
        console.error('Preview error:', error);
        document.body.innerHTML = '<div style="padding: 24px; color: #ef4444; font-family: monospace; background: #0a0a0f; min-height: 100vh;"><h3 style="margin-bottom: 12px; color: #f87171;">⚠️ Error</h3><pre style="white-space: pre-wrap; color: #fca5a5; background: rgba(239,68,68,0.1); padding: 16px; border-radius: 8px;">' + error.message + '</pre></div>';
      }
    })();
  </script>
</body>
</html>`;

    if (iframeRef.current && currentBuildId === buildIdRef.current) {
      try {
        const blob = new Blob([combinedHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        // Timeout fallback - hide loading after 3 seconds max
        const loadingTimeout = setTimeout(() => {
          if (currentBuildId === buildIdRef.current) {
            setIsLoading(false);
          }
        }, 3000);
        
        iframeRef.current.onload = () => {
          clearTimeout(loadingTimeout);
          if (currentBuildId === buildIdRef.current) {
            setIsLoading(false);
          }
          URL.revokeObjectURL(url);
        };
        
        iframeRef.current.onerror = () => {
          clearTimeout(loadingTimeout);
          if (currentBuildId === buildIdRef.current) {
            setError('Failed to load preview');
            setIsLoading(false);
          }
        };
        
        iframeRef.current.src = url;
      } catch (e) {
        setError('Failed to build preview');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [cssContent, jsContent, htmlContent]);

  // Build on mount and when trigger changes
  useEffect(() => {
    const timer = setTimeout(buildPreview, 100);
    return () => clearTimeout(timer);
  }, [triggerBuild, buildPreview]);

  const openInNewTab = useCallback(() => {
    let cleanJs = jsContent
      .replace(/import\s+.*?from\s+['"][^'"]+['"];?\s*/g, '')
      .replace(/import\s+['"][^'"]+['"];?\s*/g, '')
      .replace(/export\s+(default\s+)?/g, '');

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:system-ui,sans-serif;}${cssContent}</style></head><body><div id="app"></div><script>try{${cleanJs}
var app=document.getElementById('app');if(app){if(typeof createApp==='function'){app.innerHTML=createApp();}else if(typeof App==='function'){app.innerHTML=App();}}}catch(e){document.body.innerHTML='<pre style="padding:20px;color:red;">'+e.message+'</pre>';}</script></body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }, [cssContent, jsContent]);

  return (
    <div className="h-full flex flex-col bg-[#050507]" dir="ltr">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0a0a0d] border-b border-[rgba(255,255,255,0.06)]">
        <span className="text-sm font-medium text-[#a1a1aa] hidden sm:inline">Preview</span>

        <div className="flex items-center gap-1 flex-1 sm:flex-none justify-end">
          {/* Viewport Toggles */}
          <div className="hidden sm:flex items-center p-1 rounded-lg mr-2 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
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
            className="p-2 rounded-lg text-[#71717a] hover:text-[#fafafa] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin text-[#8b5cf6]")} />
          </button>
          <button
            onClick={openInNewTab}
            className="p-2 rounded-lg text-[#71717a] hover:text-[#fafafa] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-auto p-2 sm:p-4 flex items-start justify-center bg-[#050507]">
        <div
          className={cn(
            "transition-all duration-300 w-full h-full",
            viewport !== 'desktop' && "shadow-2xl"
          )}
          style={{ 
            maxWidth: viewport === 'desktop' ? '100%' : viewportSizes[viewport].width,
            height: '100%',
            minHeight: '200px'
          }}
        >
          {/* Browser Chrome */}
          <div className="h-full flex flex-col overflow-hidden rounded-lg bg-[#18181c] border border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center gap-3 px-3 py-2 bg-[#0f0f12] border-b border-[rgba(255,255,255,0.06)]">
              <div className="hidden sm:flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#f87171]" />
                <div className="w-3 h-3 rounded-full bg-[#fbbf24]" />
                <div className="w-3 h-3 rounded-full bg-[#34d399]" />
              </div>
              <div className="flex items-center gap-2 text-xs text-[#52525b] flex-1 sm:flex-none">
                <Globe className="w-3 h-3" />
                <span>localhost:3000</span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 bg-white relative overflow-hidden">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f] z-10">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-[#71717a]">Building...</span>
                  </div>
                </div>
              )}
              
              {error ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f] text-[#f87171] p-4">
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-[#f87171]" />
                    <p className="text-sm mb-2">Error</p>
                    <p className="text-xs text-[#71717a]">{error}</p>
                  </div>
                </div>
              ) : !hasContent && !isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f] p-4">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[rgba(139,92,246,0.1)] flex items-center justify-center">
                      <Globe className="w-8 h-8 text-[#8b5cf6]" />
                    </div>
                    <p className="text-[#a1a1aa] text-sm mb-1">No preview available</p>
                    <p className="text-[#52525b] text-xs">Ask AI to create a project</p>
                  </div>
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  className="w-full h-full border-0 bg-white"
                  title="Preview"
                  sandbox="allow-scripts allow-modals allow-forms"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
