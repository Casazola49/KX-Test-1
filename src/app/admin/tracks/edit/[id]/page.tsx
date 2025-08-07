
import PageTitle from '@/components/shared/PageTitle';
import TrackForm from '@/components/admin/track/TrackForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Section from '@/components/shared/Section';
import type { TrackInfo } from '@/lib/types';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

// Usamos la clave de servicio para obtener los datos, ya que es una página de admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getTrack(id: string): Promise<TrackInfo | null> {
    try {
        const { data, error } = await supabaseAdmin
            .from('tracks')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error("Error fetching track for editing:", error);
            return null;
        }
        
        return {
            ...data,
            gallery_image_urls: data.gallery_image_urls || [],
            infrastructure: data.infrastructure || [],
        } as TrackInfo;
    } catch (error) {
        console.error("Error fetching track for editing:", error);
        return null;
    }
}

export default async function EditTrackPage({ params }: { params: { id: string } }) {
  const track = await getTrack(params.id);

  if (!track) {
    notFound();
  }

  return (
    <>
      <PageTitle title="Panel de Administración" subtitle="Editar Pista" />
      <Section className="py-8 md:py-12">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle>Editando: {track.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <TrackForm track={track} />
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
