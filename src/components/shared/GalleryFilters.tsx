
"use client";

import { Button } from '@/components/ui/button';
import { GALLERY_CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { PlayCircle } from 'lucide-react';

interface GalleryFiltersProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  condensed?: boolean;
}

const GalleryFilters: React.FC<GalleryFiltersProps> = ({ selectedCategory, onSelectCategory, condensed }) => {
  if (condensed) {
    return null;
  }

  return (
    <div className="flex flex-wrap justify-center items-center gap-2 mb-8 md:mb-12 animate-in fade-in slide-in-from-top-10 duration-700 delay-200">
      {GALLERY_CATEGORIES.map((category) => {
        const isVideosButton = category === "Videos";
        const isActive = selectedCategory === category;

        return (
          <Button
            key={category}
            variant={isActive ? 'default' : 'outline'}
            onClick={() => onSelectCategory(category)}
            className={cn("rounded-full transition-all duration-200", {
              'bg-primary text-primary-foreground shadow-lg scale-105': isVideosButton && isActive,
              'border-primary/50 text-primary hover:bg-primary/10 hover:border-primary': isVideosButton && !isActive,
            })}
          >
            {isVideosButton && <PlayCircle className="mr-2 h-4 w-4" />}
            {category}
          </Button>
        );
      })}
    </div>
  );
};

export default GalleryFilters;

    