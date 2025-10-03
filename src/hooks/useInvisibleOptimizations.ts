'use client';

import { useEffect, useState } from 'react';
import { getOptimizedAnimationSettings, shouldReduceData } from '@/lib/performance-optimizations';

// Hook para aplicar optimizaciones invisibles
export function useInvisibleOptimizations() {
  const [animationSettings, setAnimationSettings] = useState({ duration: 0.3, ease: 'easeOut' });
  const [shouldReduceDataUsage, setShouldReduceDataUsage] = useState(false);

  useEffect(() => {
    // Configurar optimizaciones basadas en el dispositivo y conexión
    setAnimationSettings(getOptimizedAnimationSettings());
    setShouldReduceDataUsage(shouldReduceData());

    // Aplicar optimizaciones CSS dinámicas
    const style = document.createElement('style');
    style.textContent = `
      /* Optimizaciones de rendimiento invisibles */
      * {
        will-change: auto;
      }
      
      .animate-spin, .animate-pulse, .animate-bounce {
        animation-duration: ${animationSettings.duration}s;
      }
      
      /* Optimizar transformaciones */
      .transform {
        transform: translateZ(0);
      }
      
      /* Optimizar scroll */
      .overflow-hidden {
        contain: layout style paint;
      }
    `;
    
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [animationSettings.duration]);

  return {
    animationSettings,
    shouldReduceDataUsage
  };
}

// Hook para lazy loading mejorado
export function useImprovedLazyLoading(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<Element | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Desconectar inmediatamente para mejor rendimiento
          observer.disconnect();
        }
      },
      { 
        threshold,
        rootMargin: '50px' // Empezar a cargar 50px antes
      }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold]);

  return [setRef, isVisible] as const;
}

// Hook para optimizar imágenes de forma invisible
export function useImageOptimization() {
  const [quality, setQuality] = useState(85);

  useEffect(() => {
    const connection = (navigator as any).connection;
    if (connection) {
      switch (connection.effectiveType) {
        case 'slow-2g':
        case '2g':
          setQuality(60);
          break;
        case '3g':
          setQuality(75);
          break;
        default:
          setQuality(85);
      }
    }
  }, []);

  return { quality };
}