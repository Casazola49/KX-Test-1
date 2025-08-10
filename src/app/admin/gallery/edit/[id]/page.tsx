
import PageTitle from '@/components/shared/PageTitle';
import GalleryItemForm from '@/components/admin/GalleryItemForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Section from '@/components/shared/Section';
import type { GalleryItem } from '@/lib/types';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { getRaceEvents } from '@/app/admin/standings/actions';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getGalleryItem(id: string): Promise<GalleryItem | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('gallery')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        
        return data as GalleryItem;

    } catch (error) {
        console.error("Error fetching gallery item for editing from Supabase:", error);
        return null;
    }
}

export default async function EditGalleryItemPage({ params }: { params: { id: string } }) {
  const item = await getGalleryItem(params.id);
  const events = await getRaceEvents();

  if (!item) {
    notFound();
  }

  return (
    <>
      <PageTitle title="Panel de Administración" subtitle="Editar Elemento de Galería" />
      <Section className="py-8 md:py-12">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle>Editando: {item.title || `Elemento ${item.id}`}</CardTitle>
          </CardHeader>
          <CardContent>
            <GalleryItemForm item={item} events={events} />
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
