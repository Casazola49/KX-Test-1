'use client';

import { useEffect, useState, useCallback } from 'react';
import { isLowEndDevice, ANIMATION_CONFIG } from '@/lib/performance-config';

// Hook para optimización de rendimiento
export function usePerformanceOptimization() {
  const [isLowEnd, setIsLowEnd] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Detectar dispositivo de bajo rendimiento
    setIsLowEnd(isLowEndDevice());

    // Detectar preferencia de movimiento reducido
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Configuración de animaciones optimizada
  const getAnimationConfig = useCallback(() => {
    if (prefersReducedMotion || isLowEnd) {
      return {
        ...ANIMATION_CONFIG,
        transition: { duration: 0.1, ease: 'linear' },
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      };
    }
    return ANIMATION_CONFIG;
  }, [prefersReducedMotion, isLowEnd]);

  // Determinar si mostrar efectos visuales complejos
  const shouldShowComplexEffects = useCallback(() => {
    return !isLowEnd && !prefersReducedMotion;
  }, [isLowEnd, prefersReducedMotion]);

  // Configuración de partículas optimizada
  const getParticleCount = useCallback(() => {
    if (prefersReducedMotion) return 0;
    if (isLowEnd) return 5;
    return window.innerWidth < 768 ? 8 : 15;
  }, [prefersReducedMotion, isLowEnd]);

  return {
    isLowEnd,
    prefersReducedMotion,
    getAnimationConfig,
    shouldShowComplexEffects,
    getParticleCount
  };
}

// Hook para lazy loading con intersection observer
export function useLazyLoading(threshold = 0.1, rootMargin = '50px') {
  const [isVisible, setIsVisible] = useState(false);
  const [ref, setRef] = useState<Element | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(ref);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref);

    return () => {
      if (ref) observer.unobserve(ref);
    };
  }, [ref, threshold, rootMargin]);

  return [setRef, isVisible] as const;
}

// Hook para optimizar imágenes
export function useOptimizedImages() {
  const [isLowEnd, setIsLowEnd] = useState(false);

  useEffect(() => {
    setIsLowEnd(isLowEndDevice());
  }, []);

  const getImageProps = useCallback((src: string, alt: string, priority = false) => {
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
  }, [isLowEnd]);

  return { getImageProps, isLowEnd };
}

// Hook para debounce (útil para búsquedas y scroll)
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook para throttle (útil para eventos de scroll)
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [isThrottled, setIsThrottled] = useState(false);

  const throttledCallback = useCallback((...args: Parameters<T>) => {
    if (!isThrottled) {
      callback(...args);
      setIsThrottled(true);
      setTimeout(() => setIsThrottled(false), delay);
    }
  }, [callback, delay, isThrottled]) as T;

  return throttledCallback;
}