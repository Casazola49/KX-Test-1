import { getEvents } from '@/lib/data'; // Usamos la función global
import Section from '@/components/shared/Section';
import PageTitle from '@/components/shared/PageTitle';
import HorizontalAd from '@/components/shared/HorizontalAd';
import RaceCard from '@/components/shared/RaceCard';
import { RaceEvent } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

// La función local ya no es necesaria, la hemos centralizado en data.ts

export default async function EventosPage() {
  noStore(); // Nos aseguramos de que esta página siempre sea dinámica
  const events: RaceEvent[] = await getEvents();
  
  return (
    <>
      <PageTitle title="Eventos de Carreras" subtitle={new Date().getFullYear().toString()} />
      <Section className="py-8 md:py-12">
        <div className="space-y-6 md:space-y-8">
          {events.map(race => (
            <RaceCard key={race.id} race={race} />
          ))}
        </div>
        {events.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-2xl font-semibold">Los eventos de carreras se publicarán pronto.</h3>
            <p className="text-muted-foreground mt-2">
              No hay eventos programados o estamos actualizando la información. ¡Vuelve a visitarnos!
            </p>
          </div>
        )}
      </Section>
      <HorizontalAd section="eventos" />
    </>
  );
}