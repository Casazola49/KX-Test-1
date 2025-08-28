
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createNews, updateNews, deleteNews as deleteNewsFromFirebase } from '@/lib/data-service';

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

    // Prepare payload for Firebase
    const articlePayload = {
      title: newsData.title,
      slug: newsData.slug,
      summary: newsData.summary,
      category: newsData.category,
      imageUrl: newsData.imageUrl,
      galleryImageUrls: newsData.galleryImageUrls || [],
      content: formattedContent,
      isMain: isMain,
      date: new Date(),
    };

    if (id) {
      // Update existing document
      await updateNews(id, articlePayload);
    } else {
      // Add new document
      await createNews(articlePayload);
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
        
        await deleteNewsFromFirebase(id);
        
        revalidatePath('/', 'layout');
        revalidatePath('/noticias');
        revalidatePath('/admin/news');

        return { success: true, message: 'Noticia eliminada correctamente.' };

    } catch (error: any) {
        console.error('Error al eliminar la noticia:', error);
        return { success: false, error: `Ocurrió un error al eliminar la noticia: ${error.message}` };
    }
}
