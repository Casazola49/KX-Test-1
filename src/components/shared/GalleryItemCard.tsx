
import Image from 'next/image';
import type { GalleryItem as GalleryItemType } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { PlayCircle, ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface GalleryItemProps {
  item: GalleryItemType;
  onOpenModal: (item: GalleryItemType) => void;
}

const GalleryItemCard: React.FC<GalleryItemProps> = ({ item, onOpenModal }) => {
  return (
    <button
      onClick={() => onOpenModal(item)}
      className="group/galleryitem relative block w-full overflow-hidden shadow-lg cursor-pointer transform transition-all duration-300 ease-in-out hover:shadow-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
      aria-label={`Ver ${item.title || 'elemento de galería'}`}
    >
      <Card
        className="w-full rounded-lg overflow-hidden border-none"
        tabIndex={-1} // Makes the card unfocusable, the button is the focus target
      >
        <div className="aspect-video w-full bg-card">
          <Image
            src={item.thumbnailSrc || item.src}
            alt={item.alt || item.title || ''}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-transform duration-500 ease-in-out group-hover/galleryitem:scale-110"
            data-ai-hint={item.category === "Pilotos" ? "karting pilot action" : (item.category === "Pistas" ? "karting track view" : "karting race scene")}
          />
        </div>

        {/* Overlay for icon and title */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/galleryitem:opacity-100 transition-opacity duration-300 ease-in-out flex flex-col justify-between p-3 md:p-4">
          {/* Top right badge for category */}
          {item.category && (
            <div className="self-end">
              <Badge variant="secondary" className="bg-black/60 text-white border-none">
                {item.category}
              </Badge>
            </div>
          )}

          {/* Center icon */}
          <div className="flex-grow flex items-center justify-center">
            <div className="bg-black/50 rounded-full p-3 transform transition-transform duration-300 group-hover/galleryitem:scale-125">
               {item.type === 'video' ? (
                  <PlayCircle size={48} className="text-white drop-shadow-lg" />
                  ) : (
                  <ImageIcon size={48} className="text-white drop-shadow-lg" />
              )}
            </div>
          </div>

          {/* Bottom title */}
          {item.title && <h3 className="text-white font-bold text-base md:text-lg drop-shadow-md truncate">{item.title}</h3>}
        </div>
      </Card>
    </button>
  );
};

export default GalleryItemCard;
