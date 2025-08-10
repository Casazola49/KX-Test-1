
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ArrowRight, Trophy } from 'lucide-react';
import { RaceEvent } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface RaceCardProps {
  race: RaceEvent;
}

export default function RaceCard({ race }: RaceCardProps) {
  const raceDate = new Date(race.date);
  const isPast = raceDate < new Date();
  
  // Find the official podium, which has a specific type
  const officialPodium = race.podiums?.find(p => p.podium_type === 'PODIO_OFICIAL_DEFINITIVO');

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="relative h-48 md:h-full bg-black/30">
          <Image
            src={race.promotionalImageUrl || 'https://placehold.co/600x400.png'}
            alt={`Imagen del evento ${race.name}`}
            fill
            style={{ objectFit: 'contain' }}
            className="md:rounded-l-lg md:rounded-r-none"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        <div className="md:col-span-2 p-6 flex flex-col">
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <h3 className="text-2xl font-bold font-headline">{race.name}</h3>
              <Badge variant={isPast ? 'destructive' : 'default'}>
                {isPast ? 'Finalizado' : 'Próximo'}
              </Badge>
            </div>
            <div className="flex items-center text-muted-foreground mt-2 text-sm">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{raceDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <div className="flex items-center text-muted-foreground mt-1 text-sm">
              <MapPin className="mr-2 h-4 w-4" />
              <span>{race.trackName}, {race.city}</span>
            </div>
            
            {isPast && officialPodium && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold text-lg mb-2 flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
                    Podio Oficial - {officialPodium.categoryName}
                </h4>
                <div className="space-y-2">
                    {officialPodium.results.map((result, index) => (
                        <div key={index} className="flex justify-between items-center text-sm p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center">
                                <span className={`font-bold w-6 text-center mr-2 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-orange-400'}`}>
                                    {result.position}º
                                </span>
                                <span>{result.pilotName}</span>
                            </div>
                            <span className="font-mono text-xs text-muted-foreground">{result.result_value}</span>
                        </div>
                    ))}
                </div>
              </div>
            )}
            
          </div>

          <div className="mt-4 text-right">
            <Button asChild>
              <Link href={`/calendario/${race.id}`}>
                {isPast ? 'Ver Resultados Completos' : 'Ver Detalles'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
