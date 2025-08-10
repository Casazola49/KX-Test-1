
// This file contains the type definitions for the data used in the application.
// It's crucial that these types match the structure of the data in your Supabase tables.

export interface Pilot {
    id: string;
    slug: string;
    firstName: string;
    lastName: string;
    number: number;
    teamName: string;
    teamColor: string;
    teamAccentColor: string;
    imageUrl?: string;
    nationality: string;
    category?: string;
    category_id?: string;
    dob?: string;
    city?: string;
    bio?: string;
    achievements?: string[];
    yearsOfExperience?: number;
    teamOrigin?: string;
    performanceHistory?: string;
    model_3d_url?: string;
}

export interface Track {
    id: string;
    name: string;
    location: string;
    description?: string;
    image_url?: string;
    length?: number;
    curves?: number;
    record?: string;
    max_speed?: string;
    infrastructure?: string;
    width?: number;
    model_3d_url?: string;
}

// Shape used by admin TrackForm and edit page
export interface TrackInfo {
  id: string;
  name: string;
  location: string;
  description?: string;
  length?: string;
  width?: string;
  curves?: number;
  altitude?: string;
  record?: string;
  max_speed?: string;
  infrastructure?: string[];
  imageUrl?: string;
  galleryImageUrls?: string[];
}

/**
 * TIPO DE EVENTO UNIFICADO
 * Este será el único tipo 'Event' en toda la aplicación para mantener la consistencia.
 * - 'date' será el campo estándar para la fecha del evento.
 */
export interface Event {
  id: string;
  name: string;
  date: string; // Campo unificado para la fecha.
  trackName?: string;
  track?: Track;
  promotionalImageUrl?: string; // Opcional
}

// Mantenemos RaceEvent por compatibilidad con RaceCard, pero lo hacemos idéntico a Event.
export type RaceEvent = Event;

export interface Podium {
  [key: string]: {
    position: number;
    pilot: Pilot;
  }[];
}

export interface GalleryImage {
  id: string;
  image_url: string;
  title: string;
  description?: string;
  created_at: string;
}

export type DeterminationMethod = 'PUNTOS' | 'TIEMPO';

// Definimos el nuevo tipo PodiumType
export type PodiumType = 
  | 'CLASIFICACION'
  | 'MANGA_1'
  | 'MANGA_2'
  | 'MANGA_3_PRE_FINAL'
  | 'FINAL'
  | 'PODIO_EVENTO'
  | 'PODIO_OFICIAL_DEFINITIVO';

export interface PodiumResult {
    id: string;
    podium_id: string;
    pilot_id: string;
    position: number;
    result_value: string; // Can be time or points
    pilot: Pilot;
    guest_name?: string;
}

export interface FullPodium {
    id: string;
    event_id: string;
    category_id: string;
    podium_type: PodiumType; // Usamos el nuevo tipo
    determination_method: DeterminationMethod;
    category: { name: string };
    results: PodiumResult[];
}

export interface FullEvent {
    id: string;
    name: string;
    event_date: string; // El campo de la BD
    track_id: string;
    description?: string;
    promotional_image_url?: string;
    gallery_image_urls?: string[];
    track: Track;
    podiums: FullPodium[];
}

export interface News {
    id: string;
    slug: string;
    title: string;
    summary: string;
    content: string;
    image_url: string;
    created_at: string;
    is_main?: boolean;
}

export interface GalleryItem {
    id: string;
    title: string;
    description: string;
    image_url: string;
    type: 'foto' | 'video';
    event_id?: string;
    tags?: string[];
    created_at: string;
}

export interface Category {
    id: string;
    name: string;
    description: string;
}

export interface GroupedPodiums {
    [categoryName: string]: FullPodium[];
}

export interface Standing {
  id: string;
  pilotId: string;
  points: number;
  category: string;
  eventId?: string | null;
  pilotName?: string;
  pilotImageUrl?: string | null;
  trackId?: string;
  type?: 'points' | 'time_trial';
  created_at?: string;
}

// Kart entity used in Admin > Karts and client components
export interface Kart {
    id: string;
    name: string;
    category: string;
    description?: string;
    model_url: string;
    created_at?: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    category: string;
    brand: string;
    stock: number;
    is_featured: boolean;
}

export interface Auspicio {
    id: string;
    slug: string;
    name: string;
    description: string;
    logo_url: string;
    website_url?: string;
    level: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONCE' | 'COLABORADOR';
}

// Tipo usado por la sección de auspicios (detalles de producto/servicio)
export interface AuspicioItem {
  id: string;
  slug: string;
  title: string;
  content: string; // HTML renderizado en detalle
  galleryImageUrls: string[]; // URLs públicas de imágenes
  aiHint?: string;
  website_url?: string;
  level?: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONCE' | 'COLABORADOR';
}

export interface LiveMessage {
    id: string;
    created_at: string;
    author: string;
    message: string;
}

export interface LiveStream {
    id: string;
    event_id: string;
    is_live: boolean;
    stream_url?: string;
}

export interface Mechanic {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  service_area?: string;
  avatar_url?: string;
  image_url?: string;
  website_url?: string;
  department?: string;
  created_at?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary?: string;
  content: string;
  image_url?: string;
  created_at?: string;
  slug?: string;
  is_main?: boolean;
}
