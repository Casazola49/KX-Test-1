'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export default function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Solo mostrar en desarrollo
    if (process.env.NODE_ENV !== 'development') return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const newMetrics: Partial<PerformanceMetrics> = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      };

      // Medir Web Vitals
      if ('web-vitals' in window) {
        // @ts-ignore
        import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP }) => {
          getCLS((metric: any) => {
            setMetrics(prev => ({ ...prev, cumulativeLayoutShift: metric.value }));
          });
          
          getFID((metric: any) => {
            setMetrics(prev => ({ ...prev, firstInputDelay: metric.value }));
          });
          
          getFCP((metric: any) => {
            setMetrics(prev => ({ ...prev, firstContentfulPaint: metric.value }));
          });
          
          getLCP((metric: any) => {
            setMetrics(prev => ({ ...prev, largestContentfulPaint: metric.value }));
          });
        });
      }

      setMetrics(newMetrics);
    };

    // Medir después de que la página esté completamente cargada
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    // Mostrar/ocultar con Ctrl+Shift+P
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('load', measurePerformance);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  if (process.env.NODE_ENV !== 'development' || !isVisible) return null;

  const formatTime = (time: number) => {
    if (time < 1000) return `${time.toFixed(0)}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const getScoreColor = (metric: string, value: number) => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      firstContentfulPaint: { good: 1800, poor: 3000 },
      largestContentfulPaint: { good: 2500, poor: 4000 },
      cumulativeLayoutShift: { good: 0.1, poor: 0.25 },
      firstInputDelay: { good: 100, poor: 300 },
    };

    const threshold = thresholds[metric];
    if (!threshold) return 'text-gray-400';

    if (value <= threshold.good) return 'text-green-400';
    if (value <= threshold.poor) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-primary">Performance Metrics</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1">
        {metrics.loadTime && (
          <div className="flex justify-between">
            <span>Load Time:</span>
            <span className="text-blue-400">{formatTime(metrics.loadTime)}</span>
          </div>
        )}
        
        {metrics.domContentLoaded && (
          <div className="flex justify-between">
            <span>DOM Ready:</span>
            <span className="text-blue-400">{formatTime(metrics.domContentLoaded)}</span>
          </div>
        )}
        
        {metrics.firstContentfulPaint && (
          <div className="flex justify-between">
            <span>FCP:</span>
            <span className={getScoreColor('firstContentfulPaint', metrics.firstContentfulPaint)}>
              {formatTime(metrics.firstContentfulPaint)}
            </span>
          </div>
        )}
        
        {metrics.largestContentfulPaint && (
          <div className="flex justify-between">
            <span>LCP:</span>
            <span className={getScoreColor('largestContentfulPaint', metrics.largestContentfulPaint)}>
              {formatTime(metrics.largestContentfulPaint)}
            </span>
          </div>
        )}
        
        {metrics.cumulativeLayoutShift !== undefined && (
          <div className="flex justify-between">
            <span>CLS:</span>
            <span className={getScoreColor('cumulativeLayoutShift', metrics.cumulativeLayoutShift)}>
              {metrics.cumulativeLayoutShift.toFixed(3)}
            </span>
          </div>
        )}
        
        {metrics.firstInputDelay && (
          <div className="flex justify-between">
            <span>FID:</span>
            <span className={getScoreColor('firstInputDelay', metrics.firstInputDelay)}>
              {formatTime(metrics.firstInputDelay)}
            </span>
          </div>
        )}
      </div>
      
      <div className="mt-2 pt-2 border-t border-gray-600 text-xs text-gray-400">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
}