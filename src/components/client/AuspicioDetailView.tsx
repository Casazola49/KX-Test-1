
"use client";

import { useState } from 'react';
import type { AuspicioItem } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AuspicioDetailViewProps {
  auspicioItem: AuspicioItem;
}

export default function AuspicioDetailView({ auspicioItem }: AuspicioDetailViewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { title, galleryImageUrls, content, aiHint } = auspicioItem;

  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? galleryImageUrls.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === galleryImageUrls.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
      {/* Carrusel de Imágenes */}
      {galleryImageUrls && galleryImageUrls.length > 0 && (
        <Card className="shadow-xl overflow-hidden flex"> {/* Ensure Card can flex its content */}
          <CardContent className="p-0 w-full"> {/* CardContent takes full width */}
            <div className="relative w-full h-full min-h-[300px] md:min-h-[400px] bg-card flex items-center justify-center p-1"> {/* Removed aspect-video, added h-full, min-h, flex centering and padding */}
              <Image
                key={galleryImageUrls[currentImageIndex]} 
                src={galleryImageUrls[currentImageIndex]}
                alt={`${title} - Imagen ${currentImageIndex + 1}`}
                layout="fill"
                objectFit="contain"
                className="animate-in fade-in duration-300"
                data-ai-hint={`${aiHint} product detail`}
              />
              {galleryImageUrls.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-2 z-10"
                    onClick={goToPreviousImage}
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft size={28} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white rounded-full p-2 z-10"
                    onClick={goToNextImage}
                    aria-label="Siguiente imagen"
                  >
                    <ChevronRight size={28} />
                  </Button>
                </>
              )}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
                {currentImageIndex + 1} / {galleryImageUrls.length}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenido de Texto */}
      <Card className="shadow-xl">
        <CardContent className="p-6 md:p-8">
          <h2 className="text-2xl font-bold text-primary mb-4">{title}</h2>
          <div
            className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none text-foreground/90"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
