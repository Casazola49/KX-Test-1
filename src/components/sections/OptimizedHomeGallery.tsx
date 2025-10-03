import Link from 'next/link';
import { Button } from '@/components/ui/button';
import GalleryItem from '@/components/shared/GalleryItem';
import { GalleryImage } from '@/lib/types';
import Section from '@/components/shared/Section';

interface OptimizedHomeGalleryProps {
  images: any[]; // Datos de Firebase
}

export default function OptimizedHomeGallery({ images }: OptimizedHomeGalleryProps) {
  // Convertir datos de Firebase al formato esperado
  const galleryImages: GalleryImage[] = images.map((item: any) => ({
    id: item.id,
    title: item.title || 'Sin título',
    description: item.description || item.alt || '',
    image_url: item.src,
    created_at: item.createdAt
  }));

  const hasImages = galleryImages && galleryImages.length > 0;

  return (
    <Section title="Galería" subtitle="Últimas imágenes">
      {hasImages ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galleryImages.map((image) => (
              <div key={image.id}>
                <GalleryItem image={image} />
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/galeria">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
              >
                Ver galería completa
              </Button>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="mb-4">No hay imágenes disponibles</p>
          <Link href="/galeria">
            <Button 
              variant="outline" 
              size="lg" 
              className="border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
            >
              Visitar la Galería
            </Button>
          </Link>
        </div>
      )}
    </Section>
  );
}