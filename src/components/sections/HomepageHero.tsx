
'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import LiveRacePlaceholder from '@/components/sections/LiveRacePlaceholder';
import CountdownTimer from '@/components/shared/CountdownTimer';
import HeroStats from '@/components/sections/HeroStats';
import HeroCTA from '@/components/sections/HeroCTA';
import { Event } from '@/lib/types';
import { supabase } from '@/lib/supabase-client';
import { ChevronDown, Zap, Trophy, Flag } from 'lucide-react';

// Lazy load componentes pesados
const ParticleField = lazy(() => import('@/components/effects/ParticleField'));
const SpeedIndicator = lazy(() => import('@/components/effects/SpeedIndicator'));

interface HomepageHeroProps {
  events: Event[];
}

// Componente de partículas flotantes optimizado
const FloatingParticles = () => {
  const [particleCount, setParticleCount] = useState(20);
  
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      setParticleCount(0);
    } else if (isMobile) {
      setParticleCount(8); // Menos partículas en móviles
    } else {
      setParticleCount(15); // Reducido de 20 a 15 para mejor rendimiento
    }
  }, []);

  if (particleCount === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(particleCount)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-primary/20 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${4 + Math.random() * 3}s` // Duración más consistente
          }}
        />
      ))}
    </div>
  );
};

// Componente de elementos decorativos
const DecorativeElements = () => {
  return (
    <>
      {/* Elementos geométricos animados */}
      <div className="absolute top-20 left-10 w-16 h-16 border-2 border-primary/30 rotate-45 animate-spin-slow" />
      <div className="absolute top-40 right-20 w-12 h-12 bg-primary/10 rounded-full animate-pulse" />
      <div className="absolute bottom-40 left-20 w-8 h-8 bg-primary/20 transform rotate-45 animate-bounce-slow" />
      <div className="absolute bottom-20 right-10 w-20 h-20 border border-primary/20 rounded-full animate-pulse" />
      
      {/* Líneas de velocidad */}
      <div className="absolute top-1/3 left-0 w-32 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-slide-right" />
      <div className="absolute top-2/3 right-0 w-40 h-0.5 bg-gradient-to-l from-transparent via-primary/30 to-transparent animate-slide-left" />
    </>
  );
};

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
    
    // Función para encontrar la próxima carrera - SINCRONIZADA con la página principal
    const findNextRace = () => {
        const now = new Date();
        const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const upcomingRace = sortedEvents.find(e => new Date(e.date) > now);
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
    <section className="relative h-screen flex items-center justify-center overflow-hidden hero-geometric-bg">
      {/* Fondo geométrico con relieve */}
      <div className="absolute inset-0 hero-geometric-pattern" />
      
      {/* Campo de partículas avanzado - Solo en desktop */}
      <Suspense fallback={null}>
        <ParticleField />
      </Suspense>
      
      {/* Overlay con gradiente */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/40 to-background/60 dark:from-black/30 dark:via-black/50 dark:to-black/70" />
      
      {/* Partículas flotantes adicionales */}
      <FloatingParticles />
      
      {/* Elementos decorativos */}
      <DecorativeElements />
      
      {/* Indicador de velocidad - Solo en desktop */}
      <Suspense fallback={null}>
        <SpeedIndicator />
      </Suspense>
      
      {/* Contenido principal */}
      <div className="relative z-10 text-center max-w-6xl mx-auto px-4 flex flex-col justify-center min-h-screen py-20 hero-content-landscape hero-content-mobile">
        {liveRace && isLiveStreamActive ? (
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-500 font-bold text-lg uppercase tracking-wider">EN VIVO</span>
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
            </div>
            <LiveRacePlaceholder raceName={liveRace.name} />
          </div>
        ) : isNextRaceDateValid ? (
          <div className="animate-fade-in-up">
            {/* Título principal con efectos - Optimizado para móviles */}
            <div className="mb-6 md:mb-8">
              <div className="flex items-center justify-center gap-2 md:gap-4 mb-3 md:mb-4">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-primary animate-bounce-slow" />
                <h1 className="hero-title-mobile text-lg md:text-4xl lg:text-5xl font-f1-bold text-primary neon-text-main uppercase tracking-wider mobile-text-contrast">
                  Próxima Carrera
                </h1>
                <Flag className="w-6 h-6 md:w-8 md:h-8 text-primary animate-bounce-slow" />
              </div>
              
              <h2 className="race-title-mobile text-sm sm:text-lg md:text-3xl lg:text-5xl font-f1-wide text-foreground mb-4 md:mb-6 animate-pulse-text mobile-text-shadow mobile-bg-contrast">
                {nextRace.name}
              </h2>
            </div>

            {/* Contador principal - Optimizado para móviles */}
            <div className="mb-6 md:mb-12 px-1 sm:px-2 md:px-4">
              <div className="w-full max-w-full mx-auto overflow-hidden">
                <CountdownTimer date={nextRace.date} />
              </div>
            </div>

            {/* Elementos informativos adicionales - Mejor en móviles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg p-4 md:p-6 hover:border-primary/40 transition-all duration-300 hover:scale-105">
                <Zap className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2 md:mb-3" />
                <h3 className="font-f1-bold text-sm md:text-lg mb-1 md:mb-2">VELOCIDAD</h3>
                <p className="text-muted-foreground text-xs md:text-sm">Adrenalina pura en cada curva</p>
              </div>
              
              <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg p-4 md:p-6 hover:border-primary/40 transition-all duration-300 hover:scale-105">
                <Trophy className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2 md:mb-3" />
                <h3 className="font-f1-bold text-sm md:text-lg mb-1 md:mb-2">COMPETENCIA</h3>
                <p className="text-muted-foreground text-xs md:text-sm">Los mejores pilotos de Bolivia</p>
              </div>
              
              <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg p-4 md:p-6 hover:border-primary/40 transition-all duration-300 hover:scale-105 sm:col-span-2 md:col-span-1">
                <Flag className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2 md:mb-3" />
                <h3 className="font-f1-bold text-sm md:text-lg mb-1 md:mb-2">EMOCIÓN</h3>
                <p className="text-muted-foreground text-xs md:text-sm">Vive la experiencia del karting</p>
              </div>
            </div>

            {/* Estadísticas del karting */}
            <div className="mb-6 md:mb-8">
              <HeroStats />
            </div>

            {/* Llamadas a la acción */}
            <HeroCTA />
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <h1 className="text-2xl md:text-4xl lg:text-6xl font-f1-bold text-foreground mb-4 md:mb-6">
              No hay próximas carreras programadas
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Mantente atento para las próximas competencias
            </p>
          </div>
        )}

        {/* Indicador de scroll - Solo en desktop */}
        <div className="hidden md:block absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-primary/60" />
        </div>
      </div>
    </section>
  );
}
