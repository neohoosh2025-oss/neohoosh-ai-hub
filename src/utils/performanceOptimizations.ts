/**
 * Performance optimization utilities
 */

/**
 * Lazy load images when they enter viewport
 */
export const setupLazyLoading = () => {
  if ('loading' in HTMLImageElement.prototype) {
    return; // Native lazy loading is supported
  }

  // Fallback for browsers that don't support native lazy loading
  const images = document.querySelectorAll('img[loading="lazy"]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || img.src;
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  }
};

/**
 * Preconnect to external origins
 */
export const preconnectToOrigins = (origins: string[]) => {
  origins.forEach((origin) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

/**
 * Remove unused CSS
 */
export const removeUnusedStyles = () => {
  if (typeof window === 'undefined') return;
  
  // This will be handled by build process
  // But we can mark styles as used/unused at runtime
  const styleSheets = Array.from(document.styleSheets);
  
  styleSheets.forEach((sheet) => {
    try {
      if (sheet.href && !sheet.href.includes(window.location.origin)) {
        return; // Skip external stylesheets
      }
    } catch (e) {
      // Cross-origin stylesheet, skip
    }
  });
};

/**
 * Defer non-critical JavaScript
 */
export const deferNonCriticalJS = () => {
  // Load analytics, chat widgets, etc. after page load
  if (document.readyState === 'complete') {
    loadNonCriticalScripts();
  } else {
    window.addEventListener('load', loadNonCriticalScripts);
  }
};

function loadNonCriticalScripts() {
  // Placeholder for non-critical scripts
  // Can be extended to load analytics, chat widgets, etc.
}
