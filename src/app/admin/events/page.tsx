
import { createClient } from '@/lib/supabase-server';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { unstable_noStore as noStore } from 'next/cache';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';
import PageTitle from '@/components/shared/PageTitle';
import DeleteEventButton from '@/components/admin/DeleteEventButton';

// Define a more robust type for the track, which can be an object, an array of objects, or null.
type Track = { name: string } | { name: string }[] | null;

interface AdminEvent {
  id: string;
  name: string;
  event_date: string | null;
  track: Track;
}

async function getEvents(): Promise<AdminEvent[]> {
  noStore();
  const supabase = createClient();
  const { data: events, error } = await supabase
    .from('events')
    .select(`
      id,
      name,
      event_date,
      track:tracks (name)
    `)
    .order('event_date', { ascending: false });

  if (error) {
    console.error('Error fetching admin events:', error);
    return [];
  }
  return events as AdminEvent[];
}

export default async function AdminEventsPage() {
  const events = await getEvents();

  const isPast = (dateStr: string | null) => {
      if (!dateStr) return false;
      return new Date(dateStr) < new Date();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <PageTitle title="Gestionar Eventos" />
        <Button asChild>
          <Link href="/admin/add-event">Añadir Nuevo Evento</Link>
        </Button>
      </div>

      <div className="bg-card border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Evento</TableHead>
              <TableHead>Pista</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => {
              // THE FIX: Robustly get the track name regardless of whether it's an object or an array.
              const track = event.track;
              const trackName = track ? (Array.isArray(track) ? track[0]?.name : track.name) : 'N/A';

              return (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell>{trackName}</TableCell>
                  <TableCell>{event.event_date ? new Date(event.event_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric'}) : 'N/A'}</TableCell>
                  <TableCell>
                    {isPast(event.event_date) ? (
                      <Badge variant="secondary">Finalizado</Badge>
                    ) : (
                      <Badge>Próximo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/events/edit/${event.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <DeleteEventButton eventId={event.id} eventName={event.name} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
         {events.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
                No se encontraron eventos.
            </div>
         )}
      </div>
    </div>
  );
}
