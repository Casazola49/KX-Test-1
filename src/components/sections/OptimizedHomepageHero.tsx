'use client';

import { useState, useEffect, useMemo } from 'react';
import CountdownTimer from '@/components/shared/CountdownTimer';
import { Event } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { COLLECTIONS } from '@/lib/firebase-collections';
import { ChevronDown, Trophy, Flag, Zap } from 'lucide-react';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';

interface OptimizedHomepageHeroProps {
  events: Event[];
  nextRace?: Event;
}

// Componente de efectos visuales optimizado basado en rendimiento
const OptimizedVisualEffects = ({ shouldShowEffects }: { shouldShowEffects: boolean }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Gradiente de fondo - siempre visible */}
    <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/60 dark:from-black/30 dark:via-black/50 dark:to-black/70" />
    
    {/* Efectos adicionales solo en dispositivos de alto rendimiento */}
    {shouldShowEffects && (
      <>
        <div className="absolute top-20 left-10 w-16 h-16 border-2 border-primary/30 rotate-45 animate-spin-slow" />
        <div className="absolute bottom-20 right-10 w-20 h-20 border border-primary/20 rounded-full animate-pulse" />
        <div className="absolute top-1/3 left-0 w-32 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-slide-right" />
        <div className="absolute top-2/3 right-0 w-40 h-0.5 bg-gradient-to-l from-transparent via-primary/30 to-transparent animate-slide-left" />
      </>
    )}
  </div>
);

export default function OptimizedHomepageHero({ events, nextRace }: OptimizedHomepageHeroProps) {
  const [liveRace, setLiveRace] = useState<Event | undefined>(undefined);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Usar hooks de optimización de rendimiento
  const { shouldShowComplexEffects, getAnimationConfig } = usePerformanceOptimization();

  // Memoizar la lógica de carrera actual para evitar recálculos
  const currentRace = useMemo(() => {
    if (!events || events.length === 0) return null;
    
    const now = new Date();
    return events.find(e => {
      const raceTime = new Date(e.date).getTime();
      const raceDuration = 3 * 60 * 60 * 1000; // 3 horas
      return now.getTime() >= raceTime && now.getTime() <= raceTime + raceDuration;
    });
  }, [events]);

  useEffect(() => {
    let isMounted = true;

    const checkLiveStatus = async () => {
      if (!currentRace) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const liveStreamRef = doc(db, COLLECTIONS.LIVE_STREAMS, currentRace.id);
        const liveStreamSnap = await getDoc(liveStreamRef);

        if (isMounted) {
          if (liveStreamSnap.exists() && liveStreamSnap.data()?.is_live) {
            setIsLiveStreamActive(true);
            setLiveRace(currentRace);
          } else {
            setIsLiveStreamActive(false);
            setLiveRace(undefined);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking live status:", error);
        if (isMounted) {
          setIsLiveStreamActive(false);
          setLiveRace(undefined);
          setIsLoading(false);
        }
      }
    };

    checkLiveStatus();

    return () => {
      isMounted = false;
    };
  }, [currentRace]);

  const isNextRaceDateValid = nextRace && !isNaN(new Date(nextRace.date).getTime());

  if (isLoading) {
    return (
      <section className="relative h-screen flex items-center justify-center overflow-hidden hero-geometric-bg">
        <div className="animate-spin w-12 h-12 border-2 border-primary border-t-transparent rounded-full"></div>
      </section>
    );
  }

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden hero-geometric-bg">
      {/* Fondo geométrico simplificado */}
      <div className="absolute inset-0 hero-geometric-pattern" />
      
      {/* Efectos visuales optimizados */}
      <OptimizedVisualEffects shouldShowEffects={shouldShowComplexEffects()} />
      
      {/* Contenido principal */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4 flex flex-col justify-center min-h-screen py-16">
        {liveRace && isLiveStreamActive ? (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-500 font-bold text-lg uppercase tracking-wider">EN VIVO</span>
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-6xl font-f1-bold text-primary mb-4">
              {liveRace.name}
            </h1>
            <p className="text-xl text-muted-foreground">
              Carrera en vivo ahora
            </p>
          </div>
        ) : isNextRaceDateValid ? (
          <div className="animate-fade-in-up">
            {/* Título principal optimizado */}
            <div className="mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Trophy className="w-8 h-8 text-primary animate-bounce-slow" />
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-f1-bold text-primary neon-text-main uppercase tracking-wider">
                  Próxima Carrera
                </h1>
                <Flag className="w-8 h-8 text-primary animate-bounce-slow" />
              </div>
              
              <h2 className="text-lg md:text-3xl lg:text-4xl font-f1-wide text-foreground mb-6 animate-pulse-text">
                {nextRace.name}
              </h2>
            </div>

            {/* Contador optimizado */}
            <div className="mb-12">
              <CountdownTimer date={nextRace.date} />
            </div>

            {/* Información simplificada */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-all duration-300">
                <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-f1-bold text-lg mb-2">VELOCIDAD</h3>
                <p className="text-muted-foreground text-sm">Adrenalina pura</p>
              </div>
              
              <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-all duration-300">
                <Trophy className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-f1-bold text-lg mb-2">COMPETENCIA</h3>
                <p className="text-muted-foreground text-sm">Los mejores pilotos</p>
              </div>
              
              <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg p-6 hover:border-primary/40 transition-all duration-300">
                <Flag className="w-8 h-8 text-primary mx-auto mb-3" />
                <h3 className="font-f1-bold text-lg mb-2">EMOCIÓN</h3>
                <p className="text-muted-foreground text-sm">Vive la experiencia</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-f1-bold text-foreground mb-6">
              No hay próximas carreras programadas
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Mantente atento para las próximas competencias
            </p>
          </div>
        )}

        {/* Indicador de scroll */}
        <div className="hidden md:block absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-primary/60" />
        </div>
      </div>
    </section>
  );
}