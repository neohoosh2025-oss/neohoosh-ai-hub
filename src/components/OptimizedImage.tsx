import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
  sizes?: string;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

/**
 * Optimized Image Component for Better Performance
 * - Lazy loading by default
 * - Proper aspect ratio to prevent CLS
 * - Loading placeholder
 * - Error handling
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  loading = "lazy",
  priority = false,
  sizes,
  objectFit = "cover",
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (priority && imgRef.current && imgRef.current.complete) {
      setIsLoaded(true);
    }
  }, [priority]);

  const aspectRatio = width && height ? (height / width) * 100 : undefined;

  return (
    <div
      className={cn("relative overflow-hidden bg-muted", className)}
      style={{
        paddingBottom: aspectRatio ? `${aspectRatio}%` : undefined,
      }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : loading}
        sizes={sizes}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={cn(
          "transition-opacity duration-300",
          aspectRatio && "absolute inset-0 w-full h-full",
          `object-${objectFit}`,
          isLoaded ? "opacity-100" : "opacity-0",
          hasError && "hidden"
        )}
        decoding="async"
      />
      
      {/* Loading placeholder */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-muted via-muted-foreground/10 to-muted" />
      )}
      
      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-sm">
          تصویر بارگذاری نشد
        </div>
      )}
    </div>
  );
}
