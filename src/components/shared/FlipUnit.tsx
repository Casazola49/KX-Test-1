
"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface FlipUnitProps {
  currentValue: number;
  label: string;
  className?: string;
  delay?: number; 
}

const formatValue = (val: number) => String(val).padStart(2, '0');

const FlipUnit: React.FC<FlipUnitProps> = ({ currentValue, label, className, delay = 0 }) => {
  const [displayedValue, setDisplayedValue] = useState(formatValue(currentValue));
  const [shouldAnimate, setShouldAnimate] = useState(true);
  // Key to force re-render for animation when value changes
  const numberKey = `${label}-${displayedValue}-${currentValue}`; 

  useEffect(() => {
    // Detectar si debemos reducir animaciones
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    
    setShouldAnimate(!prefersReducedMotion && !isMobile);
    setDisplayedValue(formatValue(currentValue));
  }, [currentValue]);
  
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center group tabular-nums flex-shrink-0",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn(
        "relative bg-card rounded-md sm:rounded-lg shadow-lg sm:shadow-xl overflow-hidden border border-primary/30 sm:border-2 group-hover:border-primary/70 transition-all duration-300",
        "flex items-center justify-center",
        "w-[32px] h-[40px] xs:w-[36px] xs:h-[44px] sm:w-[50px] sm:h-[60px] md:w-[70px] md:h-[80px] lg:w-[85px] lg:h-[95px]",
        "perspective" 
      )}>
        <div className={cn(
          "transform-style-3d w-full h-full flex items-center justify-center",
          shouldAnimate && "animate-pulse-glow"
        )}>
          <div
            key={shouldAnimate ? numberKey : `static-${label}`} 
            className={cn(
              "text-sm xs:text-base sm:text-lg md:text-2xl lg:text-3xl font-bold text-primary tabular-nums",
              "backface-hidden", 
              shouldAnimate && 'animate-value-change' // Animation will play on value change due to key update
            )}
          >
            {displayedValue}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-30 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none"></div>
      </div>
      <span className="mt-0.5 sm:mt-1 text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs lg:text-sm text-muted-foreground uppercase tracking-wide font-semibold group-hover:text-primary transition-colors duration-300">
        {label}
      </span>
    </div>
  );
};

export default FlipUnit;
