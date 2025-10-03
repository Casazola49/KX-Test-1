// Configuración de rendimiento para la aplicación

// Configuración de lazy loading
export const LAZY_LOADING_CONFIG = {
  // Threshold para intersection observer (cuándo empezar a cargar)
  rootMargin: '50px',
  threshold: 0.1,
  
  // Configuración de imágenes
  imageLoading: 'lazy' as const,
  imagePriority: false,
  
  // Configuración de componentes
  componentDelay: 100, // ms de delay para componentes no críticos
};

// Configuración de cache
export const CACHE_CONFIG = {
  // Tiempo de revalidación para diferentes tipos de datos
  events: 300, // 5 minutos
  news: 600, // 10 minutos
  gallery: 1800, // 30 minutos
  products: 3600, // 1 hora
  podium: 300, // 5 minutos
  
  // Configuración de SWR/React Query
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 10 * 60 * 1000, // 10 minutos
};

// Configuración de animaciones
export const ANIMATION_CONFIG = {
  // Reducir animaciones en dispositivos de bajo rendimiento
  respectMotionPreference: true,
  
  // Duraciones optimizadas
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  
  // Configuración de framer-motion
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: 'easeOut' },
};

// Configuración de bundle splitting
export const BUNDLE_CONFIG = {
  // Componentes que deben cargarse de forma lazy
  lazyComponents: [
    'ParticleField',
    'SpeedIndicator',
    'FeaturedProductsCarousel',
    'HomeGalleryClient'
  ],
  
  // Librerías que deben cargarse de forma dinámica
  dynamicLibraries: [
    'framer-motion',
    'embla-carousel-autoplay',
    'three'
  ]
};

// Utilidad para detectar dispositivos de bajo rendimiento
export function isLowEndDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Detectar basado en memoria disponible
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) return true;
  
  // Detectar basado en número de cores
  const cores = navigator.hardwareConcurrency;
  if (cores && cores < 4) return true;
  
  // Detectar basado en connection
  const connection = (navigator as any).connection;
  if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
    return true;
  }
  
  return false;
}

// Utilidad para optimizar imágenes basado en el dispositivo
export function getOptimizedImageProps(src: string, alt: string, priority = false) {
  const isLowEnd = isLowEndDevice();
  
  return {
    src,
    alt,
    loading: priority ? 'eager' as const : 'lazy' as const,
    priority,
    quality: isLowEnd ? 70 : 85,
    sizes: isLowEnd 
      ? '(max-width: 768px) 100vw, 50vw'
      : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
  };
}

// Configuración de prefetch
export const PREFETCH_CONFIG = {
  // Rutas que deben prefetchearse
  criticalRoutes: ['/noticias', '/eventos', '/galeria'],
  
  // Recursos que deben precargarse
  criticalResources: [
    '/fonts/formula1-bold.woff2',
    '/fonts/formula1-wide.woff2'
  ]
};