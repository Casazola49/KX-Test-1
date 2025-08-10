
import CountdownTimer from '@/components/shared/CountdownTimer';
import EventInfoCard from '@/components/shared/EventInfoCard';
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
          {/* Mostramos la tarjeta del evento con toda su información */}
          <EventInfoCard event={event} />
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-6">{event.name}</h3>
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
