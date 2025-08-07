
'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageTitle from '@/components/shared/PageTitle';
import PilotDriverCard from '@/components/shared/PilotDriverCard';
import ClassificationClient from './ClassificationClient';
import { Pilot, FullEvent, GroupedPodiums } from '@/lib/types';
import { Frown, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  pilots: Pilot[];
  events: FullEvent[];
  initialGroupedPodiums: GroupedPodiums;
  availableCategories: string[]; // Recibimos las categorías ordenadas desde el servidor
}

const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-16 text-muted-foreground flex flex-col items-center">
        <Frown size={48} className="mb-4" />
        <h3 className="text-2xl font-semibold">No hay datos disponibles</h3>
        <p className="mt-2">{message}</p>
    </div>
);

export default function PilotsPageClient({ pilots, events, initialGroupedPodiums, availableCategories }: Props) {
  const [activeTab, setActiveTab] = useState('pilots');
  const [searchTerm, setSearchTerm] = useState('');
  // SOLUCIÓN: El estado ahora maneja el string de la categoría seleccionada, o 'Todas'.
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Los botones de filtro se generan a partir de las categorías que llegan del servidor.
  const displayCategories = useMemo(() => ['Todas', ...availableCategories], [availableCategories]);

  const filteredAndGroupedPilots = useMemo(() => {
    let filtered = pilots;

    // Filtrado por término de búsqueda
    if (searchTerm) {
        filtered = filtered.filter(p =>
            `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    // Filtrado por categoría (la lógica clave corregida)
    if (selectedCategory !== 'Todas') {
        filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Agrupación de pilotos por su categoría
    const grouped = filtered.reduce((acc, pilot) => {
        // Usamos el nombre de la categoría (que ya es un string) como clave.
        const categoryKey = pilot.category || 'Sin Categoría';
        if (!acc[categoryKey]) {
          acc[categoryKey] = [];
        }
        acc[categoryKey].push(pilot);
        return acc;
      }, {} as Record<string, Pilot[]>);

    // Ordenar las claves de categoría (los nombres) para una visualización consistente
    const sortedCategoryKeys = Object.keys(grouped).sort((a, b) => {
        if (a === 'Sin Categoría') return 1; // 'Sin Categoría' siempre al final
        if (b === 'Sin Categoría') return -1;
        return a.localeCompare(b); // Orden alfabético para el resto
    });
    
    // Reconstruir el objeto agrupado con las claves ya ordenadas
    const sortedGrouped: Record<string, Pilot[]> = {};
    for (const key of sortedCategoryKeys) {
        sortedGrouped[key] = grouped[key];
    }
    return sortedGrouped;

  }, [pilots, searchTerm, selectedCategory, availableCategories]);


  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle title="Pilotos y Clasificación" />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
          <TabsTrigger value="pilots">Pilotos</TabsTrigger>
          <TabsTrigger value="classification">Clasificación</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pilots">
            <div className="py-8 space-y-6">
                <div className="relative max-w-lg mx-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                    <Input
                        placeholder="Buscar piloto por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full"
                    />
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                    {displayCategories.map(category => (
                        <Button
                            key={category}
                            variant={selectedCategory === category ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </Button>
                    ))}
                </div>
            </div>

            {Object.keys(filteredAndGroupedPilots).length > 0 ? (
                <div className="space-y-12">
                {Object.entries(filteredAndGroupedPilots).map(([category, pilotList]) => (
                    <div key={category}>
                        <h2 className="text-3xl font-bold mb-6 text-center tracking-wider uppercase">{category}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {pilotList.map((pilot) => (
                                <PilotDriverCard key={pilot.id} pilot={pilot} />
                            ))}
                        </div>
                    </div>
                ))}
                </div>
          ) : (
            <EmptyState message="No se encontraron pilotos con los filtros actuales." />
          )}
        </TabsContent>

        <TabsContent value="classification">
          {events && events.length > 0 ? (
             <ClassificationClient 
                events={events}
                initialGroupedPodiums={initialGroupedPodiums}
             />
          ) : (
            <EmptyState message="Los podios y resultados se mostrarán aquí tan pronto como se publiquen después de un evento." />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
