
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { GalleryImage } from '@/lib/types';
import { X } from 'lucide-react';


interface GalleryItemProps {
  image: GalleryImage;
  className?: string;
}

const GalleryItem = ({ image, className }: GalleryItemProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isModalOpen]);

  if (!image || !image.image_url) {
    return null; 
  }

  // Usar div normal en móviles o si se prefiere movimiento reducido
  const Container = (isMobile || prefersReducedMotion) ? 'div' : motion.div;
  const containerProps = (isMobile || prefersReducedMotion) 
    ? {}
    : {
        whileHover: { scale: 1.05 },
        transition: { duration: 0.3 }
      };

  return (
    <>
      <Container
        className={cn("relative overflow-hidden rounded-lg shadow-lg cursor-pointer group", className)}
        tabIndex={0}
        aria-label={`Ver ${image.title}`}
        onClick={() => setIsModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsModalOpen(true);
          }
        }}
        {...containerProps}
      >
        <div className="aspect-video w-full">
          <Image
            src={image.image_url}
            alt={image.title}
            width={400}
            height={225}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
          <p className="text-white text-sm font-bold text-center p-2">{image.title}</p>
        </div>
      </Container>

      {/* Modal personalizado estilo página de inicio pero más grande */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setIsModalOpen(false)}
        >
          {/* Contenedor del modal - similar al de inicio pero más grande */}
          <div 
            className="relative bg-gray-800 rounded-lg shadow-2xl"
            style={{
              width: '80vw',
              height: '75vh',
              maxWidth: '80vw',
              maxHeight: '75vh'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con título y botón cerrar */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-white text-lg font-semibold truncate pr-4">
                {image.title || 'Sin título'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors p-1"
                aria-label="Cerrar imagen"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenedor de la imagen con límites estrictos */}
            <div 
              className="p-4 flex items-center justify-center overflow-hidden"
              style={{
                width: '80vw',
                height: '70vh',
                maxWidth: '80vw',
                maxHeight: '70vh'
              }}
            >
              <img
                src={image.image_url}
                alt={image.title}
                className="object-contain rounded"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GalleryItem;
