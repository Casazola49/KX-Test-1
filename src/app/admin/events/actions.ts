
'use server';

import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { randomUUID } from 'crypto';
import { uploadToCloudinaryServer } from '@/lib/cloudinary-server';
import { createEventWithPodiums as createEventFirebase, updateEventWithPodiums as updateEventFirebase, deleteEventWithPodiums as deleteEventFirebase } from '@/lib/data-service';

// --- Helper para subir archivos a Cloudinary ---
async function uploadFile(file: File, folder: string): Promise<string> {
    const result = await uploadToCloudinaryServer(file, folder);
    return result; // uploadToCloudinaryServer ya devuelve la URL directamente
}

async function uploadFiles(files: File[], folder: string): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    if (!file || (file as any).size === 0) continue;
    const url = await uploadFile(file, folder);
    urls.push(url);
  }
  return urls;
}

// --- Schemas (Sin cambios) ---
const podiumResultSchema = z.object({
  id: z.string().optional(),
  pilotId: z.string().optional().transform(val => !val || val.trim() === '' ? undefined : val),
  position: z.number().int(),
  resultValue: z.string().optional(),
  isGuest: z.boolean().optional().default(false),
  guestName: z.string().optional().transform(val => !val || val.trim() === '' ? undefined : val),
});

const podiumSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string(),
  podiumType: z.string(),
  determinationMethod: z.string(),
  results: z.array(podiumResultSchema),
});

// --- Lógica de Podios ---
function processPodiums(podiumsJSON: string) {
  if (!podiumsJSON) return [];
  
  const podiums = JSON.parse(podiumsJSON) as z.infer<typeof podiumSchema>[];
  if (!podiums) return [];

  // Limpieza defensiva: filtrar podios sin categoría o sin resultados válidos
  const cleanedPodiums = (podiums || [])
    .filter(p => typeof p?.categoryId === 'string' && p.categoryId.trim().length > 0)
    .map(p => ({
      ...p,
      results: (p.results || []).filter(r => {
        const hasGuest = !!r.isGuest && !!(r.guestName && r.guestName.trim().length > 0);
        const hasPilot = !r.isGuest && !!(r.pilotId && String(r.pilotId).trim().length > 0);
        return hasGuest || hasPilot;
      })
    }))
    .filter(p => p.results.length > 0);

  return cleanedPodiums;
}

// --- Acciones Principales ---
export async function createEventWithPodiums(formData: FormData) {
  console.log('DEBUG - createEventWithPodiums called');
  try {
    const promotionalImage = formData.get('promotionalImage') as File;
    console.log('DEBUG - promotionalImage:', promotionalImage ? `${promotionalImage.name} (${promotionalImage.size} bytes)` : 'null');
    
    if (!promotionalImage || promotionalImage.size === 0) {
      return { success: false, message: 'La imagen promocional es obligatoria.' };
    }
    
    console.log('DEBUG - Uploading promotional image...');
    const promotionalImageUrl = await uploadFile(promotionalImage, 'events');
    console.log('DEBUG - promotionalImageUrl:', promotionalImageUrl);

    if (!promotionalImageUrl) {
      return { success: false, message: 'Error al subir la imagen promocional a Cloudinary.' };
    }

    // Gallery images (optional)
    const galleryFiles = (formData.getAll('galleryImages') as unknown as File[]).filter((f) => f && (f as any).size > 0);
    const galleryImageUrls = await uploadFiles(galleryFiles, 'events/gallery');

    const eventData = {
      name: formData.get('name') as string,
      event_date: formData.get('eventDateTime') as string,
      track_id: formData.get('trackId') as string,
      description: formData.get('description') as string,
      promotional_image_url: promotionalImageUrl,
      gallery_image_urls: galleryImageUrls,
    };

    console.log('DEBUG - eventData:', eventData);

    const podiumsJSON = formData.get('podiums') as string;
    const podiums = processPodiums(podiumsJSON);
    console.log('DEBUG - About to call processPodiums with JSON:', podiumsJSON);
    
    const result = await createEventFirebase(eventData, podiums);
    
    if (!result.success) {
      return { success: false, message: result.error || 'Error al crear el evento' };
    }

    revalidatePath('/admin/events');
    revalidatePath('/calendario');

    return { success: true, message: 'Evento creado con éxito.' };
  } catch (error) {
    console.error('Error al crear evento:', error);
    return { success: false, message: (error as Error).message };
  }
}

export async function updateEventWithPodiums(eventId: string, formData: FormData) {
    try {
        // Para simplificar, vamos a obtener el evento existente desde Firebase
        // En una implementación más completa, podrías usar getEventById del data-service
        
        let promotionalImageUrl = formData.get('existingPromotionalImageUrl') as string;
        const newPromotionalImage = formData.get('promotionalImage') as File;

        if (newPromotionalImage && newPromotionalImage.size > 0) {
            promotionalImageUrl = await uploadFile(newPromotionalImage, 'events');
        }

        // Para simplificar, las nuevas imágenes de galería se agregan
        const existingGallery: string[] = JSON.parse(formData.get('existingGalleryUrls') as string || '[]');
        const newGalleryFiles = (formData.getAll('galleryImages') as unknown as File[]).filter((f) => f && (f as any).size > 0);
        const newGalleryUrls = await uploadFiles(newGalleryFiles, 'events/gallery');
        const finalGallery = [...existingGallery, ...newGalleryUrls];

        const eventData = {
            name: formData.get('name') as string,
            event_date: formData.get('eventDateTime') as string,
            track_id: formData.get('trackId') as string,
            description: formData.get('description') as string,
            promotional_image_url: promotionalImageUrl,
            gallery_image_urls: finalGallery,
        };

        const podiumsJSON = formData.get('podiums') as string;
        const podiums = processPodiums(podiumsJSON);
        
        const result = await updateEventFirebase(eventId, eventData, podiums);
        
        if (!result.success) {
          return { success: false, message: result.error || 'Error al actualizar el evento' };
        }

        revalidatePath('/admin/events');
        revalidatePath(`/admin/events/edit/${eventId}`);
        revalidatePath('/calendario');
        revalidatePath(`/calendario/${eventId}`);

        return { success: true, message: 'Evento actualizado con éxito.' };
    } catch (error) {
        console.error('Error al actualizar evento:', error);
        return { success: false, message: (error as Error).message };
    }
}

export async function deleteEvent(eventId: string) {
  try {
    const result = await deleteEventFirebase(eventId);
    
    if (!result.success) {
      return { success: false, message: result.error || 'Error al eliminar el evento' };
    }

    revalidatePath('/admin/events');
    revalidatePath('/calendario');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return { success: false, message: error.message || 'No se pudo eliminar el evento.' };
  }
}
