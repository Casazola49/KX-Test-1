
import CountdownTimer from '@/components/shared/CountdownTimer';
import { MOCK_NEXT_RACE } from '@/lib/constants'; // Keep for fallback
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { RaceEvent } from '@/lib/types';

interface HeroSectionProps {
  nextRace: RaceEvent | null;
}

const HeroSection: React.FC<HeroSectionProps> = ({ nextRace }) => {
  const raceToDisplay = nextRace || MOCK_NEXT_RACE;
  // The date from the database or mock is already a Date object
  const raceDate = nextRace ? raceToDisplay.date : new Date(raceToDisplay.date);

  return (
    <section className="relative flex flex-col items-center justify-center text-center overflow-hidden pt-2 pb-1 sm:pt-4 sm:pb-2">
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/80 to-background z-0"></div>
      
      <div 
        className="relative z-10 container mx-auto px-4 animate-in fade-in slide-in-from-bottom-10 duration-700 ease-out pb-1"
      >
        <h1 
          className="text-xs sm:text-sm md:text-lg font-headline uppercase tracking-widest text-primary mb-1 animate-text-pop-in"
          style={{ animationDelay: '0.2s', animationDuration: '0.6s' }}
        >
          Próxima Carrera: {raceToDisplay.name}
        </h1>
        <p 
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-headline text-foreground mb-1 animate-text-pop-in"
          style={{ animationDelay: '0.5s', animationDuration: '0.6s' }}
        >
          ¡La Emoción Comienza Pronto!
        </p>
        
        <div 
          className="mt-1 mb-1 animate-in fade-in zoom-in-90 duration-700 delay-300" 
        >
          {/* Pass date as serializable ISO string */}
          <CountdownTimer targetDate={raceDate.toISOString()} />
        </div>

        <div 
          className="mt-2 mb-0 animate-in fade-in zoom-in-95 duration-700"
          style={{ animationDelay: '1.2s'}}
        >
          <Button 
            asChild 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-3 text-lg font-semibold transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-primary/40 active:scale-100"
          >
            <Link href="/calendario">Ver Calendario Completo</Link>
          </Button>
        </div>

        {/* Inline Ad Banner */}
        <div 
          className="relative w-full max-w-3xl mx-auto aspect-[4/1] my-3 rounded-lg shadow-md overflow-hidden animate-in fade-in zoom-in-95 duration-700"
          style={{ animationDelay: '1.5s'}}
        >
          <Image 
            src="/publicidad/publicidad vertical.png" 
            alt="Publicidad KartXperience Bolivia"
            layout="fill"
            objectFit="cover" 
            data-ai-hint="advertisement banner"
          />
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
