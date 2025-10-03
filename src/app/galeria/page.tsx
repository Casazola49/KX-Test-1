
// Migrado a Firebase - Ya no usa Supabase
import PageTitle from '@/components/shared/PageTitle';
import HorizontalAd from '@/components/shared/HorizontalAd';
import SocialMediaSection from '@/components/sections/SocialMediaSection';
import type { GalleryItem } from '@/lib/types';
import { getAllGalleryItems } from '@/lib/data-service';
import GalleryClient from '@/components/client/GalleryClient';

export const revalidate = 60; // Revalidar la página cada 60 segundos

// Función para obtener todas las imágenes
async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const items = await getAllGalleryItems();
    // Mostrar todas las imágenes (ya migradas)
    return items;
  } catch (error) {
    console.error("Error fetching gallery items from Firebase:", error);
    return [];
  }
}

// Función para obtener todas las etiquetas únicas
async function getUniqueTags(): Promise<string[]> {
  try {
    const items = await getAllGalleryItems();
    // Mostrar todas las categorías
    const tags = [...new Set(items.map(item => item.category).filter(Boolean))];
    return tags.sort();
  } catch (error) {
    console.error("Error fetching unique tags:", error);
    return [];
  }
}

export default async function GaleriaPage() {
  // Obtenemos los datos en paralelo para mayor eficiencia
  const [items, tags] = await Promise.all([
    getGalleryItems(),
    getUniqueTags()
  ]);

  return (
    <>
      <PageTitle title="Galería Multimedia" subtitle="Capturando la Emoción" />
      
      {/* Sección de Redes Sociales */}
      <div className="container mx-auto px-4 py-8">
        <SocialMediaSection />
      </div>
      
      {/* Galería tradicional */}
      <GalleryClient items={items} tags={tags} />
      <HorizontalAd section="galeria" />
    </>
  );
}
