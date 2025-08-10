'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import GalleryItem from '@/components/shared/GalleryItem';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import AdBanner from '@/components/shared/AdBanner';
import { GalleryImage } from '@/lib/types';
import Section from '@/components/shared/Section';
import { supabase } from '@/lib/supabase-client';

export default function HomeGalleryClient() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);

    async function fetchGalleryImages() {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('gallery')
          .select('*')
          .eq('type', 'image') // Cambiado de 'foto' a 'image'
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) {
          console.error('Error fetching gallery images:', error);
          return;
        }

        if (data && data.length > 0) {
          const processedImages: GalleryImage[] = data.map((item: any) => ({
            id: item.id,
            title: item.title || 'Sin título',
            description: item.description || item.alt || '',
            image_url: item.src,
            created_at: item.created_at
          }));

          setImages(processedImages);
        }
      } catch (error) {
        console.error('Error in fetchGalleryImages:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGalleryImages();
  }, []);

  // Evitar problemas de hidratación
  if (!mounted || isLoading) {
    return (
      <Section title="Galería" subtitle="Últimas imágenes">
        <div className="text-center py-12">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando galería...</p>
        </div>
      </Section>
    );
  }

  const hasImages = images && images.length > 0;

  return (
    <Section title="Galería" subtitle="Últimas imágenes">
      {hasImages ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image) => (
              <div key={image.id}>
                <GalleryItem image={image} />
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/galeria">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                Ir a la galería completa
              </Button>
            </Link>
          </div>
          <AdBanner />
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay imágenes disponibles</p>
          <div className="text-center mt-8">
            <Link href="/galeria">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-gray-900 transition-colors">
                Visitar la Galería
              </Button>
            </Link>
          </div>
          <AdBanner />
        </div>
      )}
    </Section>
  );
}