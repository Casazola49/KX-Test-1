
'use server';

import { createClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { revalidatePath } from 'next/cache';
import * as z from 'zod';

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

// --- Schemas (Sin cambios) ---
const podiumResultSchema = z.object({
  id: z.string().optional(),
  pilotId: z.string(),
  position: z.number().int(),
  resultValue: z.string().optional(),
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

  for (const podiumData of podiums) {
    const { data: podium, error: podiumError } = await supabase
      .from('podiums').upsert({
        id: podiumData.id, event_id: eventId, category_id: podiumData.categoryId,
        podium_type: podiumData.podiumType, determination_method: podiumData.determinationMethod,
      }).select('id').single();
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
      const row: any = {
          podium_id: podiumId,
          pilot_id: result.pilotId,
          position: result.position,
          result_value: result.resultValue,
      };
      // Solo añadimos el ID al objeto si realmente existe (para actualizaciones).
      // Si no existe, se omite, y la base de datos usará el DEFAULT para generar uno nuevo.
      if (result.id) {
          row.id = result.id;
      }
      return row;
    });
    
    if (resultsToUpsert.length > 0) {
      const { error: resultsError } = await supabase.from('podium_results').upsert(resultsToUpsert);
      if (resultsError) throw new Error(`Error al guardar resultados del podio: ${resultsError.message}`);
    }
  }
}

// --- Acciones Principales ---
export async function createEventWithPodiums(formData: FormData) {
  const supabase = createClient();
  try {
    const promotionalImage = formData.get('promotionalImage') as File;
    if (!promotionalImage || promotionalImage.size === 0) {
      return { success: false, message: 'La imagen promocional es obligatoria.' };
    }
    const promotionalImageUrl = await uploadFile(promotionalImage, 'kpx-images', 'event-promo');

    const eventData = {
      name: formData.get('name') as string,
      event_date: formData.get('eventDateTime') as string,
      track_id: formData.get('trackId') as string,
      description: formData.get('description') as string,
      promotional_image_url: promotionalImageUrl,
    };
    const { data: event, error: eventError } = await supabase.from('events').insert(eventData).select('id').single();
    if (eventError) throw eventError;

    const eventId = event.id;
    const podiumsJSON = formData.get('podiums') as string;
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
        const { data: existingEvent, error: fetchError } = await supabase.from('events').select('promotional_image_url').eq('id', eventId).single();
        if (fetchError) throw fetchError;

        let promotionalImageUrl = existingEvent.promotional_image_url;
        const newPromotionalImage = formData.get('promotionalImage') as File;

        if (newPromotionalImage && newPromotionalImage.size > 0) {
            promotionalImageUrl = await uploadFile(newPromotionalImage, 'kpx-images', 'event-promo');
        }

        const eventData = {
            name: formData.get('name') as string,
            event_date: formData.get('eventDateTime') as string,
            track_id: formData.get('trackId') as string,
            description: formData.get('description') as string,
            promotional_image_url: promotionalImageUrl,
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
