
'use client';

import { useState, useMemo, useEffect } from 'react';
import Section from '@/components/shared/Section';
import PodiumDisplay from '@/components/client/PodiumDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FullEvent, GroupedPodiums, FullPodium, PodiumType } from '@/lib/types';
import { Frown } from 'lucide-react';

const getPodiumDisplayName = (podium: FullPodium): string => {
    const typeName = (podium.podium_type as string)?.replace(/_/g, ' ') || 'Resultado';
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

    const sortedPodiums = [...podiums].sort((a, b) => podiumTypeOrder.indexOf(a.podium_type) - podiumTypeOrder.indexOf(b.podium_type));
    const [selectedPodiumId, setSelectedPodiumId] = useState(sortedPodiums[0]?.id || '');
    
    // Resetear la selección cuando cambia la categoría o los podios recibidos
    useEffect(() => {
        setSelectedPodiumId(sortedPodiums[0]?.id || '');
    }, [categoryName, podiums]);
    const selectedPodium = useMemo(() => sortedPodiums.find(p => p.id === selectedPodiumId), [selectedPodiumId, sortedPodiums]);

    if (sortedPodiums.length === 0) return null;

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
                                    <SelectItem key={podium.id} value={podium.id} className="py-3 px-4 text-lg text-gray-900 data-[highlighted]:text-black">
                                        {getPodiumDisplayName(podium)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </CardHeader>
            <CardContent>
                {selectedPodium ? <PodiumDisplay podium={selectedPodium} /> : <p className="text-center text-muted-foreground">Selecciona un resultado para ver el podio.</p>}
            </CardContent>
        </Card>
    );
}

interface HomepagePodiumProps {
  podium: {
    eventName: string;
    podiums: GroupedPodiums;
  };
}

export default function HomepagePodium({ podium }: HomepagePodiumProps) {
    const { eventName, podiums: groupedPodiums } = podium;
    const categories = Object.keys(groupedPodiums);
    const [selectedCategory, setSelectedCategory] = useState(categories[0] || '');

    return (
        <Section title={`Último Podio${eventName ? ` - ${eventName}` : ''}`} subtitle={eventName ? "Resultados Oficiales" : ""}>
            {categories.length > 0 ? (
                <div className="space-y-8">
                    {categories.length > 1 && (
                        <div className="flex flex-wrap justify-center gap-2">
                            {categories.map(category => (
                                <Button key={category} variant={selectedCategory === category ? 'default' : 'outline'} onClick={() => setSelectedCategory(category)}>
                                    {category}
                                </Button>
                            ))}
                        </div>
                    )}
                    {selectedCategory && groupedPodiums[selectedCategory] && (
                        <CategoryClassification 
                            key={selectedCategory}
                            categoryName={selectedCategory}
                            podiums={groupedPodiums[selectedCategory]}
                        />
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
