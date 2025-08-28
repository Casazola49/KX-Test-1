// Definiciones de tipos y colecciones para Firebase
// Basado en la estructura actual de Supabase

export const COLLECTIONS = {
  // Tablas básicas
  PILOTS: 'pilots',
  NEWS: 'news', 
  TRACKS: 'tracks',
  RACE_EVENTS: 'raceevents',
  GALLERY: 'gallery',
  
  // Tablas importantes que faltaban
  EVENTS: 'events',
  CATEGORIES: 'categories',
  PODIUMS: 'podiums',
  PODIUM_RESULTS: 'podium_results',
  
  // Tablas de productos y servicios
  PRODUCTS: 'products',
  MECHANICS: 'mechanics',
  
  // Tablas adicionales
  QUALIFYING_RESULTS: 'qualifyingresults',
  RANKINGS: 'rankings',
  AUSPICIOS: 'auspicios',
  TEAMS: 'teams',
  USERS: 'users',
  STANDINGS: 'standings',
  
  // Live streaming
  LIVE_STREAMS: 'live_streams',
  
  // 3D Models
  KARTS: 'karts'
} as const;

// Tipos basados en tu estructura actual
export interface Pilot {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  name: string; // firstName + lastName
  number: number;
  category: string;
  teamName: string;
  teamColor: string;
  teamAccentColor: string;
  imageUrl: string;
  nationality: string;
  city: string;
  dob: string;
  achievements: string[];
  performanceHistory: Array<{
    race: string;
    lapTime: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  imageUrl: string;
  category: string;
  isMain: boolean;
  content: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrackInfo {
  id: string;
  name: string;
  location: string;
  image_url: string;
  description: string;
  length: string;
  curves: number;
  record: string;
  model_3d_url?: string;
  country: string;
  countryFlagUrl?: string;
  gallery_image_urls?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RaceEvent {
  id: string;
  name: string;
  round: number;
  trackName: string;
  city: string;
  country: string;
  promoImageUrl: string;
  date: Date;
  isUpcoming: boolean;
  isPast: boolean;
  trackLayoutUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  src: string;
  alt: string;
  category: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QualifyingTrackResult {
  id: string;
  // Añadir campos según necesites
  createdAt: Date;
  updatedAt: Date;
}

export interface PilotCategoryRanking {
  id: string;
  // Añadir campos según necesites
  createdAt: Date;
  updatedAt: Date;
}

export interface AuspicioItem {
  id: string;
  // Añadir campos según necesites
  createdAt: Date;
  updatedAt: Date;
}

// Nuevas interfaces para las tablas que faltaban
export interface Event {
  id: string;
  name: string;
  event_date: Date;
  track_id: string;
  description?: string;
  promotional_image_url?: string;
  gallery_image_urls?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Podium {
  id: string;
  event_id: string;
  category_id: string;
  podium_type: string;
  determination_method: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PodiumResult {
  id: string;
  podium_id: string;
  pilot_id: string;
  position: number;
  result_value?: string;
  guest_name?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaces para productos y servicios
export interface Product {
  id: string;
  name: string;
  slug: string;
  brand?: string;
  summary?: string;
  description?: string;
  price?: number;
  category?: string;
  image_url?: string;
  gallery_image_urls?: string[];
  is_featured?: boolean;
  contact_url?: string;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Mechanic {
  id: string;
  name: string;
  department?: string;
  website_url?: string;
  image_url?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para live streams
export interface LiveStream {
  id: string;
  event_id: string;
  is_live: boolean;
  stream_url?: string;
  viewer_count?: number;
  started_at?: Date;
  ended_at?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Kart interface for 3D models
export interface KartModel {
  id: string;
  name: string;
  category: string;
  description?: string;
  model_url: string;
  created_at?: string;
  updated_at?: string;
}