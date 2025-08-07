
import type React from 'react';
import { cn } from '@/lib/utils';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  container?: boolean;
  children: React.ReactNode;
  className?: string;
  title?: string;
  titleClassName?: string;
  subtitle?: string;
  subtitleClassName?: string;
}

const Section: React.FC<SectionProps> = ({
  as: Component = 'section',
  container = true,
  children,
  className,
  title,
  titleClassName,
  subtitle,
  subtitleClassName,
  ...props
}) => {
  const sectionContent = (
    <>
      {(title || subtitle) && (
        <div className="mb-4 md:mb-6 text-center">
          {subtitle && <p className={cn("text-base md:text-lg text-primary font-semibold mb-1 font-headline", subtitleClassName)}>{subtitle}</p>}
          {title && <h2 className={cn("text-2xl md:text-3xl lg:text-4xl font-bold font-headline", titleClassName)}>{title}</h2>}
        </div>
      )}
      {children}
    </>
  );

  return (
    <Component className={cn('py-6 md:py-8 lg:py-10', className)} {...props}>
      {container ? <div className="container mx-auto px-4">{sectionContent}</div> : sectionContent}
    </Component>
  );
};

export default Section;
