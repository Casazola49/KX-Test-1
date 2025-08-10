
'use server';

import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';
import { randomUUID } from 'crypto';

// --- Helper para subir archivos ---
async function uploadFile(file: File, bucket: string, pathPrefix: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${pathPrefix}/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
        .from(bucket)
        .upload(filePath, file);

    if (uploadError) {
        throw new Error(`Error al subir al bucket "${bucket}": ${uploadError.message}`);
    }
    
    const { data: { publicUrl } } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
    return publicUrl;
}

async function uploadFiles(files: File[], bucket: string, pathPrefix: string): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    if (!file || (file as any).size === 0) continue;
    const url = await uploadFile(file, bucket, pathPrefix);
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
async function processPodiums(
  supabase: ReturnType<typeof createClient>,
  eventId: string,
  podiumsJSON: string,
  isEditMode: boolean
) {
  const podiums = JSON.parse(podiumsJSON) as z.infer<typeof podiumSchema>[];
  if (!podiums) return;

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

  if (isEditMode) {
    const { data: existingPodiums, error: fetchError } = await supabase.from('podiums').select('id').eq('event_id', eventId);
    if (fetchError) throw new Error(`Error al obtener podios existentes: ${fetchError.message}`);

    const incomingPodiumIds = new Set(podiums.map(p => p.id).filter(Boolean));
    const podiumsToDelete = (existingPodiums || []).filter(p => !incomingPodiumIds.has(p.id));

    for (const podium of podiumsToDelete) {
      await supabase.from('podium_results').delete().eq('podium_id', podium.id);
      await supabase.from('podiums').delete().eq('id', podium.id);
    }
  }

    for (const podiumData of cleanedPodiums) {
    // Construir payload de podio omitiendo 'id' cuando viene vacío/undefined
    const podiumPayload: any = {
      event_id: eventId,
      category_id: podiumData.categoryId,
      podium_type: podiumData.podiumType,
      determination_method: podiumData.determinationMethod,
    };
    if (podiumData.id && String(podiumData.id).trim() !== '') {
      podiumPayload.id = podiumData.id;
    }

    const { data: podium, error: podiumError } = await supabase
      .from('podiums')
      .upsert(podiumPayload)
      .select('id')
      .single();
    if (podiumError) throw new Error(`Error al guardar podio: ${podiumError.message}`);
    
    const podiumId = podium.id;

    if (isEditMode && podiumData.id) {
      const { data: existingResults, error: fetchResultsErr } = await supabase.from('podium_results').select('id').eq('podium_id', podiumId);
      if (fetchResultsErr) throw new Error(`Error al obtener resultados existentes: ${fetchResultsErr.message}`);

      const incomingResultIds = new Set(podiumData.results.map(r => r.id).filter(Boolean));
      const resultsToDelete = (existingResults || []).filter(r => !incomingResultIds.has(r.id));
      if (resultsToDelete.length > 0) {
        const { error: delErr } = await supabase.from('podium_results').delete().in('id', resultsToDelete.map(r => r.id));
        if(delErr) throw new Error(`Error al borrar resultados desactualizados: ${delErr.message}`);
      }
    }

    // ==================================================================
    // LA CORRECCIÓN DEFINITIVA ESTÁ AQUÍ
    // ==================================================================
    const resultsToUpsert = podiumData.results.map(result => {
      // DEBUG: Ver qué datos llegan
      console.log('DEBUG - Result data:', {
        pilotId: result.pilotId,
        isGuest: result.isGuest,
        guestName: result.guestName,
        pilotIdType: typeof result.pilotId
      });
      
      const row: any = {
          podium_id: podiumId,
          pilot_id: result.isGuest ? null : (result.pilotId || null),
          position: result.position || (podiumData.results.indexOf(result) + 1), // Asegurar position
          result_value: result.resultValue,
          guest_name: result.isGuest && result.guestName ? result.guestName : null,
      };
      
      console.log('DEBUG - Row to upsert:', row);
      // Asegurar ID: si no existe (nuevo resultado) generamos uno (algunas tablas no tienen default UUID)
      row.id = result.id && String(result.id).trim() !== '' ? result.id : randomUUID();
      return row;
    });
    
    if (resultsToUpsert.length > 0) {
      // Limpiar objetos: si pilot_id es '', enviamos null; eliminar propiedades undefined
      const sanitized = resultsToUpsert.map((r) => {
        const row: any = { ...r };
        if (row.pilot_id === '') row.pilot_id = null;
        Object.keys(row).forEach((k) => {
          if (row[k] === undefined) delete row[k];
        });
        return row;
      });
      const { error: resultsError } = await supabase.from('podium_results').upsert(sanitized);
      if (resultsError) throw new Error(`Error al guardar resultados del podio: ${resultsError.message}`);
    }
  }
}

// --- Acciones Principales ---
export async function createEventWithPodiums(formData: FormData) {
  const supabase = createClient();
  console.log('DEBUG - createEventWithPodiums called');
  try {
    const promotionalImage = formData.get('promotionalImage') as File;
    if (!promotionalImage || promotionalImage.size === 0) {
      return { success: false, message: 'La imagen promocional es obligatoria.' };
    }
    const promotionalImageUrl = await uploadFile(promotionalImage, 'kpx-images', 'event-promo');

    // Gallery images (optional)
    const galleryFiles = (formData.getAll('galleryImages') as unknown as File[]).filter((f) => f && (f as any).size > 0);
    const galleryImageUrls = await uploadFiles(galleryFiles, 'kpx-images', 'event-gallery');

    const eventData = {
      name: formData.get('name') as string,
      event_date: formData.get('eventDateTime') as string,
      track_id: formData.get('trackId') as string,
      description: formData.get('description') as string,
      promotional_image_url: promotionalImageUrl,
      gallery_image_urls: galleryImageUrls,
    };
    const { data: event, error: eventError } = await supabase.from('events').insert(eventData).select('id').single();
    if (eventError) throw eventError;

    const eventId = event.id;
    const podiumsJSON = formData.get('podiums') as string;
    console.log('DEBUG - About to call processPodiums with JSON:', podiumsJSON);
    await processPodiums(supabase, eventId, podiumsJSON, false);

    revalidatePath('/admin/events');
    revalidatePath('/calendario');

    return { success: true, message: 'Evento creado con éxito.' };
  } catch (error) {
    console.error('Error al crear evento:', error);
    return { success: false, message: (error as Error).message };
  }
}

export async function updateEventWithPodiums(eventId: string, formData: FormData) {
    const supabase = createClient();
    try {
        const { data: existingEvent, error: fetchError } = await supabase
          .from('events')
          .select('promotional_image_url, gallery_image_urls')
          .eq('id', eventId)
          .single();
        if (fetchError) throw fetchError;

        let promotionalImageUrl = existingEvent.promotional_image_url;
        const newPromotionalImage = formData.get('promotionalImage') as File;

        if (newPromotionalImage && newPromotionalImage.size > 0) {
            promotionalImageUrl = await uploadFile(newPromotionalImage, 'kpx-images', 'event-promo');
        }

        // Preserve existing gallery and append new uploads (if any)
        const existingGallery: string[] = Array.isArray(existingEvent.gallery_image_urls)
          ? (existingEvent.gallery_image_urls as string[])
          : [];
        const newGalleryFiles = (formData.getAll('galleryImages') as unknown as File[]).filter((f) => f && (f as any).size > 0);
        const newGalleryUrls = await uploadFiles(newGalleryFiles, 'kpx-images', 'event-gallery');
        const finalGallery = [...existingGallery, ...newGalleryUrls];

        const eventData = {
            name: formData.get('name') as string,
            event_date: formData.get('eventDateTime') as string,
            track_id: formData.get('trackId') as string,
            description: formData.get('description') as string,
            promotional_image_url: promotionalImageUrl,
            gallery_image_urls: finalGallery,
        };
        const { error: eventError } = await supabase.from('events').update(eventData).eq('id', eventId);
        if (eventError) throw eventError;

        const podiumsJSON = formData.get('podiums') as string;
        await processPodiums(supabase, eventId, podiumsJSON, true);

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
  const supabase = createClient();
  try {
    // 1) Borrar resultados de podios del evento
    const { data: podiums, error: fetchPodiumsErr } = await supabase
      .from('podiums')
      .select('id')
      .eq('event_id', eventId);
    if (fetchPodiumsErr) throw fetchPodiumsErr;

    if (podiums && podiums.length > 0) {
      const podiumIds = podiums.map(p => p.id);
      const { error: delResultsErr } = await supabase
        .from('podium_results')
        .delete()
        .in('podium_id', podiumIds);
      if (delResultsErr) throw delResultsErr;

      const { error: delPodiumsErr } = await supabase
        .from('podiums')
        .delete()
        .in('id', podiumIds);
      if (delPodiumsErr) throw delPodiumsErr;
    }

    // 2) Borrar el evento
    const { error: delEventErr } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);
    if (delEventErr) throw delEventErr;

    revalidatePath('/admin/events');
    revalidatePath('/calendario');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return { success: false, message: error.message || 'No se pudo eliminar el evento.' };
  }
}
