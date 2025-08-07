
'use client';

import { Podium } from '@/lib/types';
import { groupPodiumsByCategory } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PodiumDisplay from './PodiumDisplay';
import Section from '../shared/Section';

interface EventPodiumResultsProps {
  podiums: Podium[];
}

const podiumTypeLabels: { [key: string]: string } = {
    PODIO_OFICIAL_DEFINITIVO: 'Oficial Definitivo',
    PODIO_EVENTO: 'Podio Evento',
    FINAL: 'Final',
    MANGA_3_PRE_FINAL: 'Pre-Final',
    MANGA_2: 'Manga 2',
    MANGA_1: 'Manga 1',
    CLASIFICACION: 'Clasificación',
};

export default function EventPodiumResults({ podiums }: EventPodiumResultsProps) {
    if (!podiums || podiums.length === 0) {
        return (
            <Section title="Resultados del Evento">
                <Card className="text-center p-8">
                    <CardTitle>Resultados Pendientes</CardTitle>
                    <CardContent className="mt-4">
                        <p className="text-muted-foreground">Los podios y resultados de este evento se publicarán pronto.</p>
                    </CardContent>
                </Card>
            </Section>
        );
    }
  
  const groupedPodiums = groupPodiumsByCategory(podiums as any);

  return (
    <Section title="Resultados y Podios">
        <div className="space-y-8">
            {Object.entries(groupedPodiums).map(([categoryName, categoryPodiums]) => {
                if (!categoryPodiums || categoryPodiums.length === 0) {
                    return null;
                }

                // If there's only one podium type, just show it without tabs.
                if (categoryPodiums.length === 1) {
                    return (
                        <Card key={categoryName} className="bg-transparent border-none shadow-none">
                            <CardHeader>
                                <CardTitle className="text-2xl md:text-3xl text-center font-bold text-primary">
                                    {categoryName}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mt-6">
                                    <PodiumDisplay podium={categoryPodiums[0] as any} />
                                </div>
                            </CardContent>
                        </Card>
                    );
                }

                const defaultTab = categoryPodiums[0].podium_type;

                return (
                    <Card key={categoryName} className="bg-transparent border-none shadow-none">
                        <CardHeader>
                            <CardTitle className="text-2xl md:text-3xl text-center font-bold text-primary">
                                {categoryName}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue={defaultTab} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 h-auto justify-center bg-transparent p-0">
                                    {categoryPodiums.map(podium => (
                                        <TabsTrigger 
                                            key={podium.id} 
                                            value={podium.podium_type} 
                                            className="flex-grow text-xs md:text-sm border border-primary/20 hover:bg-primary/10 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
                                        >
                                            {podiumTypeLabels[podium.podium_type] || podium.podium_type}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                {categoryPodiums.map(podium => (
                                    <TabsContent key={podium.id} value={podium.podium_type} className="mt-6">
                                        <PodiumDisplay podium={podium as any} />
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    </Section>
  );
}
