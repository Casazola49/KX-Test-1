
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { saveNews } from '@/app/admin/add-news/actions';
import type { NewsArticle } from "@/lib/types";

import { createClient } from '@supabase/supabase-js';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { UploadCloud, Loader2, ImagePlus } from "lucide-react";

const NewsFormSchema = z.object({
  title: z.string().min(5, { message: 'El título debe tener al menos 5 caracteres.' }),
  slug: z.string().min(3, { message: 'El slug debe tener al menos 3 caracteres.' }).regex(/^[a-z0-9-]+$/, { message: 'El slug solo puede contener minúsculas, números y guiones.' }),
  summary: z.string().min(10, { message: 'El resumen debe tener al menos 10 caracteres.' }),
  category: z.string().min(3, { message: 'La categoría es requerida.' }),
  content: z.string().min(10, { message: 'El contenido debe tener al menos 10 caracteres.' }),
  isMain: z.boolean().default(false),
});

type NewsFormValues = z.infer<typeof NewsFormSchema>;

interface NewsFormProps {
    article?: NewsArticle;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const IMAGE_BUCKET = 'kpx-images';

export default function NewsForm({ article }: NewsFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(article?.imageUrl || null);
  
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(article?.galleryImageUrls || []);

  const isEditing = !!article;

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(NewsFormSchema),
    defaultValues: {
      title: article?.title || "",
      slug: article?.slug || "",
      summary: article?.summary || "",
      category: article?.category || "",
      content: article?.content || "",
      isMain: article?.isMain || false,
    },
  });

  const handleMainImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setGalleryImageFiles(newFiles);
      setGalleryPreviews(newFiles.map(file => URL.createObjectURL(file)));
    }
  };

  const uploadFileToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `news/${Date.now()}_${Math.random()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from(IMAGE_BUCKET).upload(fileName, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
  };

  async function onSubmit(data: NewsFormValues) {
    setIsSubmitting(true);
    toast({ title: "Guardando Noticia...", description: "Por favor espera." });

    try {
      let mainImageUrl = article?.imageUrl;
      if (mainImageFile) {
        mainImageUrl = await uploadFileToSupabase(mainImageFile);
      } else if (!isEditing) {
        throw new Error("La imagen principal es obligatoria para una nueva noticia.");
      }

      let finalGalleryImageUrls = article?.galleryImageUrls || [];
      if (galleryImageFiles.length > 0) {
        finalGalleryImageUrls = await Promise.all(
          galleryImageFiles.map(file => uploadFileToSupabase(file))
        );
      }
      
      const payload = {
        id: article?.id,
        ...data,
        imageUrl: mainImageUrl!, 
        galleryImageUrls: finalGalleryImageUrls,
      };

      const result = await saveNews(payload);
      if (!result.success) throw new Error(result.error);
      
      toast({ title: "¡Éxito!", description: result.message });
      router.push('/admin/news');
      router.refresh();

    } catch (error: any) {
      toast({ title: "Error al Guardar", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Título</FormLabel><FormControl><Input placeholder="Ej: Gran victoria en la carrera de..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="slug" render={({ field }) => (<FormItem><FormLabel>Slug (para la URL)</FormLabel><FormControl><Input placeholder="Ej: gran-victoria-carrera" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="summary" render={({ field }) => (<FormItem><FormLabel>Resumen</FormLabel><FormControl><Textarea placeholder="Un resumen corto de la noticia." {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="category" render={({ field }) => (<FormItem><FormLabel>Categoría</FormLabel><FormControl><Input placeholder="Ej: Nacional, Técnica, Entrevistas" {...field} /></FormControl><FormMessage /></FormItem>)} />

        <FormItem>
          <FormLabel>Imagen Principal</FormLabel>
          <FormControl>
            <div className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors">
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {mainImagePreview ? (<Image src={mainImagePreview} alt="Vista previa" fill style={{objectFit: "contain"}} className="rounded-lg p-2" />) : (<><UploadCloud className="w-10 h-10 text-muted-foreground mb-2" /><p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Haz clic para subir</span></p></>)}
               </div>
               <Input id="main-image-input" type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleMainImageChange} />
            </div>
          </FormControl>
          <FormDescription>{isEditing ? "Sube una nueva imagen para reemplazar la actual." : "Obligatorio."}</FormDescription>
        </FormItem>
        
        <FormItem>
          <FormLabel>Galería de Imágenes (Opcional)</FormLabel>
          <FormControl>
            <div className="relative flex flex-col items-center justify-center w-full min-h-[10rem] border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors p-4">
              {galleryPreviews.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                  {galleryPreviews.map((src, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image src={src} alt={`Vista previa ${index+1}`} fill style={{objectFit: "cover"}} className="rounded-md" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center">
                  <ImagePlus className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Subir imágenes adicionales</span></p>
                </div>
              )}
              <Input id="gallery-images-input" type="file" accept="image/*" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleGalleryImagesChange} />
            </div>
          </FormControl>
          <FormDescription>{isEditing ? "Subir nuevas imágenes reemplazará la galería anterior." : "Añade fotos extra para la noticia."}</FormDescription>
        </FormItem>

        <FormField control={form.control} name="content" render={({ field }) => (<FormItem><FormLabel>Contenido Completo</FormLabel><FormControl><Textarea placeholder="Escribe o pega el contenido completo de la noticia aquí..." rows={15} {...field} /></FormControl><FormDescription>Cada salto de línea se convertirá en un párrafo. No se necesita HTML.</FormDescription><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="isMain" render={({ field }) => (<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><div className="space-y-1 leading-none"><FormLabel>Noticia Principal</FormLabel><FormDescription>Marcar si debe aparecer destacada en la página de inicio.</FormDescription></div></FormItem>)} />
        
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : (isEditing ? "Actualizar Noticia" : "Guardar Noticia")}
        </Button>
      </form>
    </Form>
  );
}
