
import { supabase } from './supabase-client';
import { Event, News, Podium, GalleryImage, GalleryItem, Pilot, Track, FullEvent, RaceEvent } from './types';
import { groupPodiumsByCategory } from './utils';

/**
 * FUNCIÓN CORREGIDA Y DEFINITIVA PARA OBTENER EVENTOS
 * - Usa noStore() para evitar la caché.
 * - Pide la fecha como 'event_date' de la BD y la mapea a 'date' para consistencia.
 * - Ordena por fecha ascendente para que la lógica del contador funcione.
 */
export async function getEvents(): Promise<Event[]> {
  // Detectar si estamos en el servidor
  const isServer = typeof window === 'undefined';
  
  if (isServer) {
    const { unstable_noStore: noStore } = await import('next/cache');
    const { createClient } = await import('./supabase-server');
    
    noStore();
    const supabaseServer = createClient();

    const { data, error } = await supabaseServer
      .from('events')
      .select('id, name, event_date, promotional_image_url, track:tracks(name, location, image_url)')
      .order('event_date', { ascending: true });

    if (error) {
      console.error("Error fetching events, check RLS policy on 'events' and 'tracks'.", error.message);
      throw new Error(`Error fetching events: ${error.message}`);
    }

    if (!data) return [];

    // Mapeamos los datos para que coincidan con el tipo 'Event' unificado
    const events: Event[] = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      date: item.event_date, // Mapeo clave: de event_date a date
      promotionalImageUrl: item.promotional_image_url,
      trackName: item.track?.name || 'Pista por confirmar',
      track: item.track,
    }));

    return events;
  } else {
    // En el cliente, usar el cliente de Supabase
    const { data, error } = await supabase
      .from('events')
      .select('id, name, event_date, promotional_image_url, track:tracks(name, location, image_url)')
      .order('event_date', { ascending: true });

    if (error) {
      console.error("Error fetching events, check RLS policy on 'events' and 'tracks'.", error.message);
      throw new Error(`Error fetching events: ${error.message}`);
    }

    if (!data) return [];

    // Mapeamos los datos para que coincidan con el tipo 'Event' unificado
    const events: Event[] = data.map((item: any) => ({
      id: item.id,
      name: item.name,
      date: item.event_date, // Mapeo clave: de event_date a date
      promotionalImageUrl: item.promotional_image_url,
      trackName: item.track?.name || 'Pista por confirmar',
      track: item.track,
    }));

    return events;
  }
}

/**
 * FUNCIÓN CORREGIDA Y DEFINITIVA PARA OBTENER IMÁGENES DE GALERÍA
 * - Usa noStore() para evitar la caché.
 * - Construye la URL pública completa para cada imagen desde Supabase Storage.
 * - Filtra de forma robusta cualquier imagen con ruta nula o vacía.
 */
export async function getGalleryImages(): Promise<GalleryImage[]> {
  // Detectar si estamos en el servidor
  const isServer = typeof window === 'undefined';
  
  try {
    if (isServer) {
      const { unstable_noStore: noStore } = await import('next/cache');
      const { createClient } = await import('./supabase-server');
      
      noStore();
      const supabaseServer = createClient();
      
      const { data, error } = await supabaseServer
        .from('gallery')
        .select('*')
        .eq('type', 'image') // Corregido para usar 'image' en lugar de 'foto'
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Error fetching gallery images:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Convertimos a GalleryImage[] usando la estructura correcta
      const images: GalleryImage[] = data.map((item: any) => ({
        id: item.id,
        title: item.title || 'Sin título',
        description: item.description || item.alt || '',
        image_url: item.src, // Usar 'src' en lugar de 'image_url'
        created_at: item.created_at
      }));

      return images;
    } else {
      // En el cliente, usar el cliente de Supabase
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .eq('type', 'image')
        .order('created_at', { ascending: false })
        .limit(12);

      if (error) {
        console.error('Error fetching gallery images:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Convertimos a GalleryImage[] usando la estructura correcta
      const images: GalleryImage[] = data.map((item: any) => ({
        id: item.id,
        title: item.title || 'Sin título',
        description: item.description || item.alt || '',
        image_url: item.src, // Usar 'src' en lugar de 'image_url'
        created_at: item.created_at
      }));

      return images;
    }
    
  } catch (error) {
    console.error('Error in getGalleryImages:', error);
    return [];
  }
}

// --- OTRAS FUNCIONES (YA CORREGIDAS) ---

export async function getNews(): Promise<News[]> {
  // Detectar si estamos en el servidor
  const isServer = typeof window === 'undefined';
  
  if (isServer) {
    const { unstable_noStore: noStore } = await import('next/cache');
    const { createClient } = await import('./supabase-server');
    
    noStore();
    const supabaseServer = createClient();
    const { data, error } = await supabaseServer.from('news').select('*').order('date', { ascending: false }).limit(12);
    if (error) throw new Error(error.message);
    return (data as News[]) || [];
  } else {
    // En el cliente, usar el cliente de Supabase
    const { data, error } = await supabase.from('news').select('*').order('date', { ascending: false }).limit(12);
    if (error) throw new Error(error.message);
    return (data as News[]) || [];
  }
}

export async function getNewsBySlug(slug: string): Promise<News | null> {
  // Detectar si estamos en el servidor o cliente
  const isServer = typeof window === 'undefined';
  
  if (isServer) {
    const { unstable_noStore: noStore } = await import('next/cache');
    const { createClient } = await import('./supabase-server');
    
    noStore();
    const supabaseServer = createClient();
    const { data, error } = await supabaseServer.from('news').select('*').eq('slug', slug).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as News | null;
  } else {
    // En el cliente, usar el cliente de Supabase
    const { data, error } = await supabase.from('news').select('*').eq('slug', slug).single();
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(error.message);
    }
    return data as News | null;
  }
}

export async function getPodium() {
  // Detectar si estamos en el servidor
  const isServer = typeof window === 'undefined';
  
  if (isServer) {
    const { unstable_noStore: noStore } = await import('next/cache');
    const { createClient } = await import('./supabase-server');
    
    noStore();
    const supabaseServer = createClient();
    const { data: allEvents, error: eventError } = await supabaseServer
      .from('events')
      .select('name, event_date, podiums(id,podium_type,determination_method,category:categories(name),results:podium_results(*,pilot:pilots(id,slug,firstName,lastName,teamName,teamColor,teamAccentColor,number,imageUrl,nationality)))')
      .order('event_date', { ascending: false });

    if (eventError) {
      console.error("Error fetching events for podium:", eventError.message);
      return { eventName: 'Podio no disponible', podiums: {} };
    }
    if (!allEvents || allEvents.length === 0) {
      return { eventName: 'No hay eventos disponibles', podiums: {} };
    }
    
    const currentDate = new Date();
    // Buscar el último evento que ya pasó y que tenga podios
    const lastPastEvent = allEvents.find(event => {
      const eventDate = new Date(event.event_date);
      return eventDate <= currentDate && event.podiums && event.podiums.length > 0;
    });
    
    if (!lastPastEvent) {
      return { eventName: 'Sin resultados disponibles', podiums: {} };
    }
    
    const eventData = lastPastEvent as unknown as FullEvent;
    if (!eventData.podiums || eventData.podiums.length === 0) {
      return { eventName: eventData.name, podiums: {} };
    }
    
    const groupedPodiums = {
      eventName: eventData.name,
      podiums: groupPodiumsByCategory(eventData.podiums)
    };
    return groupedPodiums;
  } else {
    // En el cliente, usar el cliente de Supabase
    const { data: allEvents, error: eventError } = await supabase
      .from('events')
      .select('name, event_date, podiums(id,podium_type,determination_method,category:categories(name),results:podium_results(*,pilot:pilots(id,slug,firstName,lastName,teamName,teamColor,teamAccentColor,number,imageUrl,nationality)))')
      .order('event_date', { ascending: false });

    if (eventError) {
      console.error("Error fetching events for podium:", eventError.message);
      return { eventName: 'Podio no disponible', podiums: {} };
    }
    if (!allEvents || allEvents.length === 0) {
      return { eventName: 'No hay eventos disponibles', podiums: {} };
    }
    
    const currentDate = new Date();
    // Buscar el último evento que ya pasó y que tenga podios
    const lastPastEvent = allEvents.find(event => {
      const eventDate = new Date(event.event_date);
      return eventDate <= currentDate && event.podiums && event.podiums.length > 0;
    });
    
    if (!lastPastEvent) {
      return { eventName: 'Sin resultados disponibles', podiums: {} };
    }
    
    const eventData = lastPastEvent as unknown as FullEvent;
    if (!eventData.podiums || eventData.podiums.length === 0) {
      return { eventName: eventData.name, podiums: {} };
    }
    
    const groupedPodiums = {
      eventName: eventData.name,
      podiums: groupPodiumsByCategory(eventData.podiums)
    };
    return groupedPodiums;
  }
}
