
'use client';

import { useState, useMemo } from 'react';
import type { GalleryItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// Helper para optimizar las imágenes de Cloudinary
const getTransformedUrl = (url: string, width: number, height: number) => {
  if (!url) return 'https://placehold.co/400x400.png';
  
  // Si es una URL de Cloudinary, aplicar transformaciones
  if (url.includes('cloudinary.com')) {
    try {
      // Insertar transformaciones de Cloudinary
      const transformations = `c_fill,w_${width},h_${height},q_auto,f_auto`;
      return url.replace('/upload/', `/upload/${transformations}/`);
    } catch {
      return url; // Si falla, usar la URL original
    }
  }
  
  // Para otras URLs, usar tal como están
  return url;
};


export default function GalleryClient({ items, tags }: { items: GalleryItem[], tags: string[] }) {
  const [selectedTag, setSelectedTag] = useState<string>('Todos');
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // Mostrar todas las imágenes (ya migradas a Cloudinary)
  const validItems = items;

  const filteredItems = useMemo(() => {
    if (selectedTag === 'Todos') {
      return validItems;
    }
    // Usar category en lugar de tags para el filtrado
    return validItems.filter(item => item.category === selectedTag);
  }, [validItems, selectedTag]);

  const lightboxSlides = filteredItems.map(item => ({
      // Usar la URL original sin transformar para mejor calidad
      src: item.src,
      title: item.title,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <Button
          variant={selectedTag === 'Todos' ? 'default' : 'outline'}
          onClick={() => setSelectedTag('Todos')}
        >
          Todos
        </Button>
        {tags.map(tag => (
          <Button
            key={tag}
            variant={selectedTag === tag ? 'default' : 'outline'}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </Button>
        ))}
      </div>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg"
              onClick={() => setLightboxIndex(index)}
            >
              <Image
                // CORRECCIÓN: Usar item.src
                src={getTransformedUrl(item.src, 400, 400)}
                alt={item.title || 'Galería de Karting'}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                className="bg-muted object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              {item.title && (
                <div className="absolute bottom-0 left-0 p-3">
                  <h3 className="text-sm font-semibold text-white drop-shadow-md">{item.title}</h3>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No hay imágenes que coincidan con la etiqueta seleccionada.</p>
        </div>
      )}

      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={lightboxSlides}
        carousel={{
          finite: true,
        }}
        controller={{
          closeOnBackdropClick: true,
        }}
        styles={{
          container: {
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
          },
          slide: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          },
        }}
        render={{
          slide: ({ slide }) => (
            <div 
              style={{
                width: '80vw',
                height: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(40, 40, 40, 0.9)',
                borderRadius: '8px',
                padding: '20px',
              }}
            >
              <img
                src={slide.src}
                alt={slide.title || 'Imagen de galería'}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  width: 'auto',
                  height: 'auto',
                  borderRadius: '4px'
                }}
              />
            </div>
          ),
        }}
      />
    </div>
  );
}
