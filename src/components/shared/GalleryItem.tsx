
'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
        onClick={() => {
          console.log('🖱️ Image clicked:', image.title, image.image_url);
          setIsModalOpen(true);
          setImageLoading(true);
          setImageError(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsModalOpen(true);
            setImageLoading(true);
            setImageError(false);
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

      {/* Modal con portal para mejor renderizado */}
      {isModalOpen && mounted && typeof window !== 'undefined' && createPortal(
        <div 
          className="gallery-modal fixed inset-0 bg-black flex items-center justify-center"
          style={{ 
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
          onClick={() => setIsModalOpen(false)}
        >
          {/* Botón de cerrar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(false);
            }}
            className="absolute top-4 right-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 z-50"
            aria-label="Cerrar imagen"
          >
            <X size={24} />
          </button>

          {/* Contenedor de imagen simplificado */}
          <div 
            className="relative flex items-center justify-center p-8"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100vw',
              height: '100vh'
            }}
          >
            {/* Solo una imagen simple y directa */}
            <img
              src={image.image_url}
              alt={image.title}
              className="max-w-full max-h-full object-contain"
              style={{
                maxWidth: 'calc(100vw - 4rem)',
                maxHeight: 'calc(100vh - 4rem)',
                width: 'auto',
                height: 'auto'
              }}
              onLoad={() => {
                console.log('✅ Portal modal image loaded:', image.image_url);
              }}
              onError={(e) => {
                console.error('❌ Portal modal image error:', image.image_url, e);
              }}
            />
            
            {/* Título */}
            {image.title && (
              <div className="absolute bottom-8 left-8 right-8 bg-black bg-opacity-70 p-4 rounded text-center">
                <h3 className="text-white text-lg font-semibold">
                  {image.title}
                </h3>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default GalleryItem;
