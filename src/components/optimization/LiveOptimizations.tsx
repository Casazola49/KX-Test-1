'use client';

import { useEffect } from 'react';
import { useConnectionOptimization } from '@/hooks/useLiveOptimization';

export default function LiveOptimizations() {
  const { isSlowConnection } = useConnectionOptimization();

  useEffect(() => {
    // Aplicar optimizaciones CSS específicas para la página de live stream
    const liveOptimizationStyles = document.createElement('style');
    liveOptimizationStyles.id = 'live-optimizations';
    liveOptimizationStyles.textContent = `
      /* Optimizaciones específicas para la página de live stream */
      
      /* Optimizar el iframe del stream */
      .live-stream-iframe {
        contain: layout style paint;
        will-change: auto;
        transform: translateZ(0);
      }
      
      /* Optimizar el contenedor del chat */
      .live-chat-container {
        contain: layout style paint;
        overflow-anchor: auto;
      }
      
      /* Optimizar los mensajes del chat */
      .chat-message {
        contain: layout style;
        will-change: auto;
      }
      
      /* Optimizar las animaciones de estado en vivo */
      .live-indicator {
        contain: layout style;
      }
      
      /* Optimizar el scroll del chat */
      .chat-scroll-container {
        scroll-behavior: smooth;
        overscroll-behavior: contain;
      }
      
      /* Optimizar las tarjetas de estado */
      .live-status-card {
        contain: layout style paint;
      }
      
      /* Optimizar los botones de control */
      .live-control-button {
        contain: layout style;
        will-change: transform;
      }
      
      /* Optimizar las transiciones */
      .live-transition {
        transition-property: transform, opacity;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      /* Optimizar el layout del grid */
      .live-grid-container {
        contain: layout style;
      }
      
      /* Optimizaciones para dispositivos móviles */
      @media (max-width: 768px) {
        .live-stream-iframe {
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        
        .live-chat-container {
          height: 400px; /* Altura fija en móviles */
        }
        
        .chat-message {
          font-size: 14px; /* Texto más pequeño en móviles */
        }
      }
      
      /* Optimizaciones para conexiones lentas */
      ${isSlowConnection ? `
        .live-stream-iframe {
          filter: contrast(0.9) brightness(0.95);
        }
        
        .chat-message {
          animation: none !important;
        }
        
        .live-indicator {
          animation-duration: 2s !important;
        }
        
        .backdrop-blur-sm {
          backdrop-filter: none;
          background-color: rgba(0, 0, 0, 0.8);
        }
      ` : ''}
      
      /* Optimizaciones para movimiento reducido */
      @media (prefers-reduced-motion: reduce) {
        .live-indicator {
          animation: none;
        }
        
        .animate-pulse, .animate-ping, .animate-spin {
          animation: none;
        }
        
        .live-transition {
          transition: none;
        }
        
        .chat-scroll-container {
          scroll-behavior: auto;
        }
      }
      
      /* Optimizaciones para datos reducidos */
      @media (prefers-reduced-data: reduce) {
        .live-stream-iframe {
          filter: grayscale(0.2);
        }
        
        .backdrop-blur-sm {
          backdrop-filter: none;
          background-color: rgba(0, 0, 0, 0.9);
        }
      }
      
      /* Optimizar el rendering de texto */
      .chat-message-text {
        text-rendering: optimizeSpeed;
        font-smooth: auto;
        -webkit-font-smoothing: auto;
      }
      
      /* Optimizar las sombras */
      .live-shadow {
        contain: layout style;
      }
      
      /* Optimizar los gradientes */
      .live-gradient {
        contain: layout style paint;
      }
      
      /* Optimizar los overlays */
      .live-overlay {
        contain: layout style paint;
        will-change: opacity;
      }
      
      /* Optimizar la carga del iframe */
      .iframe-loading {
        background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
        background-size: 200% 100%;
        animation: loading-shimmer 1.5s infinite;
      }
      
      @keyframes loading-shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      
      /* Optimizar el estado de error */
      .live-error-state {
        contain: layout style paint;
      }
      
      /* Optimizar los iconos */
      .live-icon {
        contain: layout style;
        will-change: auto;
      }
    `;

    document.head.appendChild(liveOptimizationStyles);

    return () => {
      const existingStyles = document.getElementById('live-optimizations');
      if (existingStyles) {
        document.head.removeChild(existingStyles);
      }
    };
  }, [isSlowConnection]);

  // Este componente no renderiza nada visible
  return null;
}