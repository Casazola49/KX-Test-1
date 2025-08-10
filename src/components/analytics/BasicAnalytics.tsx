'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Sistema de analytics básico sin dependencias externas
export function BasicAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Solo trackear en producción
    if (process.env.NODE_ENV !== 'production') return;

    // Trackear page view simple
    const trackPageView = () => {
      try {
        // Enviar datos básicos al endpoint
        fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'pageview',
            url: window.location.href,
            pathname: pathname,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
          }),
        }).catch(() => {
          // Silently fail
        });
      } catch (error) {
        // Silently fail
      }
    };

    trackPageView();
  }, [pathname]);

  return null;
}

// Hook simple para trackear eventos
export const useSimpleAnalytics = () => {
  const trackEvent = (eventName: string, data?: Record<string, any>) => {
    if (process.env.NODE_ENV !== 'production') return;

    try {
      fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'event',
          event: eventName,
          data: data,
          url: window.location.href,
          timestamp: Date.now(),
        }),
      }).catch(() => {
        // Silently fail
      });
    } catch (error) {
      // Silently fail
    }
  };

  return { trackEvent };
};