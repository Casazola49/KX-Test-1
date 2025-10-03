'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import NewsCard from '@/components/shared/NewsCard';
import { News } from '@/lib/types';

interface OptimizedNewsSectionProps {
  news: News[];
}

export default function OptimizedNewsSection({ news }: OptimizedNewsSectionProps) {
  if (!news || news.length === 0) {
    return (
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-f1-bold text-center mb-8 text-foreground">Últimas Noticias</h2>
          <p className="text-muted-foreground">No hay noticias disponibles en este momento.</p>
        </div>
      </section>
    );
  }

  // Mostrar máximo 6 noticias en la página de inicio
  const displayNews = news.slice(0, 6);

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-f1-bold text-center mb-12 text-foreground">
          Últimas Noticias
        </h2>
        
        {/* Grid optimizado de noticias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {displayNews.map((item) => (
            <NewsCard key={item.id} news={item} />
          ))}
        </div>
        
        {/* Botón para ver todas las noticias */}
        <div className="text-center">
          <Link href="/noticias">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Ver todas las noticias
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}