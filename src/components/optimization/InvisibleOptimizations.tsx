'use client';

import { useEffect } from 'react';
import { useInvisibleOptimizations } from '@/hooks/useInvisibleOptimizations';

export default function InvisibleOptimizations() {
  const { animationSettings, shouldReduceDataUsage } = useInvisibleOptimizations();

  useEffect(() => {
    // Aplicar optimizaciones de CSS que mejoran el rendimiento sin cambiar la apariencia
    const optimizationStyles = document.createElement('style');
    optimizationStyles.id = 'invisible-optimizations';
    optimizationStyles.textContent = `
      /* Optimizaciones de rendimiento invisibles */
      
      /* Mejorar el rendering de las animaciones */
      .animate-spin, .animate-pulse, .animate-bounce, .animate-fade-in-up {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
      }
      
      /* Optimizar el scroll */
      .overflow-hidden, .overflow-x-hidden, .overflow-y-hidden {
        contain: layout style paint;
      }
      
      /* Optimizar las transiciones */
      .transition-all, .transition-colors, .transition-transform {
        will-change: auto;
      }
      
      /* Optimizar las imágenes */
      img {
        content-visibility: auto;
        contain-intrinsic-size: 300px 200px;
      }
      
      /* Optimizar los carruseles */
      .embla__container {
        contain: layout style paint;
      }
      
      /* Optimizar las tarjetas */
      .bg-card, .bg-background {
        contain: layout style;
      }
      
      /* Reducir el repaint en hover */
      .hover\\:scale-105:hover {
        transform: translateZ(0) scale(1.05);
      }
      
      /* Optimizar las sombras */
      .shadow-lg, .shadow-xl, .shadow-2xl {
        contain: layout style;
      }
      
      /* Optimizar los gradientes */
      .bg-gradient-to-r, .bg-gradient-to-b, .bg-gradient-to-t {
        contain: layout style paint;
      }
      
      ${shouldReduceDataUsage ? `
        /* Reducir efectos visuales en conexiones lentas */
        .animate-pulse {
          animation-duration: 1s;
        }
        
        .backdrop-blur-sm {
          backdrop-filter: none;
          background-color: rgba(0, 0, 0, 0.8);
        }
      ` : ''}
    `;

    document.head.appendChild(optimizationStyles);

    return () => {
      const existingStyles = document.getElementById('invisible-optimizations');
      if (existingStyles) {
        document.head.removeChild(existingStyles);
      }
    };
  }, [shouldReduceDataUsage]);

  // Este componente no renderiza nada visible
  return null;
}