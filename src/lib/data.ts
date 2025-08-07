
import { createClient } from './supabase-server';
import { Event, News, Podium, GalleryImage, Pilot, Track, FullEvent, RaceEvent } from './types';
import { groupPodiumsByCategory } from './utils';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * FUNCIÓN CORREGIDA Y DEFINITIVA PARA OBTENER EVENTOS
 * - Usa noStore() para evitar la caché.
 * - Pide la fecha como 'event_date' de la BD y la mapea a 'date' para consistencia.
 * - Ordena por fecha ascendente para que la lógica del contador funcione.
 */
export async function getEvents(): Promise<Event[]> {
  noStore();
  const supabase = createClient();

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

/**
 * FUNCIÓN CORREGIDA Y DEFINITIVA PARA OBTENER IMÁGENES DE GALERÍA
 * - Usa noStore() para evitar la caché.
 * - Construye la URL pública completa para cada imagen desde Supabase Storage.
 * - Filtra de forma robusta cualquier imagen con ruta nula o vacía.
 */
export async function getGalleryImages(): Promise<GalleryImage[]> {
  noStore();
  const supabase = createClient();
  const { data, error } = await supabase
    .from('gallery')
    .select('id, title, image_url, created_at')
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching gallery images:', error.message);
    return [];
  }
  if (!data) return [];

  const imagesWithPublicUrls = data
    .map(image => {
      if (!image || typeof image.image_url !== 'string' || image.image_url.trim() === '') {
        return null;
      }
      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(image.image_url);
      
      return { ...image, image_url: publicUrl };
    })
    .filter(Boolean);
  
  return (imagesWithPublicUrls as GalleryImage[]) || [];
}

// --- OTRAS FUNCIONES (YA CORREGIDAS) ---

export async function getNews(): Promise<News[]> {
  noStore();
  const supabase = createClient();
  const { data, error } = await supabase.from('news').select('*').order('date', { ascending: false }).limit(10);
  if (error) throw new Error(error.message);
  return (data as News[]) || [];
}

export async function getNewsBySlug(slug: string): Promise<News | null> {
  noStore();
  const supabase = createClient();
  const { data, error } = await supabase.from('news').select('*').eq('slug', slug).single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  return data as News | null;
}

export async function getPodium() {
  noStore();
  const supabase = createClient();
  const { data: allEvents, error: eventError } = await supabase
    .from('events')
    .select('name, event_date, podiums(id,podium_type,determination_method,category:categories(name),results:podium_results(*,pilot:pilots(id,slug,firstName,lastName,teamName,teamColor,teamAccentColor,number,imageUrl,nationality)))')
    .order('event_date', { ascending: false });

  if (eventError) {
    console.error("Error fetching events for podium:", eventError.message);
    return { eventName: 'Podio no disponible', podiums: {} };
  }
  if (!allEvents || allEvents.length === 0) {
    return { eventName: '', podiums: {} };
  }
  const currentDate = new Date();
  const lastPastEvent = allEvents.find(event => new Date(event.event_date) <= currentDate);
  if (!lastPastEvent) {
    return { eventName: 'Eventos Anteriores', podiums: {} };
  }
  const eventData = lastPastEvent as unknown as FullEvent;
  if (!eventData.podiums) {
    return { eventName: eventData.name, podiums: {} };
  }
  const groupedPodiums = {
    eventName: eventData.name,
    podiums: groupPodiumsByCategory(eventData.podiums)
  };
  return groupedPodiums;
}
