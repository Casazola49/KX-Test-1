
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createProduct, updateProduct, deleteProduct as deleteProductFromFirebase } from '@/lib/data-service';

const ProductSchema = z.object({
  id: z.string().uuid().optional().or(z.literal('')),
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres.').regex(/^[a-z0-9-]+$/, 'El slug solo puede contener minúsculas, números y guiones.'),
  brand: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo.").optional().nullable(),
  stock: z.coerce.number().min(0, "El stock no puede ser negativo.").optional().nullable(),
  category: z.string().min(3, 'La categoría es requerida.'),
  subcategory: z.string().optional(),
  department: z.string().optional(),
  contactUrl: z.string().url().optional().or(z.literal('')),
  imageUrl: z.string().url('La URL de la imagen principal es obligatoria.'),
  galleryImageUrls: z.array(z.string().url()).optional(),
  specifications: z.record(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  sponsorLevel: z.enum(['PLATINUM', 'GOLD', 'SILVER', 'BRONZE']).optional(),
  isFeatured: z.boolean().optional(),
});

export type ProductFormState = {
  message: string;
  errors?: z.ZodIssue[];
  success: boolean;
};

// Removed supabaseAdmin - now using Firebase data-service

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
    stock: formData.get('stock'),
    category: formData.get('category'),
    subcategory: formData.get('subcategory'),
    department: formData.get('department'),
    contactUrl: formData.get('contactUrl'),
    imageUrl: formData.get('imageUrl'),
    galleryImageUrls: JSON.parse(formData.get('galleryImageUrls') as string || '[]'),
    specifications: formData.get('specifications') ? JSON.parse(formData.get('specifications') as string) : undefined,
    tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : undefined,
    sponsorLevel: formData.get('sponsorLevel') || undefined,
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
        stock: productData.stock || 0,
        category: productData.category,
        subcategory: productData.subcategory,
        department: productData.department === 'General' ? 'General' : productData.department,
        contact_url: productData.contactUrl,
        image_url: productData.imageUrl,
        gallery_images: productData.galleryImageUrls,
        specifications: productData.specifications,
        tags: productData.tags,
        sponsor_level: productData.sponsorLevel,
        is_featured: productData.isFeatured,
    };

    if (id) {
      // Update
      const result = await updateProduct(id, payload);
      if (!result.success) throw new Error(result.error);
    } else {
      // Create
      const result = await createProduct(payload);
      if (!result.success) throw new Error(result.error);
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
        
        const result = await deleteProductFromFirebase(id);
        if (!result.success) throw new Error(result.error);
        
        revalidatePath('/admin/products');
        revalidatePath('/equipamiento-servicios');

        return { success: true, message: 'Producto eliminado correctamente.' };

    } catch (error: any) {
        return { success: false, error: `Ocurrió un error al eliminar el producto: ${error.message}` };
    }
}
