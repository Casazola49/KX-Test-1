
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
        "flex items-center justify-center flip-unit-fixed",
        // Tamaños más pequeños para móviles muy pequeños
        "w-[28px] h-[36px]", // 320px y menores
        "xs:w-[32px] xs:h-[40px]", // 360px
        "sm:w-[42px] sm:h-[52px]", // 480px+
        "md:w-[60px] md:h-[72px]", // 768px+
        "lg:w-[75px] lg:h-[90px]", // 1024px+
        "xl:w-[85px] xl:h-[95px]", // 1280px+
        "perspective" 
      )}>
        <div className={cn(
          "transform-style-3d w-full h-full flex items-center justify-center",
          shouldAnimate && "animate-pulse-glow"
        )}>
          <div
            key={shouldAnimate ? numberKey : `static-${label}`} 
            className={cn(
              // Tamaños de texto más pequeños para móviles
              "text-xs", // 320px y menores
              "xs:text-sm", // 360px
              "sm:text-base", // 480px+
              "md:text-xl", // 768px+
              "lg:text-2xl", // 1024px+
              "xl:text-3xl", // 1280px+
              "font-bold text-primary tabular-nums",
              "backface-hidden", 
              shouldAnimate && 'animate-value-change' // Animation will play on value change due to key update
            )}
          >
            {displayedValue}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-30 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none"></div>
      </div>
      <span className={cn(
        "mt-0.5 sm:mt-1 text-muted-foreground uppercase tracking-wide font-semibold group-hover:text-primary transition-colors duration-300",
        // Tamaños de etiquetas más pequeños para móviles
        "text-[7px]", // 320px y menores
        "xs:text-[8px]", // 360px
        "sm:text-[9px]", // 480px+
        "md:text-[10px]", // 768px+
        "lg:text-xs", // 1024px+
        "xl:text-sm" // 1280px+
      )}>
        {label}
      </span>
    </div>
  );
};

export default FlipUnit;
