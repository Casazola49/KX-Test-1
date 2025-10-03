

import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import TrackInfoCard from '@/components/shared/TrackInfoCard';
import HorizontalAd from '@/components/shared/HorizontalAd';
import type { TrackInfo } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { AlertTriangle, ServerCrash } from 'lucide-react';
import { getAllTracks } from '@/lib/data-service';

export const dynamic = 'force-dynamic';

async function getTracksFromFirebase(): Promise<{ tracks: TrackInfo[]; error: string | null }> {
    try {
        const tracks = await getAllTracks();
        return { tracks, error: null };
    } catch (e: any) {
        console.error("Critical error fetching tracks from Firebase:", e);
        return { 
            tracks: [], 
            error: `Ocurrió un error al conectar con Firebase: ${e.message}. ` +
                   "Verifica la configuración de Firebase y que la colección 'tracks' exista."
        };
    }
}

export default async function PistasPage() {
  
  const { tracks, error } = await getTracksFromFirebase();

  const renderContent = () => {
    if (error) {
      return (
        <Card className="text-center p-6 md:p-8 bg-destructive/10 border-destructive rounded-lg">
          <ServerCrash className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-4 text-destructive-foreground">¡Error al Cargar Pistas!</h2>
          <p className="text-destructive-foreground/90 text-sm mb-4 whitespace-pre-wrap">
            {error}
          </p>
        </Card>
      );
    }

    if (tracks.length > 0) {
      return (
        <div className="space-y-8 md:space-y-12">
          {tracks.map((track) => (
            <TrackInfoCard key={track.id} track={track} />
          ))}
        </div>
      );
    }

    return (
      <Card className="text-center p-6 md:p-8 bg-card rounded-lg">
        <AlertTriangle className="mx-auto h-12 w-12 text-primary mb-4" />
        <h2 className="text-xl font-bold mb-4">
          No hay pistas registradas
        </h2>
        <div className="text-left max-w-2xl mx-auto space-y-3 p-4 rounded-md border border-amber-500/50 bg-amber-500/10">
            <p className="font-semibold text-amber-400">Pistas no encontradas.</p>
            <p className="text-amber-400/90 text-sm">
                La conexión a Firebase funciona, pero no hay pistas registradas.
                Puedes añadir pistas desde el panel de administración.
            </p>
        </div>
      </Card>
    );
  };

  return (
    <>
      <PageTitle title="Nuestras Pistas" subtitle="Conoce los Circuitos" />
      <Section className="py-8 md:py-12">
        {renderContent()}
      </Section>
      <HorizontalAd section="pistas" />
    </>
  );
}
