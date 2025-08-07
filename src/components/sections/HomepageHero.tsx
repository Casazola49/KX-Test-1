
'use client';

import { useState, useEffect } from 'react';
import LiveRacePlaceholder from '@/components/sections/LiveRacePlaceholder';
import CountdownTimer from '@/components/shared/CountdownTimer';
import { Event } from '@/lib/types';
import { supabase } from '@/lib/supabase-client';

interface HomepageHeroProps {
  events: Event[];
}

export default function HomepageHero({ events }: HomepageHeroProps) {
  const [liveRace, setLiveRace] = useState<Event | undefined>(undefined);
  const [nextRace, setNextRace] = useState<Event | undefined>(undefined);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(false);

  useEffect(() => {
    if (!events || events.length === 0) return;

    // Lógica para carrera en vivo (la dejamos por si se implementa en el futuro)
    const checkLiveStatus = async (currentRace: Event) => {
        try {
            const { data, error } = await supabase
                .from('live_streams')
                .select('is_live')
                .eq('event_id', currentRace.id)
                .single();

            if (data?.is_live) {
                setIsLiveStreamActive(true);
                setLiveRace(currentRace);
                setNextRace(undefined); // Limpiamos la próxima carrera si hay una en vivo
            } else {
                 // Si no está en vivo, buscamos la próxima carrera
                findNextRace();
            }
        } catch (error) {
            console.error("Error checking live status, defaulting to next race.", error);
            findNextRace();
        }
    };
    
    // Función para encontrar la próxima carrera
    const findNextRace = () => {
        const now = new Date();
        const upcomingRace = events.find(e => new Date(e.date).getTime() > now.getTime());
        setNextRace(upcomingRace);
        setLiveRace(undefined);
        setIsLiveStreamActive(false);
    };

    // Suponemos que la carrera actual es la que está dentro de un margen de tiempo
    const now = new Date();
    const currentRace = events.find(e => {
        const raceTime = new Date(e.date).getTime();
        const raceDuration = 3 * 60 * 60 * 1000; // 3 horas
        return now.getTime() >= raceTime && now.getTime() <= raceTime + raceDuration;
    });

    if (currentRace) {
        checkLiveStatus(currentRace);
    } else {
        findNextRace();
    }

  }, [events]);

  const isNextRaceDateValid = nextRace && !isNaN(new Date(nextRace.date).getTime());

  return (
    <section className="relative h-screen bg-gray-900 flex items-center justify-center pattern-bg">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative z-10 text-center">
        {liveRace && isLiveStreamActive ? (
          <LiveRacePlaceholder raceName={liveRace.name} />
        ) : isNextRaceDateValid ? (
          <>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Próxima Carrera: {nextRace.name}</h1>
            <CountdownTimer date={nextRace.date} />
          </>
        ) : (
          <h1 className="text-4xl md:text-6xl font-bold">No hay próximas carreras programadas</h1>
        )}
      </div>
    </section>
  );
}
