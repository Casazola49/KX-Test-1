'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createGalleryItem, updateGalleryItem, deleteGalleryItem as deleteGalleryItemFromDB, getGalleryItemById } from '@/lib/data-service';

// Esquema actualizado: sin 'slug' (la tabla no lo tiene) y con 'type' por defecto 'image'
const GalleryActionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "El título no puede estar vacío."),
  src: z.string().url('La URL de la imagen no es válida.'),
  description: z.string().optional(),
  eventId: z.string().uuid().optional().nullable(),
  tags: z.array(z.string()).optional(),
  type: z.enum(['image', 'video']).default('image').optional(),
  alt: z.string().optional(),
});

export async function saveGalleryItem(data: any) {
  try {
    const validatedData = GalleryActionSchema.parse(data);
    const { id, ...itemData } = validatedData;
    const itemToSave = {
      ...itemData,
      type: itemData.type ?? 'image',
      alt: (itemData.alt && itemData.alt.trim().length > 0) ? itemData.alt : itemData.title,
      category: itemData.category || 'general', // Agregar categoría por defecto
    } as any;

    let result;
    if (id) {
      // Actualizar elemento existente
      await updateGalleryItem(id, itemToSave);
      result = { success: true, message: 'Elemento actualizado con éxito.' };
    } else {
      // Crear nuevo elemento
      const newId = await createGalleryItem(itemToSave);
      result = { success: true, message: 'Elemento añadido a la galería.', id: newId };
    }
  
    revalidatePath('/galeria');
    revalidatePath('/admin/gallery');
    
    return result;

  } catch (error: any) {
    console.error('Error al guardar el elemento de galería:', error);
    if (error instanceof z.ZodError) {
      const errorDetails = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Error de validación: ${errorDetails}` };
    }
    return { success: false, error: error.message || 'Ocurrió un error desconocido en el servidor.' };
  }
}

export async function deleteGalleryItem(id: string) {
    try {
        if (!id) throw new Error("ID de elemento no proporcionado.");
        
        // Obtener el elemento para verificar si tiene imagen en Cloudinary
        try {
          const item = await getGalleryItemById(id);
          
          if (item && item.src) {
            // Si la imagen está en Cloudinary, podríamos eliminarla aquí
            // Por ahora solo registramos que se va a eliminar
            console.log('Eliminando elemento con imagen:', item.src);
          }
        } catch (fetchError) {
          console.warn("No se pudo obtener el item para verificar la imagen:", fetchError);
        }
        
        // Eliminar de Firebase
        await deleteGalleryItemFromDB(id);
        
        revalidatePath('/galeria');
        revalidatePath('/admin/gallery');

        return { success: true, message: 'Elemento eliminado correctamente.' };

    } catch (error: any) {
        console.error('Error al eliminar el elemento de galería:', error);
        return { success: false, error: `Ocurrió un error al eliminar el elemento: ${error.message}` };
    }
}
