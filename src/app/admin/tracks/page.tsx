
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import type { TrackInfo } from '@/lib/types';
import TrackListClient from '@/components/admin/TrackListClient';
import { getAllTracks } from '@/lib/data-service';

async function getTracks() {
  try {
    const tracks = await getAllTracks();
    return (tracks as Partial<TrackInfo>[]) || [];
  } catch (error) {
    console.error("Error fetching tracks for admin from Firebase:", error);
    return [];
  }
}

export default async function TracksAdminPage() {
    const tracks = await getTracks();

    return (
        <>
            <PageTitle title="Panel de Administración" subtitle="Gestionar Pistas" />
            <Section>
                <TrackListClient tracks={tracks} />
            </Section>
        </>
    );
}
