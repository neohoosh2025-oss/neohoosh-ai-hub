import { lazy, ComponentType, createElement } from "react";

/**
 * Utility for lazy loading components with better error boundaries
 */
export function lazyLoadComponent<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  componentName?: string
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (error) {
      console.error(`Failed to load component ${componentName || 'unknown'}:`, error);
      // Return a fallback component
      const FallbackComponent: ComponentType<any> = () => {
        return createElement(
          'div',
          { className: 'p-8 text-center text-muted-foreground' },
          'خطا در بارگذاری بخش. لطفا صفحه را رفرش کنید.'
        );
      };
      return {
        default: FallbackComponent as T,
      };
    }
  });
}

/**
 * Preload a lazy component
 */
export function preloadComponent(factory: () => Promise<any>) {
  factory().catch((error) => {
    console.error('Failed to preload component:', error);
  });
}
