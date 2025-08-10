
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// --- Esquemas de Validación ---
const LiveStreamSchema = z.object({
  is_live: z.boolean(),
  stream_title: z.string().optional(),
  iframe_url: z.string().url({ message: "Por favor, introduce una URL de iframe válida." }).optional().or(z.literal('')),
});

const ChatMessageSchema = z.object({
  message: z.string().min(1, "El mensaje no puede estar vacío.").max(500, "El mensaje es demasiado largo."),
});


// --- Cliente de Supabase Admin ---
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


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
    const { error } = await supabaseAdmin
      .from('live_stream')
      .update({
        is_live: validatedFields.data.is_live,
        stream_title: validatedFields.data.stream_title,
        iframe_url: validatedFields.data.iframe_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    if (error) throw error;

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
    const { error } = await supabaseAdmin
      .from('live_chat_messages')
      // ---- CORRECCIÓN ----
      // Se inserta explícitamente el autor como "KX"
      .insert({ message: validatedMessage.data.message, author: 'KX' });

    if (error) throw error;
    
    return { success: true };

  } catch (error: any) {
    return { success: false, error: `Error al enviar el mensaje: ${error.message}` };
  }
}
