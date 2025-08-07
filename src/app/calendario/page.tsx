
import { getEvents } from '@/lib/data'; // Usamos la función global
import Section from '@/components/shared/Section';
import PageTitle from '@/components/shared/PageTitle';
import AdBanner from '@/components/shared/AdBanner';
import RaceCard from '@/components/shared/RaceCard';
import { RaceEvent } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

// La función local ya no es necesaria, la hemos centralizado en data.ts

export default async function CalendarioPage() {
  noStore(); // Nos aseguramos de que esta página siempre sea dinámica
  const events: RaceEvent[] = await getEvents();
  
  return (
    <>
      <PageTitle title="Calendario de Carreras" subtitle={new Date().getFullYear().toString()} />
      <Section className="py-8 md:py-12">
        <div className="space-y-6 md:space-y-8">
          {events.map(race => (
            <RaceCard key={race.id} race={race} />
          ))}
        </div>
        {events.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold">El calendario de carreras se publicará pronto.</h3>
            <p className="text-muted-foreground mt-2">
              No hay eventos programados o estamos actualizando la información. ¡Vuelve a visitarnos!
            </p>
          </div>
        )}
      </Section>
      <AdBanner />
    </>
  );
}
