import { cn } from '@/lib/utils';

interface OptimizedLoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'skeleton' | 'pulse';
}

export function OptimizedLoading({ 
  className, 
  size = 'md', 
  variant = 'spinner' 
}: OptimizedLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  if (variant === 'spinner') {
    return (
      <div className={cn(
        "animate-spin border-2 border-primary border-t-transparent rounded-full",
        sizeClasses[size],
        className
      )} />
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className={cn(
        "animate-pulse bg-muted rounded",
        className
      )} />
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn(
        "animate-pulse bg-gradient-to-r from-muted via-muted-foreground/20 to-muted rounded",
        className
      )} />
    );
  }

  return null;
}

// Componente de skeleton para secciones
export function SectionSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      <OptimizedLoading variant="skeleton" className="h-8 w-64 mx-auto" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <OptimizedLoading key={i} variant="skeleton" className="h-48 w-full" />
        ))}
      </div>
    </div>
  );
}