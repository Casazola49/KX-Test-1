// Optimizaciones de rendimiento invisibles para el usuario
import { unstable_cache } from 'next/cache';

// Cache inteligente para datos que no cambian frecuentemente
export const getCachedEvents = unstable_cache(
  async () => {
    const { getEvents } = await import('@/lib/data');
    return getEvents();
  },
  ['homepage-events'],
  {
    revalidate: 300, // 5 minutos
    tags: ['events']
  }
);

export const getCachedNews = unstable_cache(
  async () => {
    const { getNews } = await import('@/lib/data');
    return getNews();
  },
  ['homepage-news'],
  {
    revalidate: 600, // 10 minutos
    tags: ['news']
  }
);

export const getCachedProducts = unstable_cache(
  async () => {
    const { getAllProducts } = await import('@/lib/data-service');
    return getAllProducts();
  },
  ['homepage-products'],
  {
    revalidate: 1800, // 30 minutos
    tags: ['products']
  }
);

// Función para precargar recursos críticos
export function preloadCriticalResources() {
  if (typeof window !== 'undefined') {
    // Precargar fuentes críticas
    const fontLinks = [
      '/fonts/formula1-bold.woff2',
      '/fonts/formula1-wide.woff2'
    ];

    fontLinks.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Precargar rutas críticas
    const criticalRoutes = ['/noticias', '/eventos'];
    criticalRoutes.forEach(route => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = route;
      document.head.appendChild(link);
    });
  }
}

// Optimización de imágenes basada en conexión
export function getOptimizedImageQuality(): number {
  if (typeof window === 'undefined') return 85;
  
  const connection = (navigator as any).connection;
  if (!connection) return 85;

  // Ajustar calidad basado en la velocidad de conexión
  switch (connection.effectiveType) {
    case 'slow-2g':
    case '2g':
      return 60;
    case '3g':
      return 75;
    case '4g':
    default:
      return 85;
  }
}

// Detectar si el usuario prefiere datos reducidos
export function shouldReduceData(): boolean {
  if (typeof window === 'undefined') return false;
  
  const connection = (navigator as any).connection;
  return connection?.saveData === true || 
         connection?.effectiveType === 'slow-2g' || 
         connection?.effectiveType === '2g';
}

// Optimización de animaciones basada en rendimiento
export function getOptimizedAnimationSettings() {
  if (typeof window === 'undefined') {
    return { duration: 0.3, ease: 'easeOut' };
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isLowEndDevice = (navigator as any).deviceMemory < 4 || navigator.hardwareConcurrency < 4;

  if (prefersReducedMotion || isLowEndDevice) {
    return { duration: 0.1, ease: 'linear' };
  }

  return { duration: 0.3, ease: 'easeOut' };
}