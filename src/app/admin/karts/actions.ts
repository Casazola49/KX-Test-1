
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createKart as createKartInFirebase, updateKart as updateKartInFirebase, deleteKart as deleteKartInFirebase } from '@/lib/data-service';

// Esquema de validación para los datos del kart
const kartSchema = z.object({
  name: z.string().min(3, 'El nombre es obligatorio.'),
  category: z.string().min(3, 'La categoría es obligatoria.'),
  description: z.string().optional(),
  model_url: z.string().url('La URL del modelo no es válida.'),
});

// --- ACCIÓN DE CREAR ---
export async function createKart(payload: unknown) {
  const result = kartSchema.safeParse(payload);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }
  
  try {
    const response = await createKartInFirebase(result.data);
    if (!response.success) {
      throw new Error(response.error);
    }
    
    revalidatePath('/admin/karts');
    revalidatePath('/kart');
    return { success: true, message: 'Kart creado exitosamente.' };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// --- ACCIÓN DE ACTUALIZAR ---
export async function updateKart(id: string, payload: unknown) {
  if (!id) return { success: false, error: 'ID del kart no proporcionado.' };
  
  const result = kartSchema.safeParse(payload);
  if (!result.success) {
    return { success: false, error: result.error.flatten().fieldErrors };
  }
  
  try {
    const response = await updateKartInFirebase(id, result.data);
    if (!response.success) {
      throw new Error(response.error);
    }
    
    revalidatePath('/admin/karts');
    revalidatePath(`/admin/karts/edit/${id}`);
    revalidatePath('/kart');
    return { success: true, message: 'Kart actualizado exitosamente.' };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// --- ACCIÓN DE ELIMINAR ---
export async function deleteKart(id: string) {
  if (!id) return { success: false, error: 'ID del kart no proporcionado.' };
  
  try {
    const response = await deleteKartInFirebase(id);
    if (!response.success) {
      throw new Error(response.error);
    }
    
    revalidatePath('/admin/karts');
    revalidatePath('/kart');
    return { success: true, message: 'Kart eliminado exitosamente.' };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
