
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import type { GalleryItem } from '@/lib/types';
import GalleryListClient from '@/components/admin/GalleryListClient';
import { createClient } from '@supabase/supabase-js';

// Usamos la clave de servicio para tener acceso garantizado en el entorno de admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getGalleryItems() {
  try {
    const { data, error } = await supabaseAdmin
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data as GalleryItem[];
  } catch (error) {
    console.error("Error fetching gallery items for admin from Supabase:", error);
    return [];
  }
}

export default async function GalleryAdminPage() {
    const items = await getGalleryItems();

    return (
        <>
            <PageTitle title="Panel de Administración" subtitle="Gestionar Galería" />
            <Section>
                <GalleryListClient items={items} />
            </Section>
        </>
    )
}
