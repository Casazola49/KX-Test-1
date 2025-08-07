
'use client';
import { useRef } from 'react';
import Link from 'next/link';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import NewsCard from '@/components/shared/NewsCard';
import { News } from '@/lib/types';

interface NewsSectionProps {
  news: News[];
  condensed?: boolean;
  showTitle?: boolean;
}

export default function NewsSection({ news, condensed = true, showTitle = true }: NewsSectionProps) {
  const plugin = useRef(
    Autoplay({ delay: 10000, stopOnInteraction: true })
  );

  // Si no hay noticias, no renderizar nada.
  if (!news || news.length === 0) {
    return (
        <div className="container mx-auto px-4 text-center py-12">
            <p className="text-white">No hay noticias disponibles en este momento.</p>
        </div>
    );
  }

  const mainNews = condensed ? news.slice(0, 3) : [];
  const latestNews = condensed ? news.slice(0, 4) : news;

  return (
    <section className="py-12 md:py-24 bg-gray-900 pattern-bg">
      <div className="container mx-auto px-4">
        {showTitle && <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 text-white">Últimas Noticias</h2>}
        
        {condensed && mainNews.length > 0 && (
          <Carousel 
            className="w-full max-w-4xl mx-auto mb-16" 
            opts={{ loop: true }}
            plugins={[plugin.current]}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
          >
            <CarouselContent>
              {mainNews.map((item) => (
                <CarouselItem key={item.id}>
                  <div className="p-1">
                    <NewsCard news={item} isLarge />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="text-white" />
            <CarouselNext className="text-white" />
          </Carousel>
        )}

        <div className={`grid grid-cols-1 md:grid-cols-2 ${condensed ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-8 mb-12`}>
          {latestNews.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
        
        {condensed && (
          <div className="text-center">
            <Link href="/noticias">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-gray-900 transition-colors">
                Ver todas las noticias
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
