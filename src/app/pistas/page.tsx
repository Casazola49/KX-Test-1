

import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import TrackInfoCard from '@/components/shared/TrackInfoCard';
import AdBanner from '@/components/shared/AdBanner';
import type { TrackInfo } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { AlertTriangle, ServerCrash } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getTracksFromSupabase(): Promise<{ tracks: TrackInfo[]; error: string | null }> {
    try {
        const { data, error } = await supabase
            .from('tracks')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error("Error fetching tracks from Supabase:", error);
            throw error;
        }

        return { tracks: data as TrackInfo[], error: null };

    } catch (e: any) {
        console.error("Critical error fetching tracks:", e);
        return { 
            tracks: [], 
            error: `Ocurrió un error al conectar con Supabase: ${e.message}. ` +
                   "Asegúrate de que las variables de entorno NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY estén configuradas y que la tabla 'tracks' y sus políticas de acceso existan."
        };
    }
}

export default async function PistasPage() {
  
  const { tracks, error } = await getTracksFromSupabase();

  const renderContent = () => {
    if (error) {
      return (
        <Card className="text-center p-6 md:p-8 bg-destructive/10 border-destructive rounded-lg">
          <ServerCrash className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-4 text-destructive-foreground">¡Error Crítico al Cargar Pistas!</h2>
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
                Tu conexión a Supabase funciona, pero la tabla 'tracks' está vacía.
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
      <AdBanner />
    </>
  );
}
