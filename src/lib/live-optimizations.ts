// Optimizaciones específicas para la página de carrera en vivo
import { unstable_cache } from 'next/cache';

// Cache muy corto para configuración de live stream (datos que cambian frecuentemente)
export const getCachedLiveStreamConfig = unstable_cache(
  async () => {
    const { getLiveStreamConfig } = await import('@/lib/data-service');
    return getLiveStreamConfig();
  },
  ['live-stream-config'],
  {
    revalidate: 30, // 30 segundos - datos que cambian frecuentemente
    tags: ['live-stream']
  }
);

// Cache muy corto para mensajes de chat
export const getCachedChatMessages = unstable_cache(
  async () => {
    const { getChatMessages } = await import('@/lib/data-service');
    return getChatMessages();
  },
  ['live-chat-messages'],
  {
    revalidate: 10, // 10 segundos - mensajes en tiempo real
    tags: ['live-chat']
  }
);

// Función para optimizar la carga del iframe
export function getOptimizedIframeProps(iframeUrl: string) {
  return {
    src: iframeUrl,
    className: "w-full h-full border-0",
    allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen",
    allowFullScreen: true,
    title: "Transmisión en vivo",
    loading: "eager" as const, // Cargar inmediatamente para live streams
    // Optimizaciones adicionales
    referrerPolicy: "no-referrer-when-downgrade" as const,
    sandbox: "allow-same-origin allow-scripts allow-popups allow-forms"
  };
}

// Función para detectar si el usuario está en una conexión lenta
export function isSlowConnection(): boolean {
  if (typeof window === 'undefined') return false;
  
  const connection = (navigator as any).connection;
  if (!connection) return false;
  
  return connection.effectiveType === 'slow-2g' || 
         connection.effectiveType === '2g' ||
         connection.saveData === true;
}

// Función para optimizar el polling basado en la conexión
export function getOptimizedPollingInterval(baseInterval: number): number {
  if (typeof window === 'undefined') return baseInterval;
  
  const connection = (navigator as any).connection;
  if (!connection) return baseInterval;
  
  // Ajustar intervalo basado en la velocidad de conexión
  switch (connection.effectiveType) {
    case 'slow-2g':
      return baseInterval * 4; // 4x más lento
    case '2g':
      return baseInterval * 2; // 2x más lento
    case '3g':
      return baseInterval * 1.5; // 1.5x más lento
    case '4g':
    default:
      return baseInterval; // Velocidad normal
  }
}

// Función para optimizar el chat basado en visibilidad
export function shouldUpdateChat(): boolean {
  if (typeof window === 'undefined') return true;
  
  // No actualizar si la página no es visible
  if (document.hidden) return false;
  
  // No actualizar si el usuario está en una conexión muy lenta
  if (isSlowConnection()) return false;
  
  return true;
}

// Función para precargar recursos críticos del live stream
export function preloadLiveStreamResources() {
  if (typeof window === 'undefined') return;
  
  // Precargar iconos críticos
  const criticalIcons = [
    '/icons/radio.svg',
    '/icons/message-square.svg',
    '/icons/users.svg'
  ];
  
  criticalIcons.forEach(icon => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = icon;
    link.as = 'image';
    document.head.appendChild(link);
  });
  
  // Precargar fuentes para el chat
  const fontLink = document.createElement('link');
  fontLink.rel = 'preload';
  fontLink.href = '/fonts/inter-var.woff2';
  fontLink.as = 'font';
  fontLink.type = 'font/woff2';
  fontLink.crossOrigin = 'anonymous';
  document.head.appendChild(fontLink);
}

// Función para optimizar el rendimiento del iframe
export function optimizeIframePerformance(iframeElement: HTMLIFrameElement) {
  if (!iframeElement) return;
  
  // Aplicar optimizaciones de rendimiento
  iframeElement.style.willChange = 'auto';
  iframeElement.style.contain = 'layout style paint';
  
  // Optimizar para dispositivos de bajo rendimiento
  const isLowEndDevice = (navigator as any).deviceMemory < 4;
  if (isLowEndDevice) {
    // Reducir la calidad del iframe en dispositivos lentos
    const src = iframeElement.src;
    if (src.includes('youtube.com') || src.includes('youtu.be')) {
      // Para YouTube, agregar parámetros de calidad reducida
      const url = new URL(src);
      url.searchParams.set('vq', 'medium'); // Calidad media
      iframeElement.src = url.toString();
    }
  }
}

// Función para gestionar el estado de conexión
export function handleConnectionChange(callback: (isOnline: boolean) => void) {
  if (typeof window === 'undefined') return;
  
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Cleanup function
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// Función para optimizar las animaciones del live stream
export function getOptimizedLiveAnimations() {
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    return {
      pulse: { animation: 'none' },
      ping: { animation: 'none' },
      spin: { animation: 'none' }
    };
  }
  
  return {
    pulse: { animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' },
    ping: { animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite' },
    spin: { animation: 'spin 1s linear infinite' }
  };
}