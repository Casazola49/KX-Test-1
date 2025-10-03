
import { Suspense } from 'react';
import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import HomepageHero from '@/components/sections/HomepageHero';
import NewsSection from '@/components/sections/NewsSection';
import HomepagePodium from '@/components/sections/HomepagePodium';
import NextRaceSection from '@/components/sections/NextRaceSection';
import HomeGalleryClient from '@/components/client/HomeGalleryClient';
import FeaturedProductsCarousel from '@/components/shared/FeaturedProductsCarousel';
import ServerHorizontalAd from '@/components/shared/ServerHorizontalAd';

import ResourcePreloader from '@/components/optimization/ResourcePreloader';
import InvisibleOptimizations from '@/components/optimization/InvisibleOptimizations';

// Metadata específica para la página de inicio
export const metadata: Metadata = {
  title: 'Inicio | Karting Bolivia',
  description: 'Bienvenido a Karting Bolivia - La comunidad de karting más grande del país. Encuentra información sobre carreras, pilotos y eventos.',
  keywords: 'inicio, karting bolivia, carreras bolivia, automovilismo bolivia',
};

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// Función optimizada para cargar datos en paralelo con cache inteligente
async function getOptimizedHomePageData() {
  try {
    // Cargar datos con cache inteligente para mejor rendimiento
    const [events, news, podium, products] = await Promise.allSettled([
      import('@/lib/performance-optimizations').then(m => m.getCachedEvents()),
      import('@/lib/performance-optimizations').then(m => m.getCachedNews()),
      import('@/lib/data').then(m => m.getPodium()), // Podium siempre fresco
      import('@/lib/performance-optimizations').then(m => m.getCachedProducts())
    ]);

    return {
      events: events.status === 'fulfilled' ? events.value : [],
      news: news.status === 'fulfilled' ? news.value : [],
      podium: podium.status === 'fulfilled' ? podium.value : { eventName: '', podiums: {} },
      products: products.status === 'fulfilled' ? products.value : []
    };
  } catch (error) {
    console.error('Error loading homepage data:', error);
    // Fallback a la carga original si el cache falla
    try {
      const [events, news, podium, products] = await Promise.allSettled([
        import('@/lib/data').then(m => m.getEvents()),
        import('@/lib/data').then(m => m.getNews()),
        import('@/lib/data').then(m => m.getPodium()),
        import('@/lib/data-service').then(m => m.getAllProducts())
      ]);

      return {
        events: events.status === 'fulfilled' ? events.value : [],
        news: news.status === 'fulfilled' ? news.value : [],
        podium: podium.status === 'fulfilled' ? podium.value : { eventName: '', podiums: {} },
        products: products.status === 'fulfilled' ? products.value : []
      };
    } catch (fallbackError) {
      console.error('Fallback loading also failed:', fallbackError);
      return {
        events: [],
        news: [],
        podium: { eventName: '', podiums: {} },
        products: []
      };
    }
  }
}

export default async function HomePage() {
  // Forzar que esta página no se almacene en caché.
  // Esta es la misma estrategia que usa la página de Eventos que sí funciona.
  noStore();

  // Cargar datos de forma optimizada (en paralelo) pero manteniendo la funcionalidad original
  const { events, news, podium, products } = await getOptimizedHomePageData();

  // Ordenamos los eventos por fecha para asegurarnos de que el próximo sea el correcto.
  const now = new Date();
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextRace = sortedEvents.find(e => new Date(e.date) > now);

  return (
    <div className="bg-background text-foreground">
      {/* Hero section sin textura - ORIGINAL CON TODAS LAS ANIMACIONES */}
      <Suspense fallback={<div className="h-screen bg-background flex items-center justify-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div></div>}>
        {/* Pasamos todos los eventos para que el componente Hero pueda determinar si hay algo en vivo */}
        <HomepageHero events={events} />
      </Suspense>
      
      {/* Contenido con fondo texturizado - ORIGINAL */}
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
      
      {/* Carrusel de Productos Destacados - ORIGINAL CON TODAS LAS ANIMACIONES */}
      <Suspense fallback={<div className="h-96 bg-black animate-pulse"></div>}>
        <FeaturedProductsCarousel products={products} />
      </Suspense>
      
      <ServerHorizontalAd section="home" />
      
      {/* Optimizaciones invisibles de rendimiento */}
      <ResourcePreloader />
      <InvisibleOptimizations />
      

    </div>
  );
}
