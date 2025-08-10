
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import type { Event, Podium } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Section from '@/components/shared/Section';
import CountdownTimer from '@/components/shared/CountdownTimer';
import { Calendar, MapPin, ArrowLeft } from 'lucide-react';
import AdBanner from '@/components/shared/AdBanner';
import EventPodiumResults from '@/components/client/EventPodiumResults';
import EventGallery from '@/components/client/EventGallery';
import { unstable_noStore as noStore } from 'next/cache';

// --- TIPO DE DATO COMPLETO ---
type FullEvent = Event & {
  track: { name: string; location: string } | null;
  podiums: Podium[];
};

// --- CONSULTA COMPLETA A LA BASE DE DATOS (ACTUALIZADA) ---
async function getEventDetails(id: string): Promise<FullEvent | null> {
  noStore();
  const supabase = createClient();
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      track:tracks(name, location),
      podiums:podiums(
        *,
        category:categories(name),
        results:podium_results(
          *,
          pilot:pilots(firstName, lastName, teamName, teamColor, number, imageUrl)
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching full event details for id ${id}:`, error);
    return null;
  }
  
  return data as FullEvent;
}

// --- COMPONENTE DE LA PÁGINA FINAL ---
export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const event = await getEventDetails(params.id);

  if (!event) {
    notFound();
  }
  
  // Soportar tanto event_date (BD) como date (tipo Event unificado)
  const eventDate = new Date((event as any).event_date ?? (event as any).date);
  const isPast = eventDate < new Date();

  const formattedDate = eventDate.toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  
  const trackName = event.track?.name || 'Pista no especificada';
  const location = event.track?.location || 'Ubicación no especificada';

  return (
    <>
      <div className="relative h-64 md:h-80 w-full mb-8">
        <Image 
          src={(event as any).promotional_image_url || (event as any).promotionalImageUrl || 'https://placehold.co/1200x400.png'} 
          alt={`Promoción para ${event.name}`}
          fill
          style={{objectFit:"cover"}}
          className="opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 container mx-auto text-center">
           <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-headline text-foreground">{event.name}</h1>
        </div>
      </div>

      <Section className="py-8 md:py-12">
        <div className="mb-8">
            <Button variant="outline" asChild>
                <Link href="/calendario">
                <ArrowLeft size={16} className="mr-2" />
                Volver al Calendario
                </Link>
            </Button>
        </div>
        
        <Card className="max-w-4xl mx-auto shadow-xl border-border/50">
            <CardHeader>
                <CardTitle className="text-2xl">Detalles del Evento</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg p-6">
                <div className="flex items-center gap-3">
                    <Calendar className="text-primary" size={24} /> 
                    <div>
                        <span className="font-semibold block">Fecha y Hora:</span> 
                        <span className="text-muted-foreground">{formattedDate}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <MapPin className="text-primary" size={24} /> 
                    <div>
                        <span className="font-semibold block">Lugar:</span> 
                        <span className="text-muted-foreground">{trackName}, {location}</span>
                    </div>
                </div>
                {(event as any).description && (
                    <div className="md:col-span-2 mt-4 pt-4 border-t border-border/50 text-base">
                        <p className="text-muted-foreground whitespace-pre-line">{(event as any).description}</p>
                    </div>
                )}
            </CardContent>
        </Card>

        {/* --- LÓGICA CONDICIONAL --- */}
        {isPast ? (
            <div className="mt-12 space-y-12">
                <EventPodiumResults podiums={event.podiums} />
                <EventGallery imageUrls={(event as any).gallery_image_urls || (event as any).galleryImageUrls || []} />
            </div>
        ) : (
            <div className="mt-12 text-center">
                 <h2 className="text-3xl font-bold font-headline mb-6 text-primary">¡La Carrera Comienza Pronto!</h2>
                 <CountdownTimer date={(event as any).event_date ?? (event as any).date} />
            </div>
        )}

      </Section>
      <AdBanner />
    </>
  );
}
