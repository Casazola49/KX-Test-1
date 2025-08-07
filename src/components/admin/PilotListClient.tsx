
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus, Pencil, Trash2 } from 'lucide-react';
import type { Pilot } from '@/lib/types';
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
import { useToast } from '@/hooks/use-toast';
import { deletePilot } from '@/app/admin/pilots/actions';
import Image from 'next/image';

interface PilotListClientProps {
  pilots: Pilot[];
}

export default function PilotListClient({ pilots }: PilotListClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddNew = () => {
    router.push('/admin/add-pilot');
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/pilots/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    const result = await deletePilot(id);
    if (result.success) {
      toast({
        title: "Éxito",
        description: "El perfil del piloto ha sido eliminado.",
      });
      router.refresh(); // Refresca los datos de la página
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo eliminar el piloto.",
        variant: "destructive",
      });
    }
    setIsDeleting(false);
  };

  const getPilotDisplayName = (pilot: Pilot) => {
    const fullName = `${pilot.firstName || ''} ${pilot.lastName || ''}`.trim();
    // Fallback to the 'name' field if firstName and lastName are not present
    return fullName || pilot.name;
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Pilotos Registrados</CardTitle>
        <Button onClick={handleAddNew}>
          <FilePlus className="mr-2 h-4 w-4" />
          Añadir Nuevo Piloto
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Foto</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pilots.length > 0 ? (
                pilots.map((pilot) => (
                  <TableRow key={pilot.id}>
                    <TableCell>
                      {pilot.imageUrl && (
                        <Image
                          src={pilot.imageUrl}
                          alt={getPilotDisplayName(pilot)}
                          width={40}
                          height={40}
                          className="rounded-full object-cover aspect-square"
                        />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{getPilotDisplayName(pilot)}</TableCell>
                    <TableCell>{pilot.category}</TableCell>
                    <TableCell>{pilot.teamName || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(pilot.id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                             <Trash2 className="h-4 w-4" />
                           </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el perfil del piloto.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(pilot.id)} disabled={isDeleting}>
                                {isDeleting ? "Eliminando..." : "Confirmar Eliminación"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No hay pilotos registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
