
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { 
  createMechanic, 
  updateMechanic, 
  deleteMechanic as deleteMechanicFromFirebase 
} from '@/lib/data-service';

// Zod Schema for server-side validation with robust URL handling
const MechanicSchema = z.object({
  id: z.string().uuid().optional().or(z.literal('')),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  department: z.string().min(3, { message: 'El departamento es requerido.' }),
  description: z.string().optional(),
  
  // THE DEFINITIVE FIX: Explicitly allow an empty string OR a valid URL
  website_url: z.string().url("La URL del sitio web no es válida.").or(z.literal('')),
  image_url: z.string().url("La URL de la imagen no es válida.").or(z.literal('')),
});

export type MechanicFormState = {
  message: string;
  errors?: z.ZodIssue[];
  success: boolean;
};

// Migrado a Firebase - ya no usa Supabase

export async function saveMechanic(
  prevState: MechanicFormState,
  formData: FormData
): Promise<MechanicFormState> {
  
  const dataToValidate = {
    id: formData.get('id') || '',
    name: formData.get('name') || '',
    department: formData.get('department') || '',
    description: formData.get('description') || '',
    website_url: formData.get('website_url') || '',
    image_url: formData.get('image_url') || '',
  };

  const validatedFields = MechanicSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    const errorSummary = validatedFields.error.errors
      .map(e => `${e.path.join('.')}: ${e.message}`)
      .join('; ');

    console.error("Validation errors:", errorSummary);
    return {
      message: `Error de validación: ${errorSummary}. Por favor, revisa los campos.`,
      errors: validatedFields.error.issues,
      success: false,
    };
  }
  
  const { id, ...mechanicData } = validatedFields.data;
  
  const payload: { [key: string]: any } = {};
  if (mechanicData.name) payload.name = mechanicData.name;
  if (mechanicData.department) payload.department = mechanicData.department;
  if (mechanicData.description) payload.description = mechanicData.description;
  if (mechanicData.website_url) payload.website_url = mechanicData.website_url;
  if (mechanicData.image_url) payload.image_url = mechanicData.image_url;

  try {
    if (id) {
      await updateMechanic(id, payload);
    } else {
      await createMechanic(payload);
    }
    
    revalidatePath('/equipamiento-servicios/asesoramiento');
    revalidatePath('/admin/mechanics');

    return { message: `Asesor ${id ? 'actualizado' : 'guardado'} con éxito.`, success: true };

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Un error desconocido ocurrió.';
    return { message: `Error en la base de datos: ${errorMessage}`, success: false };
  }
}

export async function deleteMechanic(id: string) {
    if (!id) {
        return { success: false, message: "ID de mecánico no proporcionado." };
    }
    try {
        await deleteMechanicFromFirebase(id);
        
        revalidatePath('/admin/mechanics');
        revalidatePath('/equipamiento-servicios/asesoramiento');

        return { success: true, message: 'Mecánico eliminado correctamente.' };

    } catch (error: any) {
        return { success: false, message: `Ocurrió un error al eliminar el mecánico: ${error.message}` };
    }
}
