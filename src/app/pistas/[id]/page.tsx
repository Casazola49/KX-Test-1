
import type { TrackInfo, RaceEvent } from '@/lib/types';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CalendarDays, CheckCircle, ListChecks, MapPin, Mountain, Ruler, TrendingUp, Trophy, Zap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ModelViewer from '@/components/client/ModelViewer';
import ImageGallery from '@/components/client/ImageGallery'; // Importamos el nuevo componente

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getTrackDetails(id: string): Promise<{ track: TrackInfo | null, events: RaceEvent[] }> {
    const { data: track, error: trackError } = await supabase
        .from('tracks')
        .select('*')
        .eq('id', id)
        .single();
    
    if (trackError) console.error("Error fetching track:", trackError);

    let events: RaceEvent[] = [];
    if (track) {
      const { data: eventData, error: eventError } = await supabase
        .from('raceevents')
        .select('*')
        .eq('trackName', track.name)
        .order('date', { ascending: false });

      if (eventError) console.error("Error fetching events:", eventError);
      else events = eventData.map(e => ({...e, date: new Date(e.date)})) as RaceEvent[];
    }

    return { track: track as TrackInfo | null, events };
}

const DetailItem: React.FC<{ icon: React.ElementType, label: string, value?: string | number | null }> = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start text-sm p-3 bg-muted/50 rounded-lg">
      <Icon size={20} className="mr-3 mt-0.5 text-primary flex-shrink-0" />
      <div>
        <span className="font-semibold text-foreground/90">{label}</span>
        <p className="text-muted-foreground">{value}</p>
      </div>
    </div>
  );
};

// El componente de galería anterior se ha movido a su propio archivo (ImageGallery.tsx)
// y ya no es necesario aquí.

export default async function PistaDetailPage({ params }: { params: { id: string } }) {
  const { track, events } = await getTrackDetails(params.id);

  if (!track) {
    notFound();
  }

  return (
    <>
      <div className="relative h-64 md:h-80 w-full mb-8">
        <Image
          src={(track as any).image_url || (track as any).imageUrl || 'https://placehold.co/1200x400.png'}
          alt={`Vista panorámica de ${track.name}`}
          fill
          objectFit="cover"
          className="opacity-30"
          data-ai-hint="karting track panoramic"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 container mx-auto">
           <PageTitle title={track.name} subtitle={track.location || "Detalles de la Pista"} className="py-0 text-left" />
        </div>
      </div>

      <Section className="py-8 md:py-12">
        <div className="mb-8">
          <Button variant="outline" asChild>
            <Link href="/pistas">
              <ArrowLeft size={16} className="mr-2" />
              Volver a Todas las Pistas
            </Link>
          </Button>
        </div>
        
        <Card className="shadow-xl">
            <CardContent className="p-6">
                 {track.description && <p className="text-muted-foreground text-base mb-6">{track.description}</p>}
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <DetailItem icon={Ruler} label="Longitud" value={track.length} />
                    <DetailItem icon={Ruler} label="Ancho" value={track.width} />
                    <DetailItem icon={TrendingUp} label="Curvas" value={track.curves?.toString()} />
                    <DetailItem icon={Mountain} label="Altitud" value={track.altitude} />
                    <DetailItem icon={Zap} label="Récord de Pista" value={track.record} />
                    <DetailItem icon={Zap} label="Velocidad Máx." value={track.max_speed} />
                 </div>
                 {track.infrastructure && track.infrastructure.length > 0 && (
                    <div className="pt-4 mt-4 border-t border-border/50">
                        <h4 className="text-lg font-semibold text-foreground/90 mb-2 flex items-center">
                            <ListChecks size={20} className="mr-2 text-primary" />Infraestructura:
                        </h4>
                        <ul className="columns-2 md:columns-3 text-muted-foreground space-y-1">
                            {track.infrastructure.map((item, index) => (
                            <li key={index} className="flex items-center"><CheckCircle size={12} className="mr-2 text-green-500" />{item}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
        
        {/* ---- MODIFICACIÓN ---- */}
        {/* Usamos el nuevo componente de galería interactivo */}
        <ImageGallery images={(track as any).gallery_image_urls || (track as any).galleryImageUrls || []} altText={`Galería de la pista ${track.name}`} />

        {((track as any).model_3d_url || (track as any).model3dUrl) && (
            <div className="mt-8 md:mt-12">
                <ModelViewer modelUrl={(track as any).model_3d_url || (track as any).model3dUrl} />
            </div>
        )}
        
        <div className="mt-8 md:mt-12">
            <h2 className="text-3xl font-bold font-headline mb-6 text-center text-primary">Historial de Eventos</h2>
            {events.length > 0 ? (
                <div className="space-y-4 max-w-2xl mx-auto">
                    {events.map(event => (
                        <Card key={event.id} className="shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-xl">{event.name}</CardTitle>
                                    <span className="text-xs text-muted-foreground flex items-center">
                                        <CheckCircle className="mr-1.5 h-3 w-3 text-green-500" />
                                        Finalizado
                                    </span>
                                </div>
                                <CardDescription className="flex items-center text-sm pt-1">
                                    <CalendarDays size={14} className="mr-2"/>
                                    {new Date(event.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild variant="link" className="p-0">
                                    <Link href={`/calendario#${event.id}`}>
                                        Ver Resultados del Evento
                                        <Trophy className="ml-2 h-4 w-4"/>
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground mt-4">No hay historial de eventos registrados para esta pista.</p>
            )}
        </div>
      </Section>
    </>
  );
}
