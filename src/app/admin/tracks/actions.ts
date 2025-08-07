
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

// Use the service role key for admin actions to bypass RLS policies.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TrackSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  location: z.string().min(3, 'La ubicación es requerida.'),
  description: z.string().optional(),
  imageUrl: z.string().url('La URL de la imagen principal es obligatoria.'),
  galleryImageUrls: z.array(z.string().url()).optional(),
  length: z.string().optional(),
  width: z.string().optional(),
  curves: z.coerce.number().int().min(0).optional(),
  altitude: z.string().optional(),
  record: z.string().optional(),
  max_speed: z.string().optional(),
  infrastructure: z.array(z.string()).optional(),
});

export async function saveTrack(data: z.infer<typeof TrackSchema>) {
  try {
    const validatedData = TrackSchema.parse(data);
    const { id, ...trackData } = validatedData;

    // ---- CORRECCIÓN ----
    // Mapeamos explícitamente los nombres de camelCase a snake_case
    // para que coincidan con la estructura de la base de datos de Supabase.
    const payload = {
        name: trackData.name,
        location: trackData.location,
        description: trackData.description,
        image_url: trackData.imageUrl, // Corregido
        gallery_image_urls: trackData.galleryImageUrls || [], // Corregido
        length: trackData.length,
        width: trackData.width,
        curves: trackData.curves,
        altitude: trackData.altitude,
        record: trackData.record,
        max_speed: trackData.max_speed, // Corregido
        infrastructure: trackData.infrastructure || [],
    };
    
    let result;
    if (id) {
      // Update
      const { data, error } = await supabaseAdmin.from('tracks').update(payload).eq('id', id).select().single();
      if (error) throw error;
      result = data;
    } else {
      // Create
      const { data, error } = await supabaseAdmin.from('tracks').insert(payload).select().single();
      if (error) throw error;
      result = data;
    }

    // Revalidate paths
    revalidatePath('/pistas');
    if (result.id) {
        revalidatePath(`/pistas/${result.id}`);
    }
    revalidatePath('/admin/tracks');
    
    return { success: true, message: id ? 'Pista actualizada con éxito.' : 'Pista añadida con éxito.' };

  } catch (error: any) {
    console.error('Error al guardar la pista:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: `Error de validación: ${error.errors.map(e => e.message).join(', ')}` };
    }
    return { success: false, error: `Ocurrió un error en el servidor: ${error.message || 'Error desconocido'}` };
  }
}

export async function deleteTrack(id: string) {
    try {
        if (!id) throw new Error("ID de pista no proporcionado.");
        
        const { error } = await supabaseAdmin.from('tracks').delete().eq('id', id);
        if (error) throw error;
        
        revalidatePath('/pistas');
        revalidatePath('/admin/tracks');

        return { success: true, message: 'Pista eliminada correctamente.' };

    } catch (error: any) {
        console.error('Error al eliminar la pista:', error);
        return { success: false, error: `Ocurrió un error al eliminar la pista: ${error.message}` };
    }
}
