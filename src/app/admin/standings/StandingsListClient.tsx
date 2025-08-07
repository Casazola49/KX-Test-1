
'use client';

import { Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Standing } from '@/lib/types';
import { deleteStanding } from './actions';
import { toast } from '@/hooks/use-toast';

interface StandingsListClientProps {
  standings: Standing[];
}

export default function StandingsListClient({ standings }: StandingsListClientProps) {
  
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this standing?')) {
      const result = await deleteStanding(id);
      if (result.success) {
        toast({ title: 'Success', description: 'Standing deleted successfully.' });
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Failed to delete standing.',
          variant: 'destructive',
        });
      }
    }
  };

  // Group standings by category
  const groupedStandings = standings.reduce((acc, standing) => {
    const category = standing.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(standing);
    return acc;
  }, {} as Record<string, Standing[]>);

  // Sort each category by points
  Object.keys(groupedStandings).forEach(category => {
    groupedStandings[category].sort((a, b) => b.points - a.points);
  });


  if (standings.length === 0) {
    return <p className="text-gray-400">No standings found.</p>;
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedStandings).map(([category, categoryStandings]) => (
        <div key={category}>
          <h3 className="text-xl font-semibold mb-3 text-gray-300">{category}</h3>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Pos.</TableHead>
                  <TableHead>Pilot</TableHead>
                  <TableHead>Points</TableHead>
                  {categoryStandings[0]?.trackId && <TableHead>Track</TableHead>}
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryStandings.map((standing, index) => (
                  <TableRow key={standing.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{standing.pilotName}</TableCell>
                    <TableCell>{standing.points}</TableCell>
                    {standing.trackId && <TableCell>{standing.trackId}</TableCell>}
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(standing.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ))}
    </div>
  );
}
