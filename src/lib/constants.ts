
import type { NavItem, RaceEvent } from './types';

export const SITE_TITLE = "KartXperience Bolivia";
export const LOGO_TEXT = "KartXperience"; // Or an SVG component path

export const NAVIGATION_LINKS: NavItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Noticias', href: '/noticias' },
  { label: 'Pilotos y Equipos', href: '/pilotos-equipos' },
  { label: 'Pistas', href: '/pistas' },
  { label: 'Calendario', href: '/calendario' },
  { label: 'Galería', href: '/galeria' },
  { label: 'Equipamiento y Servicios', href: '/equipamiento-servicios' }, // Nueva Sección
  { label: 'Cómo ser Piloto', href: '/como-ser-piloto' },
  { 
    label: 'Información', 
    href: '#', 
    subItems: [
      { label: 'Historia del Karting', href: '/informacion/historia' },
      { label: 'Panorama Actual', href: '/informacion/panorama-actual' },
      { label: 'Futuro del Karting', href: '/informacion/futuro' },
    ]
  },
  {
    label: 'Más',
    href: '#',
    subItems: [
      { label: 'Reglamento', href: '/reglamento' },
      { label: 'Kart', href: '/kart' },
      { label: 'Carrera en Vivo', href: '/live' },
      { label: 'Contacto', href: '/contacto' },
    ]
  },
];

export const NEXT_RACE_DATE = new Date('2025-07-25T10:00:00'); 

export const MOCK_NEXT_RACE: RaceEvent = {
  id: 'cbba-round-5',
  name: 'Gran Carrera de Sucre',
  round: 4,
  trackName: 'Kartódromo Sucre',
  date: NEXT_RACE_DATE,
  city: 'Chuquisaca',
  country: 'Bolivia',
  isUpcoming: true,
  sessions: [
    { name: 'Práctica Libre 1', time: 'Miercoles 09:00 - 12:00' },
    { name: 'Clasificación', time: 'Miercoles 8:00 - 10:00' },
    { name: 'Carrera', time: 'Miercoles 10:00' },
  ],
  promoImageUrl: '/calendario/carrera sucre 25 de junio.png',
  trackLayoutUrl: 'https://placehold.co/600x400.png',
};

export const FOOTER_LINKS = [
  { label: 'Política de Privacidad', href: '/privacidad' },
  { label: 'Términos de Uso', href: '/terminos' },
];

// Placeholder phone number for WhatsApp, replace with actual
const WHATSAPP_NUMBER = "59170000000"; // Example: Bolivia country code + number

export const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61576307740186', icon: 'Facebook' },
  { label: 'Instagram', href: 'https://www.instagram.com/cartexperience?igsh=MW9oajJ1b2hsM21sZQ==', icon: 'Instagram' },
  { label: 'Youtube', href: 'https://youtube.com/@kartxperience?si=wdzgQneFDhVYWn8j', icon: 'Youtube' },
  { label: 'X', href: 'https://x.com/KartX4867?t=tLFlBOJb8QD4LPT-Jc459w&s=08', icon: 'XIcon' }, // Custom icon name
  { label: 'TikTok', href: 'https://www.tiktok.com/@kartxperiencebo?_t=ZM-8xDVehSkCco&_r=1', icon: 'TikTokIcon' }, // Custom icon name
  { label: 'WhatsApp', href: `https://wa.me/${WHATSAPP_NUMBER}?text=Hola%20KartXperience%20Bolivia!`, icon: 'MessageCircle' }, // Using MessageCircle from lucide
];

export const GALLERY_CATEGORIES = ["Todos", "Carreras", "Pilotos", "Pistas", "Videos"];
