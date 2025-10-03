
// Migrado a Firebase - Ya no usa Supabase
import { Event, News, Podium, GalleryImage, GalleryItem, Pilot, Track, FullEvent, RaceEvent } from './types';

/**
 * FUNCIÓN MIGRADA A FIREBASE - Obtener eventos de carrera (usando raceevents)
 */
export async function getEvents(): Promise<Event[]> {
  try {
    // Usar la tabla 'events' en lugar de 'raceevents' (donde están los podiums)
    const { getAllEvents } = await import('./data-service');
    const { serializeFirebaseData } = await import('./serialize');
    const eventsData = await getAllEvents();
    
    // Mapear datos de Firebase al formato Event esperado
    const events: Event[] = eventsData.map((item: any) => ({
      id: item.id,
      name: item.name,
      date: item.event_date, // La tabla 'events' usa 'event_date'
      event_end_date: item.event_end_date, // Incluir fecha de finalización
      promotionalImageUrl: item.promotional_image_url,
      trackName: item.track?.name || 'Pista por confirmar',
      track: {
        name: item.track?.name || 'Pista por confirmar',
        location: item.track?.location || 'Ubicación por confirmar',
        image_url: item.track?.image_url || ''
      },
    }));

    return serializeFirebaseData(events);
  } catch (error) {
    console.error('Error fetching events from Firebase:', error);
    return [];
  }
}

/**
 * FUNCIÓN MIGRADA A FIREBASE - Obtener imágenes de galería
 */
export async function getGalleryImages(): Promise<GalleryImage[]> {
  try {
    const { getGalleryByType } = await import('./data-service');
    const galleryItems = await getGalleryByType('image');
    
    // Mapear datos de Firebase al formato GalleryImage esperado
    const images: GalleryImage[] = galleryItems.map((item: any) => ({
      id: item.id,
      title: item.title || 'Sin título',
      description: item.alt || '',
      image_url: item.src,
      created_at: item.createdAt
    }));

    return images.slice(0, 12); // Limitar a 12 imágenes
  } catch (error) {
    console.error('Error fetching gallery images from Firebase:', error);
    return [];
  }
}

// --- OTRAS FUNCIONES (YA CORREGIDAS) ---

/**
 * FUNCIÓN MIGRADA A FIREBASE - Obtener noticias
 */
export async function getNews(): Promise<News[]> {
  try {
    const { getAllNews } = await import('./data-service');
    const newsItems = await getAllNews();
    return newsItems.slice(0, 12); // Limitar a 12 noticias
  } catch (error) {
    console.error('Error fetching news from Firebase:', error);
    return [];
  }
}

/**
 * FUNCIÓN MIGRADA A FIREBASE - Obtener noticia por slug
 */
export async function getNewsBySlug(slug: string): Promise<News | null> {
  try {
    const { getAllNews } = await import('./data-service');
    const newsItems = await getAllNews();
    const newsItem = newsItems.find(item => item.slug === slug);
    return newsItem || null;
  } catch (error) {
    console.error('Error fetching news by slug from Firebase:', error);
    return null;
  }
}

/**
 * FUNCIÓN MIGRADA A FIREBASE - Obtener podio real del último evento (tabla events)
 */
export async function getPodium() {
  try {
    const { getLatestEventWithPodiums } = await import('./data-service-simple');
    const { serializePodiumData } = await import('./serialize');
    
    // Obtener automáticamente el último evento con podiums
    const eventWithPodiums = await getLatestEventWithPodiums();
    
    if (eventWithPodiums && eventWithPodiums.podiums && eventWithPodiums.podiums.length > 0) {
      // Agrupar podiums por categoría
      const groupedPodiums: any = {};
      
      for (const podium of eventWithPodiums.podiums) {
        const categoryName = podium.category?.name || 'Sin Categoría';
        
        if (!groupedPodiums[categoryName]) {
          groupedPodiums[categoryName] = [];
        }
        
        // Serializar cada podium antes de agregarlo
        groupedPodiums[categoryName].push(serializePodiumData(podium));
      }
      
      return serializePodiumData({
        eventName: eventWithPodiums.name,
        podiums: groupedPodiums
      });
    }

    // Si no se encuentra el evento con podiums, retornar estructura vacía
    return { 
      eventName: 'Sin resultados disponibles', 
      podiums: {} 
    };

  } catch (error) {
    console.error('Error fetching podium from Firebase:', error);
    // Retornar estructura segura en caso de error
    return { 
      eventName: 'Podio no disponible', 
      podiums: {} 
    };
  }
}
/**
 * FUNCIÓN MIGRADA A FIREBASE - Obtener mecánicos
 */
export async function getMechanics(): Promise<any[]> {
  try {
    const { getAllMechanics } = await import('./data-service');
    const mechanics = await getAllMechanics();
    return mechanics || [];
  } catch (error) {
    console.error('Error fetching mechanics from Firebase:', error);
    return [];
  }
}

/**
 * FUNCIÓN MIGRADA A FIREBASE - Obtener configuración de live stream
 */
export async function getLiveStreamSettings(): Promise<any> {
  try {
    const { getLiveStreamConfig } = await import('./data-service');
    const settings = await getLiveStreamConfig();
    return settings || { is_live: false, stream_title: "Próxima Carrera", iframe_url: null };
  } catch (error) {
    console.error('Error fetching live stream settings from Firebase:', error);
    return { is_live: false, stream_title: "Próxima Carrera", iframe_url: null };
  }
}

/**
 * FUNCIÓN MIGRADA A FIREBASE - Obtener karts 3D
 */
export async function getKarts(): Promise<any[]> {
  try {
    const { getAllKarts } = await import('./data-service');
    const karts = await getAllKarts();
    return karts || [];
  } catch (error) {
    console.error('Error fetching karts from Firebase:', error);
    return [];
  }
}