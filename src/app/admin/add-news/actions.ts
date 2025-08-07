
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

// Use the service role key for admin actions to bypass RLS policies.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const NewsActionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(5, { message: 'El título debe tener al menos 5 caracteres.' }),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, { message: 'El slug solo puede contener minúsculas, números y guiones.' }),
  summary: z.string().min(10, { message: 'El resumen debe tener al menos 10 caracteres.' }),
  category: z.string().min(3, { message: 'La categoría es requerida.' }),
  imageUrl: z.string().url({ message: 'La URL de la imagen es obligatoria.' }),
  galleryImageUrls: z.array(z.string().url()).optional(), // Added for the gallery
  content: z.string().min(10, { message: 'El contenido debe tener al menos 10 caracteres.' }),
  isMain: z.boolean().default(false),
});

export async function saveNews(data: z.infer<typeof NewsActionSchema>) {
  try {
    const validatedData = NewsActionSchema.parse(data);
    const { id, isMain, ...newsData } = validatedData;
    
    // Consistent HTML formatting for content
    const formattedContent = newsData.content
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => `<p>${line.trim()}</p>`)
        .join('');

    // Use camelCase for Supabase payload to match DB schema
    const articlePayload = {
      ...newsData,
      content: formattedContent,
      galleryImageUrls: newsData.galleryImageUrls || [], // Ensure it's an array
      isMain: isMain, 
    };

    if (id) {
      // Update existing document
      const { error } = await supabaseAdmin.from('news').update(articlePayload).eq('id', id);
      if (error) throw error;
    } else {
      // Add new document
      const payloadWithDate = {
        ...articlePayload,
        date: new Date().toISOString(),
      };
      const { error } = await supabaseAdmin.from('news').insert(payloadWithDate);
      if (error) throw error;
    }
  
    // Revalidate paths to reflect changes immediately
    revalidatePath('/', 'layout');
    revalidatePath('/noticias');
    if (newsData.slug) {
        revalidatePath(`/noticias/${newsData.slug}`);
    }
    revalidatePath('/admin/news');
    
    return { success: true, message: id ? 'Noticia actualizada con éxito.' : 'Noticia añadida con éxito.' };

  } catch (error: any) {
    console.error('Error al guardar la noticia:', error);
    if (error instanceof z.ZodError) {
      const errorDetails = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { success: false, error: `Error de validación: ${errorDetails}` };
    }
    // Return a generic server error message
    return { success: false, error: `Ocurrió un error en el servidor: ${error.message || 'Error desconocido'}` };
  }
}

export async function deleteNews(id: string) {
    try {
        if (!id) throw new Error("ID de noticia no proporcionado.");
        
        const { error } = await supabaseAdmin.from('news').delete().eq('id', id);
        if (error) throw error;
        
        revalidatePath('/', 'layout');
        revalidatePath('/noticias');
        revalidatePath('/admin/news');

        return { success: true, message: 'Noticia eliminada correctamente.' };

    } catch (error: any) {
        console.error('Error al eliminar la noticia:', error);
        return { success: false, error: `Ocurrió un error al eliminar la noticia: ${error.message}` };
    }
}
