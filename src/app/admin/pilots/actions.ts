
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createPilot as createPilotFirebase, updatePilot as updatePilotFirebase, deletePilot as deletePilotFirebase, getPilotBySlug, getPilotById as getPilotByIdFirebase } from '@/lib/data-service';
import { FIXED_CATEGORIES } from '@/lib/categories';
import type { Pilot } from '@/lib/types';

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

// Helper function to get category ID from its name using fixed categories
function getCategoryIdByName(categoryName: string): string | null {
    if (!categoryName) return null;
    
    // Verificar que la categoría esté en la lista de categorías fijas
    if (FIXED_CATEGORIES.includes(categoryName as any)) {
        // Generar un ID consistente basado en el nombre
        return categoryName.toLowerCase().replace(/\s+/g, '-');
    }
    
    console.error(`Category "${categoryName}" is not in the fixed categories list`);
    return null;
}


type PilotFormData = z.infer<typeof PilotFormSchema>;

export async function createPilot(data: PilotFormData) {
    try {
        const validatedData = PilotFormSchema.parse(data);

        // Translate category name to category ID
        const categoryId = getCategoryIdByName(validatedData.category);
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

        const result = await createPilotFirebase(payload);
        if (!result.success) {
            throw new Error(result.error || 'Error al crear el piloto');
        }

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
        const categoryId = getCategoryIdByName(validatedData.category);
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
        
        const result = await updatePilotFirebase(id, payload);
        if (!result.success) {
            throw new Error(result.error || 'Error al actualizar el piloto');
        }
        
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
        return await getPilotByIdFirebase(id);
    } catch (error) {
        console.error('Error fetching pilot:', error);
        return null;
    }
}

export async function deletePilot(id: string) {
    try {
        if (!id) throw new Error("ID de piloto no proporcionado.");
        
        const result = await deletePilotFirebase(id);
        if (!result.success) {
            throw new Error(result.error || 'Error al eliminar el piloto');
        }
        
        revalidatePath('/pilotos-equipos');
        revalidatePath('/admin/pilots');

        return { success: true, message: 'Piloto eliminado correctamente.' };

    } catch (error: any) {
        console.error('Error al eliminar el piloto:', error);
        return { success: false, error: `Ocurrió un error al eliminar el piloto: ${error.message}` };
    }
}
