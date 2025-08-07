
import type { Pilot, NewsArticle, TrackInfo, RaceEvent, GalleryItem, QualifyingTrackResult, PilotCategoryRanking, AuspicioItem } from './types';

// Pilot Data with unique IDs
export const pilotData: Omit<Pilot, 'name'>[] = [
  {
    id: 'd9b9c9f0-5a3a-4f6e-8e3b-1a2b3c4d5e6f',
    slug: 'lucas-careaga',
    firstName: 'Lucas',
    lastName: 'Careaga',
    number: 77,
    category: 'Profesional',
    teamName: 'Team Careaga',
    teamColor: '#000000',
    teamAccentColor: '#FFD700',
    imageUrl: 'https://placehold.co/400x400.png',
    nationality: 'bo',
    city: 'Cochabamba',
    dob: '1998-05-22',
    achievements: ['Campeón Nacional 2023', 'Múltiple campeón departamental'],
    performanceHistory: [
      { race: 'CBA', lapTime: 52.123 },
      { race: 'SCZ', lapTime: 54.581 },
      { race: 'LPZ', lapTime: 58.911 },
    ],
  },
  {
    id: 'e8a8b8e0-4b2b-3e5d-7d2a-0a1b2c3d4e5f',
    slug: 'rodrigo-gutierrez-jr',
    firstName: 'Rodrigo',
    lastName: 'Gutiérrez Jr.',
    number: 10,
    category: 'Profesional',
    teamName: 'Team RG',
    teamColor: '#1E40AF',
    teamAccentColor: '#FBBF24',
    imageUrl: 'https://placehold.co/400x400.png',
    nationality: 'bo',
    city: 'Santa Cruz',
    dob: '2001-03-15',
    achievements: ['Subcampeón Nacional 2023'],
     performanceHistory: [
      { race: 'CBA', lapTime: 52.345 },
      { race: 'SCZ', lapTime: 54.321 },
      { race: 'LPZ', lapTime: 59.123 },
    ],
  },
];

// News Data with unique IDs
export const newsData: Omit<NewsArticle, 'date'>[] = [
  {
    id: 'f0c6e5d4-3b2a-1c0b-9a8d-7e6f5d4c3b2a',
    title: 'Gran victoria de Careaga en la final de Cochabamba',
    slug: 'victoria-careaga-cochabamba',
    summary: 'Lucas Careaga se alzó con la victoria en una emocionante carrera final en el kartódromo de Arocagua, consolidando su liderazgo en el campeonato.',
    imageUrl: 'https://placehold.co/800x450.png',
    category: 'Nacional',
    isMain: true,
    content: '<p>En una jornada llena de adrenalina y adelantamientos espectaculares, el piloto cochabambino Lucas Careaga demostró por qué es el actual campeón nacional. Partiendo desde la pole position, supo defender su lugar y gestionar la carrera de manera magistral, cruzando la línea de meta en primer lugar ante el aplauso de los aficionados locales.</p><p>El podio lo completaron Rodrigo Gutiérrez Jr. de Santa Cruz y la sorpresa del día, el joven piloto paceño Mateo Angles, quien realizó una remontada impresionante desde el octavo lugar.</p>',
  },
];

// Track Data with unique IDs
export const trackData: Omit<TrackInfo, 'id' | 'created_at' | 'gallery_image_urls' | 'country' | 'countryFlagUrl'>[] = [
  {
    name: 'Kartódromo de Arocagua',
    location: 'Cochabamba, Bolivia',
    image_url: 'https://placehold.co/800x600.png',
    description: 'El circuito más emblemático de Cochabamba, conocido por su trazado técnico y desafiante.',
    length: '1,200 metros',
    curves: 14,
    record: '0:52.123',
    model_3d_url: '/pistas/track.glb'
  },
];

// Race Events Data with unique IDs and simplified structure
export const raceEventsData: Omit<RaceEvent, 'id' | 'date' | 'isUpcoming' | 'isPast' | 'trackLayoutUrl'>[] = [
  {
    name: 'Gran Premio de La Paz',
    round: 1,
    trackName: 'Kartódromo de Pura Pura',
    city: 'La Paz',
    country: 'bo',
    promoImageUrl: 'https://placehold.co/1200x400.png',
  },
];

// Gallery Data with unique IDs
export const galleryData: Omit<GalleryItem, 'id' | 'created_at'>[] = [
  {
    type: 'image',
    src: 'https://placehold.co/600x400.png',
    alt: 'Pilotos en la parrilla de salida',
    category: 'Carreras',
    title: 'Parrilla de Salida'
  },
];

// Seeding for related tables
export const qualifyingData: any[] = [];
export const rankingsData: any[] = [];
export const auspiciosData: any[] = [];
