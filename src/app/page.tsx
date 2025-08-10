
import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import HomepageHero from '@/components/sections/HomepageHero';
import NewsSection from '@/components/sections/NewsSection';
import HomepagePodium from '@/components/sections/HomepagePodium';
import NextRaceSection from '@/components/sections/NextRaceSection';
import HomeGalleryClient from '@/components/client/HomeGalleryClient';
import { getEvents, getNews, getPodium } from '@/lib/data';

// Metadata específica para la página de inicio
export const metadata: Metadata = {
  title: 'Inicio | Karting Bolivia',
  description: 'Bienvenido a Karting Bolivia - La comunidad de karting más grande del país. Encuentra información sobre carreras, pilotos y eventos.',
  keywords: 'inicio, karting bolivia, carreras bolivia, automovilismo bolivia',
};


export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Forzar que esta página no se almacene en caché.
  // Esta es la misma estrategia que usa la página de Calendario que sí funciona.
  noStore();

  const events = await getEvents();
  const news = await getNews();
  const podium = await getPodium();

  // Ordenamos los eventos por fecha para asegurarnos de que el próximo sea el correcto.
  const now = new Date();
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextRace = sortedEvents.find(e => new Date(e.date) > now);

  return (
    <div className="bg-background text-foreground">
      {/* Hero section sin textura */}
      <Suspense fallback={<div className="h-screen bg-background flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div></div>}>
        {/* Pasamos todos los eventos para que el componente Hero pueda determinar si hay algo en vivo */}
        <HomepageHero events={events} />
      </Suspense>
      
      {/* Contenido con fondo texturizado */}
      <div className="content-textured-bg">
        <div className="container mx-auto px-4 py-8 space-y-16">
          <Suspense fallback={<div className="h-64 bg-card/50 rounded-lg animate-pulse"></div>}>
            <NewsSection news={news} />
          </Suspense>
          <Suspense fallback={<div className="h-64 bg-card/50 rounded-lg animate-pulse"></div>}>
            <HomepagePodium podium={podium} />
          </Suspense>
          <Suspense fallback={<div className="h-64 bg-card/50 rounded-lg animate-pulse"></div>}>
            {/* Pasamos solo el próximo evento a esta sección */}
            <NextRaceSection event={nextRace} />
          </Suspense>
          <Suspense fallback={<div className="h-64 bg-card/50 rounded-lg animate-pulse"></div>}>
            <HomeGalleryClient />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
