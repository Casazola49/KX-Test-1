
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import type { Kart } from '@/lib/types';
import { deleteKart } from '@/app/admin/karts/actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Este es el componente cliente que maneja la interactividad de la lista
export default function KartList({ initialKarts }: { initialKarts: Kart[] }) {
  const [karts, setKarts] = useState(initialKarts);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = (kartId: string) => {
    startTransition(async () => {
      const result = await deleteKart(kartId);
      if (result.success) {
        setKarts(currentKarts => currentKarts.filter(k => k.id !== kartId));
        toast({ title: 'Éxito', description: result.message });
      } else {
        toast({ title: 'Error', description: result.error as string, variant: 'destructive' });
      }
    });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {karts.length > 0 ? (
          karts.map((kart) => (
            <TableRow key={kart.id}>
              <TableCell className="font-medium">{kart.name}</TableCell>
              <TableCell>{kart.category}</TableCell>
              <TableCell className="text-right space-x-2">
                <Link href={`/admin/karts/edit/${kart.id}`}>
                  <Button variant="outline" size="icon" aria-label="Editar Kart">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon" disabled={isPending} aria-label="Eliminar Kart">
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente el kart de la base de datos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(kart.id)}>
                        Continuar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={3} className="text-center">
              No hay karts para mostrar.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
