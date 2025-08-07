
'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { GalleryImage } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


interface GalleryItemProps {
  image: GalleryImage;
  className?: string;
}

const GalleryItem = ({ image, className }: GalleryItemProps) => {
  if (!image || !image.image_url) {
    return null; 
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          className={cn("relative overflow-hidden rounded-lg shadow-lg cursor-pointer group", className)}
          tabIndex={0}
          aria-label={`Ver ${image.title}`}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <div className="aspect-video w-full">
            <Image
              src={image.image_url}
              alt={image.title}
              width={400}
              height={400}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
            <p className="text-white text-sm font-bold text-center p-2">{image.title}</p>
          </div>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{image.title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <Image
            src={image.image_url}
            alt={image.title}
            width={800}
            height={600}
            className="object-contain w-full h-full rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GalleryItem;
