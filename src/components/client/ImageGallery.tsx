"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface ImageGalleryProps {
  images?: string[];
  altText: string;
}

export default function ImageGallery({ images, altText }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Escucha la tecla 'Escape' para cerrar el modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  if (!images || images.length === 0) {
    return null;
  }

  const handleOpen = (img: string) => {
    setSelectedImage(img);
  };

  const handleClose = () => {
    setSelectedImage(null);
  };

  return (
    <>
      <div className="mt-8 md:mt-12">
        <h2 className="text-3xl font-bold font-headline mb-6 text-center text-primary">Galería de la Pista</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img, index) => (
            <button
              onClick={() => handleOpen(img)}
              key={index}
              className="block w-full h-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg overflow-hidden group"
            >
              <div className="relative aspect-video w-full rounded-lg shadow-lg overflow-hidden transition-transform group-hover:scale-105">
                <Image
                  src={img}
                  alt={`${altText} ${index + 1}`}
                  fill
                  style={{ objectFit: 'cover' }}
                  data-ai-hint="track detail photo"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in-50"
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-primary transition-colors z-50 p-2 rounded-full bg-black/20 hover:bg-black/50"
            onClick={handleClose}
            aria-label="Cerrar imagen"
          >
            <X size={28} />
          </button>
          <div
            className="relative w-full h-full max-w-5xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()} // Evita que el modal se cierre al hacer clic en la imagen
          >
            <Image
              src={selectedImage}
              alt="Vista ampliada"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      )}
    </>
  );
}
