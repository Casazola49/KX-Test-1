
import PageTitle from '@/components/shared/PageTitle';
import AdBanner from '@/components/shared/AdBanner';
import type { GalleryItem } from '@/lib/types';
import { supabase } from '@/lib/supabase-client'; // Usamos el cliente para que sea más rápido
import GalleryClient from '@/components/client/GalleryClient';

export const revalidate = 60; // Revalidar la página cada 60 segundos

// Función para obtener todas las imágenes
async function getGalleryItems(): Promise<GalleryItem[]> {
  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as GalleryItem[];
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    return [];
  }
}

// Función para obtener todas las etiquetas únicas
async function getUniqueTags(): Promise<string[]> {
   try {
    // Llamamos a una función de base de datos 'get_unique_tags' que debemos crear
    const { data, error } = await supabase.rpc('get_unique_tags');
    if (error) throw error;
    return data || [];
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
      {/* Usamos el nuevo componente de cliente */}
      <GalleryClient items={items} tags={tags} />
      <AdBanner />
    </>
  );
}
