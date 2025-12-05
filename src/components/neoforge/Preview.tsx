import { useEffect, useRef, useState } from 'react';
import { useFilesStore } from '@/store/filesStore';
import { RefreshCw, ExternalLink, Monitor, Tablet, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewportSize = 'desktop' | 'tablet' | 'mobile';

const viewportSizes: Record<ViewportSize, { width: string; label: string }> = {
  desktop: { width: '100%', label: 'Desktop' },
  tablet: { width: '768px', label: 'Tablet' },
  mobile: { width: '375px', label: 'Mobile' },
};

interface PreviewProps {
  triggerBuild: number;
}

export const Preview = ({ triggerBuild }: PreviewProps) => {
  const { files } = useFilesStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [url, setUrl] = useState('localhost:3000');

  const buildPreview = () => {
    setIsLoading(true);

    const htmlFile = files['index-html'];
    const cssFile = files['style-css'];
    const mainJsFile = files['main-js'];
    const appJsxFile = files['app-jsx'];

    if (!htmlFile || !cssFile || !mainJsFile || !appJsxFile) {
      setIsLoading(false);
      return;
    }

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
${appJsxFile.content.replace(/export\s+/g, '')}

const app = document.getElementById('app');
if (app && typeof createApp === 'function') {
  app.innerHTML = createApp();
  
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

    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(combinedHtml);
        doc.close();
      }
    }

    setTimeout(() => setIsLoading(false), 300);
  };

  useEffect(() => {
    buildPreview();
  }, [triggerBuild]);

  const openInNewTab = () => {
    const htmlFile = files['index-html'];
    const cssFile = files['style-css'];
    const appJsxFile = files['app-jsx'];

    if (!htmlFile || !cssFile || !appJsxFile) return;

    const combinedHtml = `<!DOCTYPE html><html><head><style>${cssFile.content}</style></head><body><div id="app"></div><script>${appJsxFile.content.replace(/export\s+/g, '')}
const app = document.getElementById('app');if (app && typeof createApp === 'function') { app.innerHTML = createApp(); }</script></body></html>`;

    const blob = new Blob([combinedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="h-full flex flex-col bg-[#111111]">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-[#27272A]">
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-[#A1A1AA] uppercase tracking-wider">
            Preview
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Viewport Toggles */}
          <div className="flex items-center bg-[#1A1A1A] rounded-lg p-0.5 mr-2">
            {(['desktop', 'tablet', 'mobile'] as ViewportSize[]).map((size) => (
              <button
                key={size}
                onClick={() => setViewport(size)}
                className={cn(
                  "p-2 rounded-md transition-all",
                  viewport === size 
                    ? "bg-[#2A2A2A] text-[#F5F5F5]" 
                    : "text-[#71717A] hover:text-[#A1A1AA]"
                )}
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
            className="p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors text-[#A1A1AA] hover:text-[#F5F5F5]"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </button>
          <button
            onClick={openInNewTab}
            className="p-2 rounded-lg hover:bg-[#2A2A2A] transition-colors text-[#A1A1AA] hover:text-[#F5F5F5]"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* URL Bar */}
      <div className="h-10 px-4 flex items-center border-b border-[#27272A]">
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-[#1A1A1A] rounded-lg">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[13px] text-[#71717A]">{url}</span>
        </div>
      </div>

      {/* Preview Container */}
      <div className="flex-1 overflow-hidden bg-[#1A1A1A] p-4 flex items-start justify-center">
        <div
          className={cn(
            "h-full bg-white rounded-xl overflow-hidden transition-all duration-300 shadow-2xl",
            viewport !== 'desktop' && "border-4 border-[#27272A]"
          )}
          style={{ 
            width: viewportSizes[viewport].width,
            maxWidth: '100%'
          }}
        >
          {isLoading ? (
            <div className="h-full flex items-center justify-center bg-[#0D0D0D]">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#7C3AED]" />
                <span className="text-[13px] text-[#71717A]">Building...</span>
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
