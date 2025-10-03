'use client';

import Image from 'next/image';
import { useAdvertisements } from '@/hooks/useAdvertisements';

interface HorizontalAdProps {
  section: string;
  className?: string;
}

export default function HorizontalAd({ section, className = '' }: HorizontalAdProps) {
  const { ad, loading } = useAdvertisements(section, 'horizontal');

  const handleAdClick = () => {
    if (ad?.link_url) {
      window.open(ad.link_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading || !ad) {
    return null;
  }

  return (
    <div className={`w-full my-8 ${className}`}>
      <div className="container mx-auto px-4">
        <div 
          className={`relative w-full rounded-lg overflow-hidden shadow-lg bg-gradient-to-r from-muted/5 to-muted/10 ${
            ad.link_url ? 'cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.005]' : ''
          }`}
          onClick={handleAdClick}
        >
          {/* Contenedor optimizado para banners horizontales muy anchos */}
          <div className="w-full p-2">
            <img
              src={ad.image_url}
              alt={ad.name}
              className="w-full h-auto"
              style={{
                display: 'block',
                maxWidth: '100%',
                height: 'auto',
                // Sin restricción de altura máxima para que se vea completa
              }}
              loading="lazy"
            />
          </div>
          {ad.link_url && (
            <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors duration-300" />
          )}
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2 opacity-70">Publicidad</p>
      </div>
    </div>
  );
}