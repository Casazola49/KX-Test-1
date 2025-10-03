'use client';

import { useEffect } from 'react';
import { preloadCriticalResources } from '@/lib/performance-optimizations';
import { initializeFirebaseOptimizations } from '@/lib/firebase-optimizations';

export default function ResourcePreloader() {
  useEffect(() => {
    // Inicializar optimizaciones de Firebase inmediatamente
    initializeFirebaseOptimizations();

    // Precargar recursos críticos después de que la página inicial cargue
    const timer = setTimeout(() => {
      preloadCriticalResources();
    }, 1000); // Esperar 1 segundo para no interferir con la carga inicial

    return () => clearTimeout(timer);
  }, []);

  // Este componente no renderiza nada visible
  return null;
}