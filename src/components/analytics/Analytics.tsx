'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Google Analytics ID (configurable via environment variable)
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

// Función para enviar eventos a Google Analytics
export const gtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag(...args);
  }
};

// Función para trackear page views
export const trackPageView = (url: string) => {
  if (GA_MEASUREMENT_ID) {
    gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
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
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Función para trackear conversiones
export const trackConversion = (conversionId: string, value?: number) => {
  gtag('event', 'conversion', {
    send_to: conversionId,
    value: value,
  });
};

// Hook para trackear performance
export const usePerformanceTracking = () => {
  useEffect(() => {
    // Trackear Core Web Vitals
    if (typeof window !== 'undefined') {
      // Usar dynamic import para web-vitals
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS((metric) => {
          gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: 'CLS',
            value: Math.round(metric.value * 1000),
            non_interaction: true,
          });
        });

        getFID((metric) => {
          gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: 'FID',
            value: Math.round(metric.value),
            non_interaction: true,
          });
        });

        getFCP((metric) => {
          gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: 'FCP',
            value: Math.round(metric.value),
            non_interaction: true,
          });
        });

        getLCP((metric) => {
          gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: 'LCP',
            value: Math.round(metric.value),
            non_interaction: true,
          });
        });

        getTTFB((metric) => {
          gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: 'TTFB',
            value: Math.round(metric.value),
            non_interaction: true,
          });
        });
      }).catch(() => {
        // Silently fail if web-vitals is not available
      });
    }
  }, []);
};

// Componente principal de Analytics
export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Trackear cambios de página
  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      trackPageView(url);
    }
  }, [pathname, searchParams]);

  // Usar el hook de performance tracking
  usePerformanceTracking();

  // Solo renderizar el script si tenemos GA_MEASUREMENT_ID
  if (!GA_MEASUREMENT_ID) {
    return null;
  }

  return (
    <>
      {/* Google Analytics Script */}
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              allow_google_signals: false,
              allow_ad_personalization_signals: false
            });
          `,
        }}
      />
    </>
  );
}

// Hook personalizado para trackear eventos de karting
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