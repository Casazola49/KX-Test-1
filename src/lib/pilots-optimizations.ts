// Optimizaciones específicas para la página de pilotos
import { unstable_cache } from 'next/cache';

// Cache inteligente para pilotos (datos que no cambian frecuentemente)
export const getCachedPilots = unstable_cache(
  async () => {
    const { getAllPilots } = await import('@/lib/data-service');
    return getAllPilots();
  },
  ['pilots-page-pilots'],
  {
    revalidate: 900, // 15 minutos - los pilotos no cambian frecuentemente
    tags: ['pilots']
  }
);

// Cache para eventos con podiums
export const getCachedEventsWithPodiums = unstable_cache(
  async () => {
    const { getAllEvents } = await import('@/lib/data-service');
    const events = await getAllEvents();
    // Filtrar solo eventos que tienen podiums para mejor rendimiento
    return events.filter(event => event.podiums && event.podiums.length > 0);
  },
  ['pilots-page-events'],
  {
    revalidate: 600, // 10 minutos
    tags: ['events', 'podiums']
  }
);

// Función para optimizar la carga de imágenes de pilotos
export function getOptimizedPilotImageProps(imageUrl: string, pilotName: string) {
  return {
    src: imageUrl,
    alt: `Foto de ${pilotName}`,
    loading: 'lazy' as const,
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    // Removemos placeholder y blurDataURL que pueden causar problemas
    priority: false
  };
}

// Función para agrupar pilotos de forma optimizada
export function optimizeGroupedPilots(pilots: any[], searchTerm: string, selectedCategory: string) {
  // Usar un Map para mejor rendimiento en agrupación
  const grouped = new Map<string, any[]>();
  
  for (const pilot of pilots) {
    // Filtrado por término de búsqueda (optimizado)
    if (searchTerm) {
      const fullName = `${pilot.firstName} ${pilot.lastName}`.toLowerCase();
      if (!fullName.includes(searchTerm.toLowerCase())) {
        continue;
      }
    }
    
    // Filtrado por categoría
    if (selectedCategory !== 'Todas' && pilot.category !== selectedCategory) {
      continue;
    }
    
    // Agrupación optimizada
    const categoryKey = pilot.category || 'Sin Categoría';
    if (!grouped.has(categoryKey)) {
      grouped.set(categoryKey, []);
    }
    grouped.get(categoryKey)!.push(pilot);
  }
  
  // Convertir Map a objeto ordenado
  const sortedCategories = Array.from(grouped.keys()).sort((a, b) => {
    if (a === 'Sin Categoría') return 1;
    if (b === 'Sin Categoría') return -1;
    return a.localeCompare(b);
  });
  
  const result: Record<string, any[]> = {};
  for (const category of sortedCategories) {
    // ORDENAR PILOTOS ALFABÉTICAMENTE DENTRO DE CADA CATEGORÍA
    const pilotsInCategory = grouped.get(category)!;
    pilotsInCategory.sort((a, b) => {
      const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim();
      const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim();
      return nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
    });
    
    result[category] = pilotsInCategory;
  }
  
  return result;
}

// Función para precargar imágenes de pilotos críticos
export function preloadCriticalPilotImages(pilots: any[]) {
  if (typeof window === 'undefined') return;
  
  // Precargar las primeras 6 imágenes de pilotos
  const criticalPilots = pilots.slice(0, 6);
  
  criticalPilots.forEach(pilot => {
    if (pilot.imageUrl) {
      const img = new Image();
      img.src = pilot.imageUrl;
    }
  });
}

// Función para optimizar las animaciones de las tarjetas de pilotos
export function getOptimizedCardAnimations() {
  const prefersReducedMotion = typeof window !== 'undefined' && 
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
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
}

// Función para detectar si se deben reducir los efectos visuales
export function shouldReduceVisualEffects(): boolean {
  if (typeof window === 'undefined') return false;
  
  const connection = (navigator as any).connection;
  const isLowEndDevice = (navigator as any).deviceMemory < 4;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  return prefersReducedMotion || 
         isLowEndDevice || 
         (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g'));
}