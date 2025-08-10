'use client';

import { useEffect, useCallback } from 'react';
import { trackEvent } from '@/components/analytics/Analytics';

// Tipos para métricas de performance
interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

// Thresholds para Core Web Vitals
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
};

// Función para determinar rating
const getRating = (value: number, thresholds: { good: number; poor: number }): 'good' | 'needs-improvement' | 'poor' => {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
};

// Hook principal de monitoreo de performance
export const usePerformanceMonitoring = () => {
  // Función para reportar métricas
  const reportMetric = useCallback((metric: PerformanceMetric) => {
    // Enviar a analytics
    trackEvent({
      action: 'performance_metric',
      category: 'Core Web Vitals',
      label: `${metric.name}: ${metric.rating}`,
      value: Math.round(metric.value),
    });

    // Log en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${metric.name}: ${metric.value}ms (${metric.rating})`);
    }
  }, []);

  // Monitorear Navigation Timing API
  const monitorNavigationTiming = useCallback(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (!navigation) return;

    // Time to First Byte (TTFB)
    const ttfb = navigation.responseStart - navigation.requestStart;
    reportMetric({
      name: 'TTFB',
      value: ttfb,
      rating: getRating(ttfb, THRESHOLDS.TTFB),
    });

    // DOM Content Loaded
    const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
    reportMetric({
      name: 'DOM_CONTENT_LOADED',
      value: domContentLoaded,
      rating: domContentLoaded < 1000 ? 'good' : domContentLoaded < 2000 ? 'needs-improvement' : 'poor',
    });

    // Load Complete
    const loadComplete = navigation.loadEventEnd - navigation.loadEventStart;
    reportMetric({
      name: 'LOAD_COMPLETE',
      value: loadComplete,
      rating: loadComplete < 2000 ? 'good' : loadComplete < 4000 ? 'needs-improvement' : 'poor',
    });
  }, [reportMetric]);

  // Monitorear Resource Timing
  const monitorResourceTiming = useCallback(() => {
    if (typeof window === 'undefined' || !window.performance) return;

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    // Agrupar por tipo de recurso
    const resourceTypes = {
      images: resources.filter(r => r.initiatorType === 'img'),
      scripts: resources.filter(r => r.initiatorType === 'script'),
      stylesheets: resources.filter(r => r.initiatorType === 'link'),
      fonts: resources.filter(r => r.name.includes('font')),
    };

    // Reportar métricas por tipo
    Object.entries(resourceTypes).forEach(([type, items]) => {
      if (items.length === 0) return;

      const avgDuration = items.reduce((sum, item) => sum + item.duration, 0) / items.length;
      const slowResources = items.filter(item => item.duration > 1000).length;

      trackEvent({
        action: 'resource_performance',
        category: 'Resource Timing',
        label: `${type}_avg_duration`,
        value: Math.round(avgDuration),
      });

      if (slowResources > 0) {
        trackEvent({
          action: 'slow_resources',
          category: 'Resource Timing',
          label: type,
          value: slowResources,
        });
      }
    });
  }, []);

  // Monitorear errores de JavaScript
  const monitorJSErrors = useCallback(() => {
    const handleError = (event: ErrorEvent) => {
      trackEvent({
        action: 'javascript_error',
        category: 'Errors',
        label: `${event.filename}:${event.lineno}`,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackEvent({
        action: 'unhandled_promise_rejection',
        category: 'Errors',
        label: event.reason?.toString() || 'Unknown',
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Monitorear memoria (si está disponible)
  const monitorMemoryUsage = useCallback(() => {
    if (typeof window === 'undefined' || !(performance as any).memory) return;

    const memory = (performance as any).memory;
    const memoryUsage = {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
    };

    const usagePercentage = (memoryUsage.used / memoryUsage.limit) * 100;

    trackEvent({
      action: 'memory_usage',
      category: 'Performance',
      label: 'heap_usage_percentage',
      value: Math.round(usagePercentage),
    });

    // Advertir si el uso de memoria es alto
    if (usagePercentage > 80) {
      trackEvent({
        action: 'high_memory_usage',
        category: 'Performance',
        label: 'memory_warning',
        value: Math.round(usagePercentage),
      });
    }
  }, []);

  // Inicializar monitoreo
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Esperar a que la página esté completamente cargada
    const initializeMonitoring = () => {
      monitorNavigationTiming();
      monitorResourceTiming();
      monitorMemoryUsage();
    };

    if (document.readyState === 'complete') {
      initializeMonitoring();
    } else {
      window.addEventListener('load', initializeMonitoring);
    }

    // Configurar monitoreo de errores
    const cleanupErrorMonitoring = monitorJSErrors();

    // Monitoreo periódico de memoria (cada 30 segundos)
    const memoryInterval = setInterval(monitorMemoryUsage, 30000);

    return () => {
      window.removeEventListener('load', initializeMonitoring);
      cleanupErrorMonitoring?.();
      clearInterval(memoryInterval);
    };
  }, [monitorNavigationTiming, monitorResourceTiming, monitorMemoryUsage, monitorJSErrors]);

  return {
    reportMetric,
  };
};

// Hook específico para monitorear componentes
export const useComponentPerformance = (componentName: string) => {
  const { reportMetric } = usePerformanceMonitoring();

  const measureRender = useCallback((startTime: number) => {
    const renderTime = performance.now() - startTime;
    
    reportMetric({
      name: `COMPONENT_RENDER_${componentName.toUpperCase()}`,
      value: renderTime,
      rating: renderTime < 16 ? 'good' : renderTime < 50 ? 'needs-improvement' : 'poor',
    });
  }, [componentName, reportMetric]);

  return { measureRender };
};