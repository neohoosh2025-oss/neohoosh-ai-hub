import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileOptimizedProps {
  children: ReactNode;
  className?: string;
  spacing?: "sm" | "md" | "lg";
}

export function MobileOptimized({ 
  children, 
  className,
  spacing = "md" 
}: MobileOptimizedProps) {
  const spacingClasses = {
    sm: "px-4 py-6 md:px-6 md:py-8",
    md: "px-4 py-8 md:px-6 md:py-12",
    lg: "px-4 py-12 md:px-8 md:py-16"
  };

  return (
    <div className={cn(spacingClasses[spacing], className)}>
      {children}
    </div>
  );
}

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function MobileContainer({ 
  children, 
  className,
  size = "lg" 
}: MobileContainerProps) {
  const sizeClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl"
  };

  return (
    <div className={cn("container mx-auto", sizeClasses[size], className)}>
      {children}
    </div>
  );
}

interface MobileStackProps {
  children: ReactNode;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function MobileStack({ 
  children, 
  gap = "md",
  className 
}: MobileStackProps) {
  const gapClasses = {
    sm: "space-y-4 md:space-y-6",
    md: "space-y-6 md:space-y-8",
    lg: "space-y-8 md:space-y-12"
  };

  return (
    <div className={cn(gapClasses[gap], className)}>
      {children}
    </div>
  );
}
