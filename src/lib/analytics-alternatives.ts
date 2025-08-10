// Alternativas a Google Analytics para países con restricciones

export const ANALYTICS_ALTERNATIVES = {
  // 1. Plausible Analytics (Europeo, privacy-first)
  plausible: {
    name: 'Plausible Analytics',
    description: 'Analytics europeo, respetuoso con la privacidad',
    website: 'https://plausible.io',
    pricing: 'Desde $9/mes',
    features: [
      'Sin cookies',
      'GDPR compliant',
      'Lightweight (< 1KB)',
      'Open source',
      'Dashboard simple'
    ],
    setup: `
      // En el <head> de tu layout:
      <script defer data-domain="tudominio.com" src="https://plausible.io/js/script.js"></script>
    `
  },

  // 2. Umami Analytics (Open Source)
  umami: {
    name: 'Umami Analytics',
    description: 'Analytics open source, auto-hospedable',
    website: 'https://umami.is',
    pricing: 'Gratis (self-hosted) o desde $20/mes',
    features: [
      'Open source',
      'Self-hosted',
      'Sin cookies',
      'Privacy-focused',
      'Real-time data'
    ],
    setup: `
      // Instalar en tu servidor o usar Umami Cloud
      // Script tag similar a Plausible
    `
  },

  // 3. Simple Analytics (Holandés)
  simpleAnalytics: {
    name: 'Simple Analytics',
    description: 'Analytics simple y privado',
    website: 'https://simpleanalytics.com',
    pricing: 'Desde $19/mes',
    features: [
      'Sin cookies',
      'GDPR compliant',
      'API completa',
      'Dashboard limpio',
      'Alertas automáticas'
    ]
  },

  // 4. Fathom Analytics (Canadiense)
  fathom: {
    name: 'Fathom Analytics',
    description: 'Analytics simple y privado',
    website: 'https://usefathom.com',
    pricing: 'Desde $14/mes',
    features: [
      'Sin cookies',
      'GDPR compliant',
      'Uptime monitoring',
      'Email reports',
      'API completa'
    ]
  },

  // 5. Sistema Propio (Recomendado para tu caso)
  selfHosted: {
    name: 'Sistema Propio',
    description: 'Analytics completamente bajo tu control',
    pricing: 'Gratis (solo hosting)',
    features: [
      'Control total',
      'Sin restricciones',
      'Personalizable',
      'Datos en tu servidor',
      'Sin dependencias externas'
    ]
  }
};

// Configuración recomendada para Bolivia
export const BOLIVIA_RECOMMENDED = {
  primary: 'selfHosted', // Sistema propio como principal
  backup: 'umami', // Umami como alternativa
  reason: 'Máximo control y sin dependencias de servicios externos'
};

// Función para detectar si Google Analytics está bloqueado
export const isGoogleAnalyticsBlocked = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://www.google-analytics.com/analytics.js', {
      method: 'HEAD',
      mode: 'no-cors'
    });
    return false;
  } catch {
    return true;
  }
};

// Función para inicializar el mejor analytics disponible
export const initializeBestAnalytics = async () => {
  const isGABlocked = await isGoogleAnalyticsBlocked();
  
  if (isGABlocked) {
    console.log('🚫 Google Analytics no disponible, usando sistema propio');
    return 'self-hosted';
  } else {
    console.log('✅ Google Analytics disponible');
    return 'google-analytics';
  }
};