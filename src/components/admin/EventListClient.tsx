
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus, Pencil, Trash2, CheckCircle, CircleDot } from 'lucide-react';
import type { RaceEvent } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { deleteEvent } from '@/app/admin/events/actions';
import { Badge } from '@/components/ui/badge';

interface EventListClientProps {
  events: RaceEvent[];
}

export default function EventListClient({ events }: EventListClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddNew = () => router.push('/admin/add-event');
  const handleEdit = (id: string) => router.push(`/admin/events/edit/${id}`);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    const result = await deleteEvent(id);
    if (result.success) {
      toast({ title: "Éxito", description: "El evento ha sido eliminado." });
      router.refresh();
    } else {
      toast({ title: "Error", description: result.error || "No se pudo eliminar el evento.", variant: "destructive" });
    }
    setIsDeleting(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Eventos del Calendario</CardTitle>
        <Button onClick={handleAddNew}>
          <FilePlus className="mr-2 h-4 w-4" />
          Añadir Nuevo Evento
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
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
              {events.length > 0 ? (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>{event.trackName}</TableCell>
                    <TableCell>{event.date.toString()}</TableCell>
                    <TableCell>
                      {event.isPast ? (
                        <Badge variant="secondary" className="flex items-center w-fit"><CheckCircle className="mr-1 h-3 w-3 text-green-500" />Finalizado</Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center w-fit"><CircleDot className="mr-1 h-3 w-3 text-yellow-500" />Próximo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(event.id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>Esta acción eliminará permanentemente el evento.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(event.id)} disabled={isDeleting}>
                                {isDeleting ? "Eliminando..." : "Eliminar"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">No hay eventos registrados.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
