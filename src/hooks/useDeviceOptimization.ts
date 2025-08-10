'use client';

import { useState, useEffect } from 'react';

interface DeviceOptimization {
  isMobile: boolean;
  isTablet: boolean;
  isLowPerformance: boolean;
  prefersReducedMotion: boolean;
  shouldReduceAnimations: boolean;
  shouldReduceParticles: boolean;
}

export function useDeviceOptimization(): DeviceOptimization {
  const [optimization, setOptimization] = useState<DeviceOptimization>({
    isMobile: false,
    isTablet: false,
    isLowPerformance: false,
    prefersReducedMotion: false,
    shouldReduceAnimations: false,
    shouldReduceParticles: false,
  });

  useEffect(() => {
    const updateOptimization = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      
      // Detectar dispositivos de bajo rendimiento
      const isLowPerformance = 
        navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4 ||
        navigator.deviceMemory && navigator.deviceMemory < 4 ||
        /Android.*Chrome\/[.0-9]*\s/.test(navigator.userAgent) && width < 768;
      
      // Detectar preferencias de movimiento reducido
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      // Detectar conexión lenta
      const connection = (navigator as any).connection;
      const isSlowConnection = connection && (
        connection.effectiveType === 'slow-2g' ||
        connection.effectiveType === '2g' ||
        connection.effectiveType === '3g'
      );
      
      const shouldReduceAnimations = prefersReducedMotion || isLowPerformance || isSlowConnection;
      const shouldReduceParticles = isMobile || isLowPerformance || prefersReducedMotion || isSlowConnection;

      setOptimization({
        isMobile,
        isTablet,
        isLowPerformance,
        prefersReducedMotion,
        shouldReduceAnimations,
        shouldReduceParticles,
      });
    };

    updateOptimization();
    
    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', updateOptimization);
    
    // Escuchar cambios en preferencias de movimiento
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', updateOptimization);

    return () => {
      window.removeEventListener('resize', updateOptimization);
      mediaQuery.removeEventListener('change', updateOptimization);
    };
  }, []);

  return optimization;
}