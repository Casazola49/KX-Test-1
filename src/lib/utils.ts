
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { FullPodium, GroupedPodiums } from './types'; // Import types from the single source of truth


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// This function is now simplified and relies on the restored types.
export function groupPodiumsByCategory(podiums: FullPodium[] | null | undefined): GroupedPodiums {
  if (!podiums) {
    return {};
  }

  try {
    const podiumTypeOrder = [
        'PODIO_OFICIAL_DEFINITIVO', 
        'PODIO_EVENTO',
        'FINAL', 
        'MANGA_3_PRE_FINAL', 
        'MANGA_2', 
        'MANGA_1', 
        'CLASIFICACION'
    ];

    const grouped = podiums.reduce((acc, podium) => {
      // Gracefully handle cases where podium or podium.category might be null/undefined
      const categoryName = podium?.category?.name || 'Sin Categoría';
      
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(podium);
      
      return acc;
    }, {} as GroupedPodiums);

    // Sort podiums within each category
    for (const categoryName in grouped) {
      grouped[categoryName].sort((a, b) => {
        const indexA = podiumTypeOrder.indexOf(a.podium_type);
        const indexB = podiumTypeOrder.indexOf(b.podium_type);

        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        
        return indexA - indexB;
      });
    }

    return grouped;

  } catch (error) {
    console.error("Failed to group podiums by category:", error);
    return {};
  }
}
export type { FullEvent } from './types';
export type { FullPodium, GroupedPodiums } from './types';
