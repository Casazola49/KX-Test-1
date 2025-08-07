
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

const ProductSchema = z.object({
  id: z.string().uuid().optional().or(z.literal('')),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres.').regex(/^[a-z0-9-]+$/, 'El slug solo puede contener minúsculas, números y guiones.'),
  brand: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo.").optional(),
  category: z.string().min(3, 'La categoría es requerida.'),
  department: z.string().optional(),
  contactUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url('La URL de la imagen principal es obligatoria.'),
  galleryImageUrls: z.array(z.string().url()).optional(),
  isFeatured: z.boolean().optional(),
});

export type ProductFormState = {
  message: string;
  errors?: z.ZodIssue[];
  success: boolean;
};

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function saveProduct(
  prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {

  const validatedFields = ProductSchema.safeParse({
    id: formData.get('id') || undefined,
    name: formData.get('name'),
    slug: formData.get('slug'),
    brand: formData.get('brand'),
    summary: formData.get('summary'),
    description: formData.get('description'),
    price: formData.get('price'),
    category: formData.get('category'),
    department: formData.get('department'),
    contactUrl: formData.get('contactUrl'),
    imageUrl: formData.get('imageUrl'),
    galleryImageUrls: JSON.parse(formData.get('galleryImageUrls') as string || '[]'),
    isFeatured: formData.get('isFeatured') === 'on',
  });

  if (!validatedFields.success) {
    console.error("Validation errors:", validatedFields.error.flatten().fieldErrors);
    return {
      message: 'Error de validación. Por favor, revisa los campos.',
      errors: validatedFields.error.issues,
      success: false,
    };
  }
  
  const { id, ...productData } = validatedFields.data;

  try {
    const payload: any = {
        name: productData.name,
        slug: productData.slug,
        brand: productData.brand,
        summary: productData.summary,
        description: productData.description,
        price: productData.price,
        category: productData.category,
        // CORRECTED: Convert 'general' to null for the database
        department: productData.department === 'general' ? null : productData.department,
        contact_url: productData.contactUrl,
        image_url: productData.imageUrl,
        gallery_image_urls: productData.galleryImageUrls,
        is_featured: productData.isFeatured,
    };

    if (id) {
      // Update
      const { error } = await supabaseAdmin.from('products').update(payload).eq('id', id);
      if (error) throw new Error(error.message);
    } else {
      // Create
      const { error } = await supabaseAdmin.from('products').insert(payload);
      if (error) throw new Error(error.message);
    }
    
    revalidatePath('/equipamiento-servicios');
    revalidatePath('/admin/products');

    return { message: `Producto ${id ? 'actualizado' : 'guardado'} con éxito.`, success: true };

  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Un error desconocido ocurrió.';
    return { message: `Error en la base de datos: ${errorMessage}`, success: false };
  }
}

export async function deleteProduct(id: string) {
    try {
        if (!id) throw new Error("ID de producto no proporcionado.");
        
        const { error } = await supabaseAdmin.from('products').delete().eq('id', id);
        if (error) throw error;
        
        revalidatePath('/admin/products');
        revalidatePath('/equipamiento-servicios');

        return { success: true, message: 'Producto eliminado correctamente.' };

    } catch (error: any) {
        return { success: false, error: `Ocurrió un error al eliminar el producto: ${error.message}` };
    }
}
