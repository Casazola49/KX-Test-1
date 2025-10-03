// Optimizaciones específicas para Firebase que mejoran el rendimiento
import { enableNetwork, disableNetwork } from 'firebase/firestore';
import { db } from './firebase';

// Cache en memoria para consultas frecuentes
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Función para obtener datos con cache inteligente
export function getCachedQuery<T>(
  key: string, 
  queryFn: () => Promise<T>, 
  ttl: number = 5 * 60 * 1000 // 5 minutos por defecto
): Promise<T> {
  const cached = queryCache.get(key);
  const now = Date.now();

  // Si hay datos en cache y no han expirado, devolverlos
  if (cached && (now - cached.timestamp) < cached.ttl) {
    return Promise.resolve(cached.data);
  }

  // Si no hay cache o ha expirado, hacer la consulta
  return queryFn().then(data => {
    queryCache.set(key, { data, timestamp: now, ttl });
    return data;
  });
}

// Optimizar la conexión de Firebase basado en la visibilidad de la página
export function optimizeFirebaseConnection() {
  if (typeof window === 'undefined') return;

  let isOnline = true;

  // Deshabilitar Firebase cuando la página no es visible
  document.addEventListener('visibilitychange', async () => {
    if (document.hidden && isOnline) {
      try {
        await disableNetwork(db);
        isOnline = false;
        console.log('Firebase network disabled (page hidden)');
      } catch (error) {
        console.warn('Failed to disable Firebase network:', error);
      }
    } else if (!document.hidden && !isOnline) {
      try {
        await enableNetwork(db);
        isOnline = true;
        console.log('Firebase network enabled (page visible)');
      } catch (error) {
        console.warn('Failed to enable Firebase network:', error);
      }
    }
  });

  // Optimizar basado en la conexión
  const connection = (navigator as any).connection;
  if (connection) {
    connection.addEventListener('change', () => {
      // Si la conexión es muy lenta, limpiar el cache más frecuentemente
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        queryCache.clear();
      }
    });
  }
}

// Limpiar cache periódicamente
export function startCacheCleanup() {
  setInterval(() => {
    const now = Date.now();
    for (const [key, cached] of queryCache.entries()) {
      if ((now - cached.timestamp) > cached.ttl) {
        queryCache.delete(key);
      }
    }
  }, 10 * 60 * 1000); // Limpiar cada 10 minutos
}

// Precargar datos críticos
export async function preloadCriticalData() {
  try {
    // Precargar eventos (datos más críticos)
    getCachedQuery('critical-events', async () => {
      const { getEvents } = await import('./data');
      return getEvents();
    }, 10 * 60 * 1000); // Cache por 10 minutos

    // Precargar noticias
    getCachedQuery('critical-news', async () => {
      const { getNews } = await import('./data');
      return getNews();
    }, 15 * 60 * 1000); // Cache por 15 minutos

  } catch (error) {
    console.warn('Failed to preload critical data:', error);
  }
}

// Inicializar todas las optimizaciones
export function initializeFirebaseOptimizations() {
  if (typeof window !== 'undefined') {
    optimizeFirebaseConnection();
    startCacheCleanup();
    
    // Precargar datos después de un delay
    setTimeout(preloadCriticalData, 2000);
  }
}