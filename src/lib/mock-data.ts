
import { Event, News, Podium, GalleryImage, Track, Pilot } from './types';

export const tracks: Track[] = [
  { id: '1', name: 'Circuito de Sucre', location: 'Sucre', length: 2.5, curves: 12, imageUrl: '/pistas/pista sucre.png', description: 'Un circuito técnico en la capital de Bolivia.' },
  { id: '2', name: 'Kartódromo de La Paz', location: 'La Paz', length: 1.8, curves: 9, imageUrl: '/pistas/pista la paz.png', description: 'El circuito a mayor altitud del mundo.' },
];

export const pilots: Pilot[] = [
  { id: '1', firstName: 'Andres', lastName: 'Jimenez', slug: 'andres-jimenez', number: 7, category: '125cc', imageUrl: '/pilotos/andres jimenez.png', teamName: 'Scuderia AlphaTauri' },
  { id: '2', firstName: 'Hans', lastName: 'Padilla', slug: 'hans-padilla', number: 10, category: '125cc', imageUrl: '/pilotos/hans padilla.png', teamName: 'Red Bull Racing' },
  { id: '3', firstName: 'Herald', lastName: 'Antezana', slug: 'herald-antezana', number: 23, category: '125cc', imageUrl: '/pilotos/herald antezana.png', teamName: 'Mercedes-AMG Petronas' },
  { id: '4', firstName: 'Juan', lastName: 'Perez', slug: 'juan-perez', number: 5, category: '125cc', imageUrl: '/pilotos/piloto.png', teamName: 'McLaren' },
  { id: '5', firstName: 'Carlos', lastName: 'Sainz', slug: 'carlos-sainz', number: 55, category: '125cc', imageUrl: '/pilotos/piloto.png', teamName: 'Ferrari' },
];

export const eventos: Event[] = [
  { id: '1', name: 'Carrera en Vivo', date: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), track: tracks[0] },
  { id: '2', name: 'GP de Sucre', date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(), track: tracks[0] },
];

export const noticias: News[] = [
  { id: '1', title: 'El futuro del karting en Bolivia', slug: 'futuro-karting-bolivia', imageUrl: '/noticias/Entrada 1 evolucion foto.png', excerpt: 'Una mirada a las próximas estrellas y tecnologías.', date: '2024-01-01' },
  { id: '2', title: 'Secretos de la puesta a punto', slug: 'secretos-puesta-a-punto', imageUrl: '/noticias/Secretos en el asfalto foto.png', excerpt: 'Consejos de los expertos para mejorar tu rendimiento.', date: '2024-01-02' },
  { id: '3', title: 'Historia del GP de La Paz', slug: 'historia-gp-la-paz', imageUrl: '/noticias/Entrada 2 el valle de velocidad foto.png', excerpt: 'Recordando las carreras más emocionantes.', date: '2024-01-03' },
  { id: '4', title: 'Análisis del nuevo chasis 2024', slug: 'analisis-chasis-2024', imageUrl: '/noticias/Donde el asfalto late foto.png', excerpt: '¿Qué cambia y cómo afecta a los pilotos?', date: '2024-01-04' },
];

export const podio: Podium = {
  '125cc': [
    { pilot: pilots[0], position: 1 },
    { pilot: pilots[1], position: 2 },
    { pilot: pilots[2], position: 3 },
    { pilot: pilots[3], position: 4 },
    { pilot: pilots[4], position: 5 },
  ],
};

export const galeria: GalleryImage[] = [
  { id: '1', src: '/gallery/arte 1.jpg', title: 'Salida en Sucre', slug: 'salida-sucre' },
  { id: '2', src: '/gallery/arte 2.jpg', title: 'Adelantamiento en la curva 5', slug: 'adelantamiento-curva-5' },
  { id: '3', src: '/gallery/arte 3.jpg', title: 'Celebración en el podio', slug: 'celebracion-podio' },
  { id: '4', src: '/gallery/arte 4.jpg', title: 'Lluvia en La Paz', slug: 'lluvia-la-paz' },
  { id: '5', src: '/gallery/arte 5.jpg', title: 'Puesta a punto', slug: 'puesta-a-punto' },
  { id: '6', src: '/gallery/arte 6.jpg', title: 'Cascos de los pilotos', slug: 'cascos-pilotos' },
];
