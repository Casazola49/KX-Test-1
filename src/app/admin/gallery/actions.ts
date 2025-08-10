'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from '@/lib/supabase-admin';

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
    } as any;

    const { error } = await supabaseAdmin
      .from('gallery')
      .upsert(id ? { ...itemToSave, id } : itemToSave);

    if (error) {
        console.error("Supabase Error:", error.message);
        throw new Error(`Error de base de datos: ${error.message}`);
    }
  
    revalidatePath('/galeria');
    revalidatePath('/admin/gallery');
    
    return { 
      success: true, 
      message: id ? 'Elemento actualizado con éxito.' : 'Elemento añadido a la galería.' 
    };

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
        
        const { data: item, error: fetchError } = await supabaseAdmin.from('gallery').select('src').eq('id', id).single();
        if (fetchError) {
          console.warn("No se pudo obtener el item para borrar la imagen, se procederá a borrar de la BD:", fetchError.message);
        }

        if (item && item.src) {
            const filePath = new URL(item.src).pathname.split('/kpx-images/')[1];
            if (filePath) {
              const { error: storageError } = await supabaseAdmin.storage.from('kpx-images').remove([filePath]);
              if (storageError) console.error("Error al borrar imagen del storage:", storageError.message);
            }
        }
        
        const { error: deleteError } = await supabaseAdmin.from('gallery').delete().eq('id', id);
        if (deleteError) throw deleteError;
        
        revalidatePath('/galeria');
        revalidatePath('/admin/gallery');

        return { success: true, message: 'Elemento eliminado correctamente.' };

    } catch (error: any) {
        console.error('Error al eliminar el elemento de galería:', error);
        return { success: false, error: `Ocurrió un error al eliminar el elemento: ${error.message}` };
    }
}
