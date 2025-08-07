
import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import HomepageHero from '@/components/sections/HomepageHero';
import NewsSection from '@/components/sections/NewsSection';
import HomepagePodium from '@/components/sections/HomepagePodium';
import NextRaceSection from '@/components/sections/NextRaceSection';
import GallerySection from '@/components/sections/GallerySection';
import { getEvents, getNews, getPodium, getGalleryImages } from '@/lib/data';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Forzar que esta página no se almacene en caché.
  // Esta es la misma estrategia que usa la página de Calendario que sí funciona.
  noStore();

  const events = await getEvents();
  const news = await getNews();
  const podium = await getPodium();
  const galleryImages = await getGalleryImages();

  // Ordenamos los eventos por fecha para asegurarnos de que el próximo sea el correcto.
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextRace = sortedEvents.find(e => new Date(e.date) > new Date());

  return (
    <div className="bg-black text-white pattern-bg">
      <Suspense fallback={<div className="h-screen bg-black" />}>
        {/* Pasamos todos los eventos para que el componente Hero pueda determinar si hay algo en vivo */}
        <HomepageHero events={events} />
      </Suspense>
      <Suspense fallback={<div className="h-screen bg-black" />}>
        <NewsSection news={news} />
      </Suspense>
      <Suspense fallback={<div className="h-screen bg-black" />}>
        <HomepagePodium podium={podium} />
      </Suspense>
      <Suspense fallback={<div className="h-screen bg-black" />}>
        {/* Pasamos solo el próximo evento a esta sección */}
        <NextRaceSection event={nextRace} />
      </Suspense>
      <Suspense fallback={<div className="h-screen bg-black" />}>
        <GallerySection images={galleryImages} />
      </Suspense>
    </div>
  );
}
