
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilePlus, Pencil, Trash2, Image as ImageIcon, Video } from 'lucide-react';
import type { GalleryItem } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { deleteGalleryItem } from '@/app/admin/gallery/actions';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface GalleryListClientProps {
  items: GalleryItem[];
}

export default function GalleryListClient({ items }: GalleryListClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleAddNew = () => router.push('/admin/add-gallery-item');
  const handleEdit = (id: string) => router.push(`/admin/gallery/edit/${id}`);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    const result = await deleteGalleryItem(id);
    if (result.success) {
      toast({ title: "Éxito", description: "El elemento ha sido eliminado." });
      router.refresh();
    } else {
      toast({ title: "Error", description: result.error || "No se pudo eliminar el elemento.", variant: "destructive" });
    }
    setIsDeleting(false);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Contenido de la Galería</CardTitle>
        <Button onClick={handleAddNew}>
          <FilePlus className="mr-2 h-4 w-4" />
          Añadir Nuevo
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Vista Previa</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length > 0 ? (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Image 
                        src={item.src}
                        alt={item.alt}
                        width={60}
                        height={40}
                        className="rounded-md object-cover aspect-video"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.title || "Sin título"}</TableCell>
                    <TableCell>
                      <Badge variant={item.type === 'image' ? 'secondary' : 'outline'} className="flex items-center w-fit">
                        {item.type === 'image' ? <ImageIcon className="mr-1 h-3 w-3" /> : <Video className="mr-1 h-3 w-3" />}
                        {item.type === 'image' ? 'Imagen' : 'Video'}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item.id)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                           <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>Esta acción eliminará permanentemente el elemento de la galería y su archivo asociado.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(item.id)} disabled={isDeleting}>
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
                  <TableCell colSpan={6} className="h-24 text-center">No hay elementos en la galería.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
