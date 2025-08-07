
"use client"
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  showBackButton?: boolean;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle, className, titleClassName, subtitleClassName, showBackButton = false }) => {
  const router = useRouter();
  
  return (
    <div className={cn("relative py-8 md:py-12 text-center bg-gradient-to-b from-card to-background", className)}>
       {showBackButton && (
        <div className="absolute top-1/2 -translate-y-1/2 left-4 md:left-8">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Go back</span>
            </Button>
        </div>
      )}
      <div className="container mx-auto px-4">
        {subtitle && <p className={cn("text-lg md:text-xl text-primary font-semibold mb-2 font-headline", subtitleClassName)}>{subtitle}</p>}
        <h1 className={cn("text-4xl md:text-5xl lg:text-6xl font-bold font-headline text-foreground", titleClassName)}>{title}</h1>
      </div>
    </div>
  );
};

export default PageTitle;
