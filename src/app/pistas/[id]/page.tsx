
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
    console.log('🔍 Buscando pista con ID:', id);
    
    const { data: track, error: trackError } = await supabase
        .from('tracks')
        .select('*')
        .eq('id', id)
        .single();
    
    if (trackError) {
        console.error("❌ Error fetching track:", trackError);
        return { track: null, events: [] };
    }

    console.log('✅ Pista encontrada:', track?.name);

    let events: RaceEvent[] = [];
    if (track) {
      console.log('🔍 Buscando eventos para track_id:', id);
      
      // Buscar eventos por track_id
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('track_id', id)
        .order('event_date', { ascending: false });

      if (eventError) {
        console.error("❌ Error fetching events:", eventError);
      } else {
        console.log('📊 Eventos encontrados:', eventData?.length || 0);
        console.log('📋 Datos de eventos:', eventData);
        
        if (eventData && eventData.length > 0) {
          events = eventData.map(e => ({
            id: e.id,
            name: e.name,
            date: e.event_date, // Usar event_date en lugar de date
            trackName: track.name,
            track: track
          })) as RaceEvent[];
          
          console.log('✅ Eventos procesados:', events.map(e => ({ name: e.name, date: e.date })));
        }
      }
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
                <div className="space-y-4 max-w-4xl mx-auto">
                    <div className="text-center mb-6">
                        <p className="text-muted-foreground">
                            Se han realizado <span className="font-semibold text-primary">{events.length}</span> evento{events.length !== 1 ? 's' : ''} en esta pista
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {events.map(event => {
                            const eventDate = new Date(event.date);
                            const isUpcoming = eventDate > new Date();
                            
                            return (
                                <Card key={event.id} className="shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="text-lg leading-tight pr-2">{event.name}</CardTitle>
                                            <span className={`text-xs px-2 py-1 rounded-full flex items-center whitespace-nowrap ${
                                                isUpcoming 
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                                                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                            }`}>
                                                {isUpcoming ? (
                                                    <>
                                                        <CalendarDays className="mr-1 h-3 w-3" />
                                                        Próximo
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                        Finalizado
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                        <CardDescription className="flex items-center text-sm">
                                            <CalendarDays size={14} className="mr-2 flex-shrink-0"/>
                                            <span>
                                                {eventDate.toLocaleDateString('es-ES', { 
                                                    weekday: 'long',
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}
                                            </span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="flex justify-between items-center">
                                            <Button asChild variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground">
                                                <Link href={`/calendario/${event.id}`}>
                                                    <Trophy className="mr-2 h-4 w-4"/>
                                                    {isUpcoming ? 'Ver Detalles' : 'Ver Resultados'}
                                                </Link>
                                            </Button>
                                            <div className="text-xs text-muted-foreground">
                                                {isUpcoming 
                                                    ? `En ${Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días`
                                                    : `Hace ${Math.floor((new Date().getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24))} días`
                                                }
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-6xl mb-4">🏁</div>
                    <h3 className="text-xl font-semibold mb-2">Sin eventos registrados</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Aún no se han registrado eventos para esta pista. 
                        Los eventos aparecerán aquí una vez que se agreguen desde el panel de administración.
                    </p>
                </div>
            )}
        </div>
      </Section>
    </>
  );
}
