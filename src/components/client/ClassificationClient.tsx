
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { groupPodiumsByCategory } from '@/lib/utils';
import type { FullEvent, GroupedPodiums, FullPodium, PodiumType, DeterminationMethod } from '@/lib/types';
import PodiumDisplay from './PodiumDisplay';
import { Frown } from 'lucide-react';

interface ClassificationClientProps {
  events: FullEvent[];
  initialGroupedPodiums: GroupedPodiums;
}

const getPodiumDisplayName = (podium: FullPodium): string => {
    let typeName = '';
    switch (podium.podium_type) {
        case 'CLASIFICACION':
            typeName = 'Clasificación';
            break;
        case 'MANGA_1':
            typeName = 'Manga 1';
            break;
        case 'MANGA_2':
            typeName = 'Manga 2';
            break;
        case 'MANGA_3_PRE_FINAL':
            typeName = 'Pre-Final / Manga 3';
            break;
        case 'FINAL':
            typeName = 'Final';
            break;
        case 'PODIO_EVENTO':
            typeName = 'Podio del Evento';
            break;
        case 'PODIO_OFICIAL_DEFINITIVO':
            typeName = 'Podio Oficial Definitivo';
            break;
        default:
            typeName = (podium.podium_type as string)?.replace(/_/g, ' ') || 'Resultado';
    }

    const methodName = podium.determination_method.charAt(0).toUpperCase() + podium.determination_method.slice(1).toLowerCase();
    
    return `${typeName} (${methodName})`;
};


interface CategoryClassificationProps {
  categoryName: string;
  podiums: FullPodium[];
}

function CategoryClassification({ categoryName, podiums }: CategoryClassificationProps) {
    const podiumTypeOrder: PodiumType[] = [
        'PODIO_OFICIAL_DEFINITIVO', 
        'PODIO_EVENTO',
        'FINAL', 
        'MANGA_3_PRE_FINAL', 
        'MANGA_2', 
        'MANGA_1', 
        'CLASIFICACION'
    ];

    const sortedPodiums = [...podiums].sort((a, b) => {
        return podiumTypeOrder.indexOf(a.podium_type) - podiumTypeOrder.indexOf(b.podium_type);
    });

    const [selectedPodiumId, setSelectedPodiumId] = useState(sortedPodiums[0]?.id || '');

    const selectedPodium = useMemo(
        () => sortedPodiums.find(p => p.id === selectedPodiumId),
        [selectedPodiumId, sortedPodiums]
    );

    if (sortedPodiums.length === 0) {
        return null;
    }

    return (
        <Card className="bg-background/40 border-border/50">
            <CardHeader className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                <CardTitle className="text-2xl md:text-3xl text-center font-f1-bold tracking-wider text-primary">
                    {categoryName}
                </CardTitle>
                {sortedPodiums.length > 1 && (
                    <div className="w-full md:w-auto md:min-w-[320px] p-3 border border-border/50 rounded-lg bg-background/30">
                        <Label htmlFor={`podium-select-${categoryName}`} className="text-sm font-medium text-muted-foreground mb-2 block">
                            Resultados Disponibles
                        </Label>
                        <Select onValueChange={setSelectedPodiumId} defaultValue={selectedPodiumId}>
                            <SelectTrigger id={`podium-select-${categoryName}`} className="w-full py-3 px-4 text-lg">
                                <SelectValue placeholder="Selecciona un resultado" />
                            </SelectTrigger>
                            <SelectContent>
                                {sortedPodiums.map(podium => (
                                    <SelectItem 
                                        key={podium.id} 
                                        value={podium.id} 
                                        className="py-3 px-4 text-lg text-gray-900 data-[highlighted]:text-black"
                                    >
                                        {getPodiumDisplayName(podium)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {selectedPodium ? (
                    <PodiumDisplay podium={selectedPodium} />
                ) : (
                    <p className="text-center text-muted-foreground">Selecciona un resultado para ver el podio.</p>
                )}
            </CardContent>
        </Card>
    );
}

export default function ClassificationClient({ events, initialGroupedPodiums }: ClassificationClientProps) {
  // Elegimos por defecto el primer evento que tenga podios
  const defaultEventId = events.find(e => Array.isArray(e.podiums) && e.podiums.length > 0)?.id || events[0]?.id || '';
  const [selectedEventId, setSelectedEventId] = useState<string>(defaultEventId);

  const groupedPodiums = useMemo(() => {
    const selectedEvent = events.find(e => e.id === selectedEventId);
    // Si no hay seleccionado (o no tiene podios), usar initialGroupedPodiums como fallback
    if (!selectedEvent || !selectedEvent.podiums || selectedEvent.podiums.length === 0) {
      return initialGroupedPodiums || {};
    }
    return groupPodiumsByCategory(selectedEvent.podiums);
  }, [selectedEventId, events, initialGroupedPodiums]);
  
  const categories = Object.keys(groupedPodiums);

  return (
    <div className="space-y-8 mt-8">
      {events.length > 0 ? (
          <div className="max-w-md mx-auto">
            <Select onValueChange={setSelectedEventId} defaultValue={selectedEventId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un Evento" />
              </SelectTrigger>
              <SelectContent>
                {events.map(event => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name} - {new Date(event.event_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
      ) : null}

      {categories.length > 0 ? (
        categories.map((categoryName) => (
            <CategoryClassification 
                key={categoryName}
                categoryName={categoryName}
                podiums={groupedPodiums[categoryName]}
            />
        ))
      ) : (
        <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
            <Frown size={48} className="mb-4" />
            <h3 className="text-2xl font-semibold">No hay datos disponibles</h3>
            <p className="mt-2">Los podios y resultados se mostrarán aquí tan pronto como se publiquen después de un evento.</p>
        </div>
      )}
    </div>
  );
}
