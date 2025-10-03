'use client';

import { useMemo, useEffect, useState, useCallback } from 'react';
import { optimizeGroupedPilots, preloadCriticalPilotImages, shouldReduceVisualEffects } from '@/lib/pilots-optimizations';

// Hook para optimizar el filtrado y agrupación de pilotos
export function useOptimizedPilotFiltering(pilots: any[], searchTerm: string, selectedCategory: string) {
  // Usar useMemo para evitar recálculos innecesarios
  const filteredAndGroupedPilots = useMemo(() => {
    return optimizeGroupedPilots(pilots, searchTerm, selectedCategory);
  }, [pilots, searchTerm, selectedCategory]);

  return filteredAndGroupedPilots;
}

// Hook para optimizar la carga de imágenes de pilotos
export function usePilotImageOptimization(pilots: any[]) {
  const [imagesPreloaded, setImagesPreloaded] = useState(false);

  useEffect(() => {
    if (pilots.length > 0 && !imagesPreloaded) {
      // Precargar imágenes críticas después de un pequeño delay
      const timer = setTimeout(() => {
        preloadCriticalPilotImages(pilots);
        setImagesPreloaded(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [pilots, imagesPreloaded]);

  return { imagesPreloaded };
}

// Hook para optimizar las animaciones de las tarjetas
export function usePilotCardAnimations() {
  const [shouldReduce, setShouldReduce] = useState(false);

  useEffect(() => {
    setShouldReduce(shouldReduceVisualEffects());
  }, []);

  const getAnimationProps = useCallback(() => {
    if (shouldReduce) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.1 }
      };
    }

    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { type: 'spring', stiffness: 100, damping: 20 }
    };
  }, [shouldReduce]);

  return { getAnimationProps, shouldReduce };
}

// Hook para optimizar la búsqueda con debounce
export function useOptimizedSearch(initialValue = '', delay = 300) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay]);

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm
  };
}

// Hook para optimizar la paginación virtual (si hay muchos pilotos)
export function useVirtualizedPilots(pilots: any[], itemsPerPage = 20) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedPilots = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return pilots.slice(startIndex, endIndex);
  }, [pilots, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(pilots.length / itemsPerPage);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return {
    paginatedPilots,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setCurrentPage
  };
}

// Hook para optimizar el lazy loading de componentes pesados
export function useLazyComponentLoading() {
  const [shouldLoadHeavyComponents, setShouldLoadHeavyComponents] = useState(false);

  useEffect(() => {
    // Cargar componentes pesados después de que la página inicial esté lista
    const timer = setTimeout(() => {
      setShouldLoadHeavyComponents(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return { shouldLoadHeavyComponents };
}