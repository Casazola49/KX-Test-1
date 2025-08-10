'use client';

import { useState, useEffect } from 'react';

interface CountdownSizes {
  unitWidth: number;
  unitHeight: number;
  fontSize: string;
  labelSize: string;
  gap: string;
  scale: number;
}

export const useResponsiveCountdown = () => {
  const [sizes, setSizes] = useState<CountdownSizes>({
    unitWidth: 40,
    unitHeight: 48,
    fontSize: 'text-lg',
    labelSize: 'text-[10px]',
    gap: 'gap-x-1',
    scale: 1,
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const calculateSizes = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isLandscape = width > height;
      const isMobileDevice = width < 768;
      
      setIsMobile(isMobileDevice);

      // Calcular el ancho disponible para el contador (4 unidades + gaps)
      const availableWidth = Math.min(width * 0.9, 400); // 90% del ancho o máximo 400px
      const unitCount = 4;
      const gapCount = 3;
      
      let newSizes: CountdownSizes;

      if (width <= 320) {
        // iPhone SE y dispositivos muy pequeños
        const unitWidth = Math.floor((availableWidth - (gapCount * 4)) / unitCount);
        newSizes = {
          unitWidth: Math.max(unitWidth, 30),
          unitHeight: Math.max(unitWidth * 1.2, 36),
          fontSize: 'text-sm',
          labelSize: 'text-[8px]',
          gap: 'gap-x-1',
          scale: isLandscape ? 0.7 : 0.9,
        };
      } else if (width <= 360) {
        // Samsung Galaxy S8+, iPhone 12 mini, etc.
        const unitWidth = Math.floor((availableWidth - (gapCount * 6)) / unitCount);
        newSizes = {
          unitWidth: Math.max(unitWidth, 32),
          unitHeight: Math.max(unitWidth * 1.2, 38),
          fontSize: 'text-base',
          labelSize: 'text-[9px]',
          gap: 'gap-x-1.5',
          scale: isLandscape ? 0.75 : 0.95,
        };
      } else if (width <= 375) {
        // iPhone 6/7/8, iPhone X/11/12
        const unitWidth = Math.floor((availableWidth - (gapCount * 8)) / unitCount);
        newSizes = {
          unitWidth: Math.max(unitWidth, 35),
          unitHeight: Math.max(unitWidth * 1.2, 42),
          fontSize: 'text-lg',
          labelSize: 'text-[10px]',
          gap: 'gap-x-2',
          scale: isLandscape ? 0.8 : 1,
        };
      } else if (width <= 414) {
        // iPhone Plus, iPhone 14 Pro Max
        const unitWidth = Math.floor((availableWidth - (gapCount * 10)) / unitCount);
        newSizes = {
          unitWidth: Math.max(unitWidth, 38),
          unitHeight: Math.max(unitWidth * 1.2, 46),
          fontSize: 'text-xl',
          labelSize: 'text-xs',
          gap: 'gap-x-2.5',
          scale: isLandscape ? 0.85 : 1,
        };
      } else if (width < 768) {
        // Móviles grandes y phablets
        const unitWidth = Math.floor((availableWidth - (gapCount * 12)) / unitCount);
        newSizes = {
          unitWidth: Math.max(unitWidth, 45),
          unitHeight: Math.max(unitWidth * 1.2, 54),
          fontSize: 'text-2xl',
          labelSize: 'text-sm',
          gap: 'gap-x-3',
          scale: isLandscape ? 0.9 : 1,
        };
      } else {
        // Tablets y desktop
        newSizes = {
          unitWidth: 75,
          unitHeight: 85,
          fontSize: 'text-4xl',
          labelSize: 'text-sm',
          gap: 'gap-x-4',
          scale: 1,
        };
      }

      setSizes(newSizes);
    };

    // Calcular tamaños iniciales
    calculateSizes();

    // Recalcular en resize y orientación
    const handleResize = () => {
      setTimeout(calculateSizes, 100); // Pequeño delay para estabilizar
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return { sizes, isMobile };
};