
import CountdownTimer from '@/components/shared/CountdownTimer';
import TrackInfoCard from '@/components/shared/TrackInfoCard';
import { Event } from '@/lib/types';
import Section from '@/components/shared/Section';

interface NextRaceSectionProps {
  event?: Event;
}

export default function NextRaceSection({ event }: NextRaceSectionProps) {
  return (
    <Section title="Próximo Evento">
      {event ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Mostramos la tarjeta de la pista solo si la información está disponible */}
          {event.track ? (
            <TrackInfoCard track={event.track} />
          ) : (
            // Mensaje alternativo si no hay datos de la pista
            <div className="flex items-center justify-center h-full bg-background/20 rounded-lg p-8">
              <p className="text-muted-foreground text-center">Información de la pista no disponible.</p>
            </div>
          )}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">{event.name}</h3>
            <p className="text-lg text-muted-foreground mb-4">{event.trackName}</p>
            <CountdownTimer date={event.date} />
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay próximos eventos programados. Vuelve a consultar más tarde.</p>
        </div>
      )}
    </Section>
  );
}
