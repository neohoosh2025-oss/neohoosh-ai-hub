/**
 * Critical CSS - Inline styles for above-the-fold content
 * Improves FCP by providing immediate styles
 */
export const CriticalCSS = () => (
  <style dangerouslySetInnerHTML={{
    __html: `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      html {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      body {
        font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif;
        background: hsl(var(--background));
        color: hsl(var(--foreground));
        min-height: 100vh;
      }
      
      #root {
        min-height: 100vh;
      }
      
      .min-h-screen {
        min-height: 100vh;
      }
      
      .flex {
        display: flex;
      }
      
      .items-center {
        align-items: center;
      }
      
      .justify-center {
        justify-content: center;
      }
      
      .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: .5; }
      }
    `
  }} />
);
