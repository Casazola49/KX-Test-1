'use client';

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Configuración de analytics simple
const ANALYTICS_CONFIG = {
  enabled: process.env.NODE_ENV === 'production',
  endpoint: '/api/analytics', // Endpoint propio para recopilar datos
  batchSize: 10,
  flushInterval: 30000, // 30 segundos
};

// Tipos para eventos
interface AnalyticsEvent {
  type: 'pageview' | 'event' | 'performance' | 'error';
  timestamp: number;
  url: string;
  referrer: string;
  userAgent: string;
  screenResolution: string;
  data?: Record<string, any>;
}

// Queue para eventos
let eventQueue: AnalyticsEvent[] = [];
let flushTimer: NodeJS.Timeout | null = null;

// Función para obtener información del dispositivo
const getDeviceInfo = () => {
  if (typeof window === 'undefined') return {};
  
  return {
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
  };
};

// Función para enviar eventos al servidor
const sendEvents = async (events: AnalyticsEvent[]) => {
  if (!ANALYTICS_CONFIG.enabled || events.length === 0) return;
  
  try {
    await fetch(ANALYTICS_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        events,
        deviceInfo: getDeviceInfo(),
      }),
    });
  } catch (error) {
    console.warn('Analytics: Failed to send events', error);
  }
};

// Función para agregar evento a la queue
const queueEvent = (event: Omit<AnalyticsEvent, 'timestamp' | 'url' | 'referrer' | 'userAgent' | 'screenResolution'>) => {
  if (typeof window === 'undefined') return;
  
  const fullEvent: AnalyticsEvent = {
    ...event,
    timestamp: Date.now(),
    url: window.location.href,
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
  };
  
  eventQueue.push(fullEvent);
  
  // Flush si alcanzamos el batch size
  if (eventQueue.length >= ANALYTICS_CONFIG.batchSize) {
    flushEvents();
  }
  
  // Configurar timer para flush automático
  if (!flushTimer) {
    flushTimer = setTimeout(flushEvents, ANALYTICS_CONFIG.flushInterval);
  }
};

// Función para enviar todos los eventos pendientes
const flushEvents = async () => {
  if (eventQueue.length === 0) return;
  
  const eventsToSend = [...eventQueue];
  eventQueue = [];
  
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  
  await sendEvents(eventsToSend);
};

// Función para trackear page views
export const trackPageView = (url: string) => {
  queueEvent({
    type: 'pageview',
    data: { page: url },
  });
};

// Función para trackear eventos personalizados
export const trackEvent = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  queueEvent({
    type: 'event',
    data: {
      action,
      category,
      label,
      value,
    },
  });
};

// Función para trackear performance
export const trackPerformance = (metric: {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}) => {
  queueEvent({
    type: 'performance',
    data: metric,
  });
};

// Función para trackear errores
export const trackError = (error: {
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
}) => {
  queueEvent({
    type: 'error',
    data: error,
  });
};

// Hook para monitorear Core Web Vitals sin dependencias externas
export const useWebVitals = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Monitorear LCP (Largest Contentful Paint)
    const observeLCP = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          if (lastEntry) {
            const value = lastEntry.startTime;
            const rating = value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
            
            trackPerformance({
              name: 'LCP',
              value: Math.round(value),
              rating,
            });
          }
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      }
    };
    
    // Monitorear FID (First Input Delay)
    const observeFID = () => {
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          entries.forEach((entry: any) => {
            const value = entry.processingStart - entry.startTime;
            const rating = value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
            
            trackPerformance({
              name: 'FID',
              value: Math.round(value),
              rating,
            });
          });
        });
        
        observer.observe({ entryTypes: ['first-input'] });
      }
    };
    
    // Monitorear CLS (Cumulative Layout Shift)
    const observeCLS = () => {
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          
          const rating = clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor';
          
          trackPerformance({
            name: 'CLS',
            value: Math.round(clsValue * 1000) / 1000,
            rating,
          });
        });
        
        observer.observe({ entryTypes: ['layout-shift'] });
      }
    };
    
    // Inicializar observadores
    observeLCP();
    observeFID();
    observeCLS();
    
    // Monitorear errores de JavaScript
    const handleError = (event: ErrorEvent) => {
      trackError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
      });
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    // Flush eventos al cerrar la página
    const handleBeforeUnload = () => {
      flushEvents();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};

// Componente principal de Analytics Simple
export function SimpleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Trackear cambios de página
  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      trackPageView(url);
    }
  }, [pathname, searchParams]);
  
  // Usar el hook de Web Vitals
  useWebVitals();
  
  return null; // Este componente no renderiza nada
}

// Hook personalizado para eventos de karting
export const useKartingAnalytics = () => {
  const trackRaceView = (raceName: string, category: string) => {
    trackEvent({
      action: 'view_race',
      category: 'Races',
      label: `${raceName} - ${category}`,
    });
  };
  
  const trackPilotView = (pilotName: string, team: string) => {
    trackEvent({
      action: 'view_pilot',
      category: 'Pilots',
      label: `${pilotName} - ${team}`,
    });
  };
  
  const trackGalleryView = (imageId: string, category: string) => {
    trackEvent({
      action: 'view_gallery_item',
      category: 'Gallery',
      label: `${category} - ${imageId}`,
    });
  };
  
  const trackNewsView = (newsTitle: string) => {
    trackEvent({
      action: 'view_news',
      category: 'News',
      label: newsTitle,
    });
  };
  
  const trackCountdownInteraction = (raceName: string) => {
    trackEvent({
      action: 'countdown_interaction',
      category: 'Engagement',
      label: raceName,
    });
  };
  
  return {
    trackRaceView,
    trackPilotView,
    trackGalleryView,
    trackNewsView,
    trackCountdownInteraction,
  };
};