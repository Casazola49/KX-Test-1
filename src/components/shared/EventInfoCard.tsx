import { Event } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

interface EventInfoCardProps {
  event: Event;
}

export default function EventInfoCard({ event }: EventInfoCardProps) {
  const eventDate = new Date(event.date);
  
  return (
    <Card className="bg-background/40 border-border/50 h-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Información del Evento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Fecha y Hora</p>
              <p className="text-sm text-muted-foreground">
                {eventDate.toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric'
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                {eventDate.toLocaleTimeString('es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Ubicación</p>
              <p className="text-sm text-muted-foreground">{event.trackName}</p>
              {event.track?.location && (
                <p className="text-xs text-muted-foreground">{event.track.location}</p>
              )}
            </div>
          </div>

          {event.promotionalImageUrl && (
            <div className="mt-4">
              <img 
                src={event.promotionalImageUrl} 
                alt={`Imagen promocional de ${event.name}`}
                className="w-full h-auto object-contain rounded-lg border border-border/20 bg-background/10"
              />
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-border/30">
            <Link href="/calendario">
              <Button variant="outline" className="w-full">
                <Calendar className="mr-2 h-4 w-4" />
                Ver Calendario Completo
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}