
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { 
  updateLiveStreamConfig, 
  createChatMessage, 
  getLiveStreamConfig 
} from '@/lib/data-service';

// --- Esquemas de Validación ---
const LiveStreamSchema = z.object({
  is_live: z.boolean(),
  stream_title: z.string().optional(),
  iframe_url: z.string().url({ message: "Por favor, introduce una URL de iframe válida." }).optional().or(z.literal('')),
});

const ChatMessageSchema = z.object({
  message: z.string().min(1, "El mensaje no puede estar vacío.").max(500, "El mensaje es demasiado largo."),
});


// Migrado a Firebase - ya no necesitamos cliente de Supabase


// --- Acción para Actualizar Configuración del Stream ---
export async function updateLiveStreamSettings(formData: FormData): Promise<void> {
  const validatedFields = LiveStreamSchema.safeParse({
    is_live: formData.get('is_live') === 'on',
    stream_title: formData.get('stream_title') as string,
    iframe_url: formData.get('iframe_url') as string,
  });

  if (!validatedFields.success) {
    throw new Error(JSON.stringify(validatedFields.error.flatten().fieldErrors));
  }

  try {
    await updateLiveStreamConfig({
      is_live: validatedFields.data.is_live,
      stream_title: validatedFields.data.stream_title,
      iframe_url: validatedFields.data.iframe_url,
    });

    revalidatePath('/live');
    revalidatePath('/admin/live');
  } catch (error: any) {
    throw new Error(`Error al actualizar: ${error.message}`);
  }
}


// --- Acción para Enviar Mensajes al Chat (Actualizada) ---
export async function sendChatMessage(message: string) {
  const validatedMessage = ChatMessageSchema.safeParse({ message });

  if (!validatedMessage.success) {
    return { success: false, error: "Mensaje inválido." };
  }

  try {
    await createChatMessage({
      message: validatedMessage.data.message,
      author: 'KX'
    });
    
    return { success: true };

  } catch (error: any) {
    return { success: false, error: `Error al enviar el mensaje: ${error.message}` };
  }
}
