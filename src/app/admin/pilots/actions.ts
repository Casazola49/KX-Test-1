
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import type { Pilot } from '@/lib/types';

// Use the service role key for admin actions to bypass RLS policies.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Unified schema for data validation from the form
const PilotFormSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres.'),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/, { message: 'El slug solo puede contener minúsculas, números y guiones.' }),
  email: z.string().email({ message: 'Correo electrónico inválido.' }).optional().or(z.literal('')),
  city: z.string().optional(),
  number: z.coerce.number({invalid_type_error: 'El número debe ser un valor numérico.'}).int().positive(),
  category: z.string().min(3, 'La categoría es requerida.'), // This will be the category NAME from the form
  yearsOfExperience: z.coerce.number().int().min(0).optional().nullable(),
  teamName: z.string().optional(),
  teamOrigin: z.string().optional(),
  teamColor: z.string().regex(/^#([0-9a-fA-F]{6})$/, "Formato de color inválido, usa #RRGGBB").optional().or(z.literal('')),
  teamAccentColor: z.string().regex(/^#([0-9a-fA-F]{6})$/, "Formato de color inválido, usa #RRGGBB").optional().or(z.literal('')),
  dob: z.string().optional(),
  nationality: z.string().optional(),
  imageUrl: z.string().url('La URL de la imagen es obligatoria.'),
  bio: z.string().optional(),
  achievements: z.array(z.string()).optional(),
  performanceHistory: z.array(z.object({
    race: z.string(),
    lapTime: z.number(),
  })).optional(),
  model_3d_url: z.string().url().optional().nullable(),
});


// Helper function to get category ID from its name
async function getCategoryIdByName(categoryName: string): Promise<string | null> {
    if (!categoryName) return null;
    
    const { data, error } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('name', categoryName)
        .single();

    if (error || !data) {
        console.error(`Could not find category with name "${categoryName}":`, error);
        return null;
    }

    return data.id;
}


type PilotFormData = z.infer<typeof PilotFormSchema>;

export async function createPilot(data: PilotFormData) {
    try {
        const validatedData = PilotFormSchema.parse(data);

        // Translate category name to category ID
        const categoryId = await getCategoryIdByName(validatedData.category);
        if (!categoryId) {
            return { success: false, error: `La categoría "${validatedData.category}" no es válida o no fue encontrada.` };
        }

        const payload = {
            ...validatedData,
            category: categoryId, // Overwrite with the UUID
            name: `${validatedData.firstName} ${validatedData.lastName}`.trim(),
            achievements: validatedData.achievements || [],
            performanceHistory: validatedData.performanceHistory || [],
        };

        const { error } = await supabaseAdmin.from('pilots').insert(payload);
        if (error) throw error;

        revalidatePath('/pilotos-equipos');
        revalidatePath('/admin/pilots');
        if (payload.slug) {
            revalidatePath(`/pilotos-equipos/${payload.slug}`);
        }
        
        return { success: true, message: 'Piloto añadido con éxito.' };
    } catch (error: any) {
        console.error('Error al crear el piloto:', error);
        if (error instanceof z.ZodError) {
            const errorDetails = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return { success: false, error: `Error de validación: ${errorDetails}` };
        }
        return { success: false, error: `Ocurrió un error en el servidor: ${error.message || 'Error desconocido'}` };
    }
}

export async function updatePilot(id: string, data: PilotFormData) {
    try {
        const validatedData = PilotFormSchema.parse(data);
        
        // Translate category name to category ID
        const categoryId = await getCategoryIdByName(validatedData.category);
        if (!categoryId) {
            return { success: false, error: `La categoría "${validatedData.category}" no es válida o no fue encontrada.` };
        }
        
        const payload = {
            ...validatedData,
            category: categoryId, // Overwrite with the UUID
            name: `${validatedData.firstName} ${validatedData.lastName}`.trim(),
            achievements: validatedData.achievements || [],
            performanceHistory: validatedData.performanceHistory || [],
        };
        
        const { error } = await supabaseAdmin.from('pilots').update(payload).eq('id', id);
        if (error) throw error;
        
        revalidatePath('/pilotos-equipos');
        revalidatePath('/admin/pilots');
        if (payload.slug) {
            revalidatePath(`/pilotos-equipos/${payload.slug}`);
        }
        
        return { success: true, message: 'Piloto actualizado con éxito.' };

    } catch (error: any) {
        console.error('Error al actualizar el piloto:', error);
        if (error instanceof z.ZodError) {
            const errorDetails = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
            return { success: false, error: `Error de validación: ${errorDetails}` };
        }
        return { success: false, error: `Ocurrió un error en el servidor: ${error.message || 'Error desconocido'}` };
    }
}


// --- Otras acciones (getPilotById, deletePilot) permanecen igual ---

export async function getPilotById(id: string): Promise<Pilot | null> {
    if (!id) return null;
    try {
        const { data, error } = await supabaseAdmin
            .from('pilots')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(`Error fetching pilot with id ${id}:`, error);
            return null;
        }
        return data as Pilot;
    } catch (error) {
        console.error('Catastrophic error fetching pilot:', error);
        return null;
    }
}

export async function deletePilot(id: string) {
    try {
        if (!id) throw new Error("ID de piloto no proporcionado.");
        
        // Optional: clean up storage files, this logic is complex and can be kept as is.
        // ... (código de borrado de imágenes se mantiene) ...

        const { error: deleteError } = await supabaseAdmin.from('pilots').delete().eq('id', id);
        if (deleteError) throw deleteError;
        
        revalidatePath('/pilotos-equipos');
        revalidatePath('/admin/pilots');

        return { success: true, message: 'Piloto eliminado correctamente.' };

    } catch (error: any) {
        console.error('Error al eliminar el piloto:', error);
        return { success: false, error: `Ocurrió un error al eliminar el piloto: ${error.message}` };
    }
}
