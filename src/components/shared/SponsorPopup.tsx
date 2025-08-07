
"use client";

import { Dialog, DialogContent, DialogClose, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { X } from 'lucide-react';

interface SponsorPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SponsorPopup: React.FC<SponsorPopupProps> = ({ isOpen, onOpenChange }) => {
  if (!isOpen) return null;

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
        <div className="p-1 bg-background">
          <div className="relative aspect-video w-full overflow-hidden rounded-sm">
            <Image
              src="/publicidad/publicidad.jpg"
              alt="Publicidad KartXperience Bolivia"
              layout="fill"
              objectFit="contain" 
              data-ai-hint="advertisement banner sponsor"
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
