
"use client";

import Section from '@/components/shared/Section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PilotCategoryRanking } from '@/lib/types';
import { Trophy } from 'lucide-react';

interface PilotsAndTeamsSectionProps {
  rankings: PilotCategoryRanking[];
}

const PilotsAndTeamsSection: React.FC<PilotsAndTeamsSectionProps> = ({ rankings }) => {
  const categories: PilotCategoryRanking[] = rankings;

  if (!categories || categories.length === 0) {
    return (
      <Section>
        <p className="text-center text-muted-foreground py-8">
          Las clasificaciones de pilotos no están disponibles en este momento.
        </p>
      </Section>
    );
  }

  return (
    <Section className="py-8 md:py-12">
      <div className="space-y-8 md:space-y-12">
        {categories.map((category, index) => (
          <Card 
            key={category.categoryName} 
            className="shadow-xl border-border/50 animate-in fade-in slide-in-from-bottom-5 duration-500 ease-out" 
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="border-b border-border bg-card/50 rounded-t-lg">
              <CardTitle className="text-xl md:text-2xl font-bold font-headline text-primary flex items-center">
                <Trophy size={26} className="mr-2.5 flex-shrink-0" />
                {category.categoryName}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {category.rankings && category.rankings.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="w-[80px] text-center font-semibold text-foreground/80">Pos.</TableHead>
                        <TableHead className="font-semibold text-foreground/80">Piloto</TableHead>
                        <TableHead className="text-right font-semibold text-foreground/80 pr-4 md:pr-6">Puntos</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {category.rankings.map((ranking) => (
                        <TableRow key={`${category.categoryName}-${ranking.position}-${ranking.name}`} className="hover:bg-muted/50 border-b-border/50 last:border-b-0">
                          <TableCell className="text-center font-medium text-foreground">{ranking.position}</TableCell>
                          <TableCell className="font-medium text-foreground">{ranking.name}</TableCell>
                          <TableCell className="text-right font-bold text-primary pr-4 md:pr-6">{ranking.points}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="p-6 text-muted-foreground text-center">No hay clasificaciones disponibles para esta categoría.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default PilotsAndTeamsSection;
