
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
  // Key to force re-render for animation when value changes
  const numberKey = `${label}-${displayedValue}-${currentValue}`; 

  useEffect(() => {
    setDisplayedValue(formatValue(currentValue));
  }, [currentValue]);
  
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center group tabular-nums",
        "min-w-[60px] sm:min-w-[70px] md:min-w-[85px] lg:min-w-[100px]", 
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn(
        "relative w-[60px] h-[70px] sm:w-[70px] sm:h-[80px] md:w-[85px] md:h-[95px] lg:w-[100px] lg:h-[110px]", 
        "bg-card rounded-lg shadow-xl overflow-hidden border-2 border-primary/30 group-hover:border-primary/70 transition-all duration-300",
        "flex items-center justify-center",
        "perspective" 
      )}>
        <div className="transform-style-3d w-full h-full flex items-center justify-center animate-pulse-glow">
          <div
            key={numberKey} 
            className={cn(
              "text-4xl sm:text-5xl md:text-6xl font-bold text-primary tabular-nums",
              "backface-hidden", 
              'animate-value-change' // Animation will play on value change due to key update
            )}
          >
            {displayedValue}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-30 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none"></div>
      </div>
      <span className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-muted-foreground uppercase tracking-wider font-semibold group-hover:text-primary transition-colors duration-300">
        {label}
      </span>
    </div>
  );
};

export default FlipUnit;
