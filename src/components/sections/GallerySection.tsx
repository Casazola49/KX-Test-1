
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import GalleryItem from '@/components/shared/GalleryItem';
import { GalleryImage } from '@/lib/types';
import Section from '@/components/shared/Section';

interface GallerySectionProps {
  images: GalleryImage[];
}

export default function GallerySection({ images }: GallerySectionProps) {
  // Verificamos si 'images' existe y si tiene elementos.
  const hasImages = images && images.length > 0;

  return (
    <Section title="Galería" subtitle="Últimas imágenes">
      {hasImages ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.slice(0, 6).map((image) => (
              <div key={image.id}>
                <GalleryItem image={image} />
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/galeria">
              <Button variant="outline" size="lg" className="border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors">
                Ir a la galería completa
              </Button>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No hay imágenes en la galería en este momento.</p>
          <div className="text-center mt-8">
            <Link href="/galeria">
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-gray-900 transition-colors">
                Visitar la Galería
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Section>
  );
}
