import CountdownTimer from '@/components/shared/CountdownTimer';
import EventInfoCard from '@/components/shared/EventInfoCard';
import { Event } from '@/lib/types';
import Section from '@/components/shared/Section';

interface OptimizedNextRaceSectionProps {
  event: Event;
}

export default function OptimizedNextRaceSection({ event }: OptimizedNextRaceSectionProps) {
  return (
    <Section title="Próximo Evento">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Información del evento */}
        <div className="order-2 lg:order-1">
          <EventInfoCard event={event} />
        </div>
        
        {/* Contador y título */}
        <div className="text-center order-1 lg:order-2">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-primary">
            {event.name}
          </h3>
          <CountdownTimer date={event.date} />
        </div>
      </div>
    </Section>
  );
}