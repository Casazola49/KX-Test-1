'use client';

import { useState, useMemo } from 'react';
import Section from '@/components/shared/Section';
import PodiumDisplay from '@/components/client/PodiumDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GroupedPodiums, FullPodium, PodiumType } from '@/lib/types';
import { Frown } from 'lucide-react';

interface OptimizedHomepagePodiumProps {
  podium: {
    eventName: string;
    podiums: GroupedPodiums;
  };
}

export default function OptimizedHomepagePodium({ podium }: OptimizedHomepagePodiumProps) {
  const { eventName, podiums: groupedPodiums } = podium;
  const categories = Object.keys(groupedPodiums);
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || '');

  // Memoizar el podium seleccionado para evitar recálculos
  const selectedPodium = useMemo(() => {
    if (!selectedCategory || !groupedPodiums[selectedCategory]) return null;
    
    const podiumTypeOrder: PodiumType[] = [
      'PODIO_OFICIAL_DEFINITIVO', 
      'PODIO_EVENTO',
      'FINAL', 
      'MANGA_3_PRE_FINAL', 
      'MANGA_2', 
      'MANGA_1', 
      'CLASIFICACION'
    ];

    const categoryPodiums = groupedPodiums[selectedCategory];
    const sortedPodiums = [...categoryPodiums].sort((a, b) => 
      podiumTypeOrder.indexOf(a.podium_type) - podiumTypeOrder.indexOf(b.podium_type)
    );

    return sortedPodiums[0] || null;
  }, [selectedCategory, groupedPodiums]);

  return (
    <Section 
      title={`Último Podio${eventName ? ` - ${eventName}` : ''}`} 
      subtitle={eventName ? "Resultados Oficiales" : ""}
    >
      {categories.length > 0 ? (
        <div className="space-y-6">
          {/* Selector de categorías simplificado */}
          {categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map(category => (
                <Button 
                  key={category} 
                  variant={selectedCategory === category ? 'default' : 'outline'} 
                  onClick={() => setSelectedCategory(category)}
                  size="sm"
                >
                  {category}
                </Button>
              ))}
            </div>
          )}

          {/* Mostrar podium seleccionado */}
          {selectedPodium && (
            <Card className="bg-background/40 border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl text-center font-f1-bold tracking-wider text-primary">
                  {selectedCategory}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PodiumDisplay podium={selectedPodium} />
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
          <Frown size={48} className="mb-4" />
          <h3 className="text-xl font-semibold">Aún no hay resultados disponibles</h3>
          <p className="mt-2">El podio del último evento se mostrará aquí tan pronto como se publique.</p>
        </div>
      )}
    </Section>
  );
}