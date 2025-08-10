
'use client';
import { useRef, useEffect } from 'react';
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
  // Crear una nueva instancia del plugin cada vez para evitar problemas de estado
  const autoplayPlugin = useRef<any>(null);
  
  // Inicializar el plugin
  if (!autoplayPlugin.current) {
    autoplayPlugin.current = Autoplay({ 
      delay: 5000, 
      stopOnInteraction: false,
      stopOnMouseEnter: true,
      stopOnFocusIn: false,
      playOnInit: true
    });
  }

  // Si no hay noticias, no renderizar nada.
  if (!news || news.length === 0) {
    return (
        <div className="container mx-auto px-4 text-center py-12">
            <p className="text-muted-foreground">No hay noticias disponibles en este momento.</p>
        </div>
    );
  }

  const mainNews = condensed ? news.slice(0, 4) : []; // Cambiado a 4 noticias para el carrusel
  const latestNews = condensed ? news.slice(0, 4) : news;

  // Asegurar que el autoplay se inicie correctamente
  useEffect(() => {
    if (mainNews.length > 1) {
      console.log('Iniciando autoplay del carrusel de noticias con', mainNews.length, 'noticias');
      
      // Múltiples intentos para asegurar que se inicie
      const timer1 = setTimeout(() => {
        autoplayPlugin.current.play();
      }, 100);
      
      const timer2 = setTimeout(() => {
        autoplayPlugin.current.reset();
        autoplayPlugin.current.play();
      }, 1000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [mainNews.length]);

  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {showTitle && <h2 className="text-3xl md:text-5xl font-f1-bold text-center mb-12 text-foreground">Últimas Noticias</h2>}
        
        {condensed && mainNews.length > 0 && (
          <Carousel 
            className="w-full max-w-4xl mx-auto mb-16" 
            opts={{ 
              loop: true, 
              align: "start",
              skipSnaps: false,
              dragFree: false
            }}
            plugins={[autoplayPlugin.current]}
            onMouseEnter={() => {
              autoplayPlugin.current.stop();
            }}
            onMouseLeave={() => {
              autoplayPlugin.current.reset();
              autoplayPlugin.current.play();
            }}
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
            <CarouselPrevious className="text-foreground border-border hover:bg-accent" />
            <CarouselNext className="text-foreground border-border hover:bg-accent" />
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
              <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors">
                Ver todas las noticias
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
