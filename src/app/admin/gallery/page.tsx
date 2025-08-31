
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import type { GalleryItem } from '@/lib/types';
import GalleryListClient from '@/components/admin/GalleryListClient';
import { getAllGalleryItems } from '@/lib/data-service';

async function getGalleryItems() {
  try {
    const items = await getAllGalleryItems();
    return items as GalleryItem[];
  } catch (error) {
    console.error("Error fetching gallery items for admin from Firebase:", error);
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
