"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { saveGalleryItem } from '@/app/admin/gallery/actions';
import type { GalleryItem, RaceEvent } from "@/lib/types";
import { supabase } from "@/lib/supabase-client";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UploadCloud } from "lucide-react";
import Image from "next/image";

// Función para generar un slug a partir de un texto
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')           // Reemplaza espacios con -
    .replace(/[^\w\-]+/g, '')       // Elimina caracteres no válidos
    .replace(/\-\-+/g, '-')         // Reemplaza múltiples - con uno solo
    .replace(/^-+/, '')             // Elimina - del inicio
    .replace(/-+$/, '');            // Elimina - del final
};

// Esquema para validar los datos del formulario
const FormSchema = z.object({
  title: z.string().min(3, "El título es obligatorio y debe tener al menos 3 caracteres."),
  description: z.string().optional(),
  alt: z.string().optional(),
  eventId: z.string(),
  tags: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

interface GalleryItemFormProps {
    item?: GalleryItem;
    events: RaceEvent[];
}

const BUCKET_NAME = 'kpx-images';

export default function GalleryItemForm({ item, events }: GalleryItemFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(item?.src || null);
  
  const isEditing = !!item;

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: item?.title || "",
      description: item?.description || "",
      alt: item?.description || item?.title || "",
      eventId: item?.eventId || 'none',
      tags: item?.tags?.join(', ') || '',
    },
  });

  // Ya no se usa slug (la tabla no lo tiene)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const uploadFileToSupabase = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `gallery/${Date.now()}_${Math.random()}.${fileExt}`;
    const { error, data } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file);
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);
    return publicUrl;
  };

  async function onSubmit(data: FormValues) {
    if (!isEditing && !mediaFile) {
      toast({ title: "Error", description: "Debes seleccionar una imagen para subir.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    toast({ title: "Guardando...", description: "Por favor espera." });

    try {
      let imageUrl = item?.src;
      if (mediaFile) {
        imageUrl = await uploadFileToSupabase(mediaFile);
      }
      
       const payload = {
        id: item?.id,
         title: data.title,
        src: imageUrl,
         description: data.description,
         alt: data.alt && data.alt.trim().length > 0 ? data.alt : data.title,
        eventId: data.eventId === 'none' ? null : data.eventId,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
         type: 'image',
      };

      const result = await saveGalleryItem(payload);

      if (!result.success) {
          throw new Error(result.error);
      }
      
      toast({ title: "¡Éxito!", description: result.message });
      router.push('/admin/gallery');
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
        
        <FormItem>
          <FormLabel>Archivo de Imagen</FormLabel>
          <FormControl>
            <div className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                  {mediaPreview ? (
                     <Image src={mediaPreview} alt="Vista previa" fill style={{objectFit: "contain"}} className="rounded-lg" />
                  ) : (
                    <>
                      <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
                      <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Haz clic para subir</span></p>
                    </>
                  )}
               </div>
               <Input id="media-input" type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
            </div>
          </FormControl>
          <FormDescription>{isEditing ? "Sube un nuevo archivo para reemplazar el actual." : "Este campo es obligatorio."}</FormDescription>
        </FormItem>

        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Título</FormLabel><FormControl><Input placeholder="Ej: Podio de la carrera de Sucre" {...field} /></FormControl><FormMessage /></FormItem>)} />
        
        {/* slug eliminado */}
        
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Fotógrafo (Opcional)</FormLabel><FormControl><Input placeholder="Nombre del fotógrafo" {...field} /></FormControl></FormItem>)} />

        <FormField control={form.control} name="alt" render={({ field }) => (<FormItem><FormLabel>Texto alternativo (ALT)</FormLabel><FormControl><Input placeholder="Descripción corta de la imagen (mejora SEO y accesibilidad)" {...field} /></FormControl><FormDescription>Si lo dejas vacío, se usará el título.</FormDescription></FormItem>)} />
        
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Etiquetas (Opcional)</FormLabel>
              <FormControl>
                <Input placeholder="pista, piloto, evento, etc..." {...field} />
              </FormControl>
              <FormDescription>
                Escribe las etiquetas separadas por comas.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="eventId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Evento Asociado (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un evento..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Sin evento asociado</SelectItem>
                  {events.map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : (isEditing ? "Actualizar Elemento" : "Añadir a Galería")}
        </Button>
      </form>
    </Form>
  );
}
