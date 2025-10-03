
"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Advertisement } from '@/lib/types';
import { getAdvertisementsBySection } from '@/lib/advertisements-client';

interface SponsorPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SponsorPopup: React.FC<SponsorPopupProps> = ({ isOpen, onOpenChange }) => {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      loadAd();
    }
  }, [isOpen, pathname]);

  const loadAd = async () => {
    try {
      // Determinar la sección basada en la ruta
      const section = getSectionFromPath(pathname);
      
      // Primero buscar anuncios específicos de la sección
      let ads = await getAdvertisementsBySection(section, 'popup');
      
      // Si no hay anuncios específicos, buscar anuncios globales
      if (ads.length === 0) {
        ads = await getAdvertisementsBySection('global', 'popup');
      }
      
      // Seleccionar un anuncio aleatorio si hay varios
      if (ads.length > 0) {
        const randomAd = ads[Math.floor(Math.random() * ads.length)];
        setAd(randomAd);
      }
    } catch (error) {
      console.error('Error loading popup ad:', error);
    }
  };

  const getSectionFromPath = (path: string): string => {
    if (path === '/') return 'home';
    if (path.startsWith('/noticias')) return 'noticias';
    if (path.startsWith('/eventos')) return 'eventos';
    if (path.startsWith('/pilotos')) return 'pilotos';
    if (path.startsWith('/galeria')) return 'galeria';
    if (path.startsWith('/pistas')) return 'pistas';
    if (path.startsWith('/kart')) return 'kart';
    if (path.startsWith('/equipamiento')) return 'equipamiento';
    if (path.startsWith('/reglamento')) return 'reglamento';
    if (path.startsWith('/contacto')) return 'contacto';
    if (path.startsWith('/live')) return 'live';
    return 'home';
  };

  const handleAdClick = () => {
    if (ad?.link_url) {
      window.open(ad.link_url, '_blank', 'noopener,noreferrer');
      onOpenChange(false);
    }
  };

  if (!isOpen || !ad) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden shadow-2xl border-primary/50">
        <DialogHeader className="p-4 bg-primary/10">
          <DialogTitle className="text-lg font-semibold text-primary text-center">
            Un Mensaje de Nuestro Sponsor
          </DialogTitle>
          <DialogDescription className="sr-only">
            Popup de patrocinador. Puedes cerrarlo con el botón de cerrar o la tecla escape.
          </DialogDescription>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 rounded-full text-primary hover:bg-primary/20"
              aria-label="Cerrar anuncio"
            >
              <X size={20} />
            </Button>
          </DialogClose>
        </DialogHeader>
        <div 
          className={`p-1 bg-background ${ad.link_url ? 'cursor-pointer' : ''}`}
          onClick={handleAdClick}
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-sm">
            <Image
              src={ad.image_url}
              alt={ad.name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        </div>
        <div className="p-4 text-center bg-background">
          <DialogClose asChild>
            <Button variant="outline" size="sm">Cerrar</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SponsorPopup;
