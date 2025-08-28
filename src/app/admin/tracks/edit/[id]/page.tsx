
import PageTitle from '@/components/shared/PageTitle';
import TrackForm from '@/components/admin/track/TrackForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Section from '@/components/shared/Section';
import type { TrackInfo } from '@/lib/types';
import { notFound } from 'next/navigation';
import { getTrackById } from '@/lib/data-service';

async function getTrack(id: string): Promise<TrackInfo | null> {
    try {
        const track = await getTrackById(id);
        
        if (!track) {
            console.error("Track not found:", id);
            return null;
        }
        
        return {
            ...track,
            gallery_image_urls: track.gallery_image_urls || [],
            infrastructure: track.infrastructure || [],
        } as TrackInfo;
    } catch (error) {
        console.error("Error fetching track for editing from Firebase:", error);
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
