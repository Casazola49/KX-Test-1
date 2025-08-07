
'use client';

import Image from 'next/image';
import { useState } from 'react';
import Section from '@/components/shared/Section';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface EventGalleryProps {
  imageUrls: string[];
}

export default function EventGallery({ imageUrls }: EventGalleryProps) {
  if (!imageUrls || imageUrls.length === 0) {
    return null; // No renderizar nada si no hay imágenes
  }

  return (
    <Section title="Galería del Evento">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {imageUrls.map((url, index) => (
          <Dialog key={index}>
            <DialogTrigger asChild>
              <div className="relative aspect-video w-full h-auto rounded-lg overflow-hidden shadow-md cursor-pointer group">
                <Image
                  src={url}
                  alt={`Imagen de la galería del evento ${index + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  className="transition-transform duration-300 ease-in-out group-hover:scale-110"
                />
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300"></div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-auto p-2 bg-transparent border-none shadow-none">
              <div className="relative w-full h-[80vh]">
                 <Image
                  src={url}
                  alt={`Imagen ampliada de la galería del evento ${index + 1}`}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </Section>
  );
}
