
"use client";

import { useFormState } from 'react-dom';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveProduct } from '@/app/admin/products/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2, UploadCloud, ImagePlus } from 'lucide-react';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Product {
  id?: string;
  name: string;
  slug: string;
  brand?: string | null;
  summary?: string | null;
  description?: string | null;
  price?: number | null;
  category: string;
  department?: string | null;
  image_url?: string | null;
  gallery_image_urls?: string[] | null;
  is_featured?: boolean | null;
  contact_url?: string | null;
  created_at?: string;
}

const FormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  slug: z.string().min(3, { message: 'El slug debe tener al menos 3 caracteres.' }).regex(/^[a-z0-9-]+$/, { message: 'El slug solo puede contener minúsculas, números y guiones.' }),
  brand: z.string().optional(),
  category: z.string().min(3, { message: 'La categoría es requerida.' }),
  department: z.string().optional(),
  price: z.coerce.number().min(0, "El precio no puede ser negativo.").optional(),
  contactUrl: z.string().url({ message: "Por favor, introduce una URL válida." }).optional().or(z.literal('')),
  summary: z.string().optional(),
  description: z.string().optional(),
  isFeatured: z.boolean().default(false),
});

type FormValues = z.infer<typeof FormSchema>;

interface ProductFormProps {
  product?: Product;
}
type ProductFormState = {
  message: string;
  errors?: z.ZodIssue[];
  success: boolean;
};

const departments = ['Cochabamba', 'Santa Cruz', 'La Paz', 'Chuquisaca', 'Potosi', 'Oruro', 'Tarija'];

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(product?.image_url || null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(product?.gallery_image_urls || []);
  const [isUploading, setIsUploading] = useState(false);

  const initialState: ProductFormState = { message: '', success: false };
  const [state, formAction] = useFormState(saveProduct, initialState);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id: product?.id,
      name: product?.name || "",
      slug: product?.slug || "",
      brand: product?.brand || "",
      summary: product?.summary || "",
      description: product?.description || "",
      price: product?.price || undefined,
      category: product?.category || "",
      department: product?.department || "general", // CORRECTED: Use non-empty default
      contactUrl: product?.contact_url || "",
      isFeatured: product?.is_featured || false,
    },
  });

   useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({ title: "¡Éxito!", description: state.message });
        router.push('/admin/products');
      } else {
        toast({ title: "Error", description: state.message, variant: 'destructive' });
      }
    }
  }, [state, toast, router]);
  
  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `product-images/${Date.now()}_${Math.random()}.${fileExt}`;
    const { error, data } = await supabase.storage.from('kpx-images').upload(fileName, file);
    if (error) throw error;
    return supabase.storage.from('kpx-images').getPublicUrl(data.path).data.publicUrl;
  };

  const handleFormSubmit = async (data: FormValues) => {
    setIsUploading(true);
    toast({ title: "Guardando producto...", description: "Subiendo imágenes, por favor espera." });

    try {
      let mainImageUrl = product?.image_url;
      if (mainImageFile) {
        mainImageUrl = await uploadFile(mainImageFile);
      }
      if (!mainImageUrl) throw new Error("La imagen principal es obligatoria.");

      let galleryImageUrls = product?.gallery_image_urls || [];
      if (galleryImageFiles.length > 0) {
        galleryImageUrls = await Promise.all(galleryImageFiles.map(file => uploadFile(file)));
      }

      const formData = new FormData(formRef.current!);
      formData.set('imageUrl', mainImageUrl);
      formData.set('galleryImageUrls', JSON.stringify(galleryImageUrls));
      
      if (data.department) {
        formData.set('department', data.department);
      }

      formAction(formData);

    } catch (error: any) {
      toast({ title: "Error de Subida", description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <input type="hidden" name="id" value={product?.id || ''} />
        
        <Card>
            <CardHeader><CardTitle>Información Básica</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nombre del Producto</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="slug" render={({ field }) => (<FormItem><FormLabel>Slug (URL)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="brand" render={({ field }) => (<FormItem><FormLabel>Marca</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Categoría</FormLabel><FormControl><Input {...field} placeholder="Ej: repuestos, seguridad, filtros" /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Precio</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>)} />
                
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || 'general'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un departamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="general">General (Sin departamento)</SelectItem> 
                          {departments.map(dept => (
                            <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>Asigna este producto a un departamento específico.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField control={form.control} name="contactUrl" render={({ field }) => (<FormItem><FormLabel>Enlace de Contacto (WhatsApp, etc.)</FormLabel><FormControl><Input {...field} placeholder="https://wa.me/591..." /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader><CardTitle>Detalles y Descripción</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <FormField control={form.control} name="summary" render={({ field }) => (<FormItem><FormLabel>Resumen</FormLabel><FormControl><Textarea {...field} placeholder="Una descripción corta para la tarjeta del producto."/></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descripción Completa</FormLabel><FormControl><Textarea rows={6} {...field} placeholder="Descripción detallada para la página del producto." /></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
        </Card>

        <Card>
            <CardHeader><CardTitle>Imágenes</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                 <FormItem>
                  <FormLabel>Imagen Principal</FormLabel>
                   <FormControl>
                    <div className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                       {mainImagePreview ? <Image src={mainImagePreview} alt="Vista previa" fill style={{objectFit: "contain"}} className="p-2" /> : <UploadCloud className="w-10 h-10 text-muted-foreground" />}
                       <Input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0" onChange={(e) => {
                         const file = e.target.files?.[0];
                         if(file) { setMainImageFile(file); setMainImagePreview(URL.createObjectURL(file));}
                       }} />
                    </div>
                  </FormControl>
                </FormItem>
                 <FormItem>
                  <FormLabel>Galería de Imágenes</FormLabel>
                   <FormControl>
                    <div className="relative flex flex-col items-center justify-center w-full min-h-[10rem] border-2 border-dashed rounded-lg p-4 bg-card hover:bg-muted">
                        {galleryPreviews.length > 0 ? (
                           <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">{galleryPreviews.map((src, i) => <div key={i} className="relative aspect-square"><Image src={src} alt={`preview ${i}`} fill className="object-cover rounded-md" /></div>)}</div>
                        ) : <ImagePlus className="w-10 h-10 text-muted-foreground" />}
                       <Input type="file" accept="image/*" multiple className="absolute inset-0 w-full h-full opacity-0" onChange={(e) => {
                         const files = Array.from(e.target.files || []);
                         setGalleryImageFiles(files); setGalleryPreviews(files.map(f => URL.createObjectURL(f)));
                       }}/>
                    </div>
                  </FormControl>
                </FormItem>
            </CardContent>
        </Card>

         <Card>
            <CardHeader><CardTitle>Opciones Adicionales</CardTitle></CardHeader>
            <CardContent>
                <FormField control={form.control} name="isFeatured" render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                            <FormLabel className="text-base">Producto Destacado</FormLabel>
                            <FormDescription>Si se activa, este producto podría aparecer en la página de inicio.</FormDescription>
                        </div>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} name={field.name} /></FormControl>
                    </FormItem>
                )} />
            </CardContent>
        </Card>

        <Button type="submit" disabled={isUploading}>
          {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : (product ? 'Actualizar Producto' : 'Crear Producto')}
        </Button>
      </form>
    </Form>
  );
}
