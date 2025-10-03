'use client';

import { useEffect } from 'react';

export default function PilotsOptimizations() {
  useEffect(() => {
    // Aplicar optimizaciones CSS específicas para la página de pilotos
    const pilotsOptimizationStyles = document.createElement('style');
    pilotsOptimizationStyles.id = 'pilots-optimizations';
    pilotsOptimizationStyles.textContent = `
      /* Optimizaciones específicas para la página de pilotos */
      
      /* Optimizar las tarjetas de pilotos */
      .pilot-card {
        contain: layout style paint;
        will-change: transform;
      }
      
      /* Optimizar las imágenes de pilotos */
      .pilot-image {
        content-visibility: auto;
        contain-intrinsic-size: 200px 300px;
      }
      
      /* Optimizar las animaciones de hover */
      .group:hover .group-hover\\:scale-105 {
        transform: translateZ(0) scale(1.05);
      }
      
      /* Optimizar los gradientes de fondo */
      .pilot-background {
        contain: layout style paint;
      }
      
      /* Optimizar las transiciones */
      .transition-transform {
        will-change: transform;
      }
      
      /* Optimizar el filtrado y búsqueda */
      .pilots-search-container {
        contain: layout style;
      }
      
      /* Optimizar las tabs */
      .tabs-content {
        contain: layout style;
      }
      
      /* Optimizar la clasificación */
      .classification-container {
        contain: layout style paint;
      }
      
      /* Optimizar los botones de categoría */
      .category-buttons {
        contain: layout style;
      }
      
      /* Reducir el repaint en las banderas */
      .flag-image {
        contain: layout style paint;
      }
      
      /* Optimizar el texto con stroke */
      .text-stroke-contrast {
        text-rendering: optimizeSpeed;
      }
      
      /* Optimizar los números grandes */
      .pilot-number {
        font-display: swap;
        contain: layout style;
      }
      
      /* Optimizar las sombras */
      .shadow-lg, .shadow-primary\\/30 {
        contain: layout style;
      }
      
      /* Optimizar el scroll en dispositivos móviles */
      @media (max-width: 768px) {
        .pilots-grid {
          contain: layout style paint;
        }
        
        .pilot-card {
          transform: translateZ(0);
        }
      }
      
      /* Optimizaciones para conexiones lentas */
      @media (prefers-reduced-data: reduce) {
        .pilot-background {
          background-image: none !important;
        }
        
        .backdrop-blur-sm {
          backdrop-filter: none;
          background-color: rgba(0, 0, 0, 0.8);
        }
      }
      
      /* Optimizaciones para movimiento reducido */
      @media (prefers-reduced-motion: reduce) {
        .pilot-card {
          transition: none;
        }
        
        .group:hover .group-hover\\:scale-105 {
          transform: none;
        }
        
        .transition-transform {
          transition: none;
        }
      }
    `;

    document.head.appendChild(pilotsOptimizationStyles);

    return () => {
      const existingStyles = document.getElementById('pilots-optimizations');
      if (existingStyles) {
        document.head.removeChild(existingStyles);
      }
    };
  }, []);

  // Este componente no renderiza nada visible
  return null;
}