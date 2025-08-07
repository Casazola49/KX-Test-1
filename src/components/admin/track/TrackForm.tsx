
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import type { TrackInfo } from "@/lib/types";
import { saveTrack } from "@/app/admin/tracks/actions";

import { createClient } from '@supabase/supabase-js';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusCircle, Trash2, UploadCloud, ImagePlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import Image from "next/image";

// Schema for client-side validation
const TrackFormSchema = z.object({
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  location: z.string().min(3, { message: 'La ubicación es requerida.' }),
  description: z.string().optional(),
  length: z.string().optional(),
  width: z.string().optional(),
  curves: z.union([z.string().length(0), z.coerce.number().int().min(0)]).transform(val => val === '' ? undefined : val).optional(),
  altitude: z.string().optional(),
  record: z.string().optional(),
  max_speed: z.string().optional(),
  infrastructure: z.array(z.object({ value: z.string() })).optional(),
});

type TrackFormValues = z.infer<typeof TrackFormSchema>;

interface TrackFormProps {
    track?: TrackInfo;
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const IMAGE_BUCKET = 'kpx-images';

export default function TrackForm({ track }: TrackFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(track?.imageUrl || null);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>(track?.galleryImageUrls || []);

  const isEditing = !!track;

  const form = useForm<TrackFormValues>({
    resolver: zodResolver(TrackFormSchema),
    defaultValues: {
      name: track?.name || "",
      location: track?.location || "",
      description: track?.description || "",
      length: track?.length || "",
      width: track?.width || "",
      curves: track?.curves,
      altitude: track?.altitude || "",
      record: track?.record || "",
      max_speed: track?.max_speed || "",
      infrastructure: track?.infrastructure?.map(item => ({ value: item })) || [{ value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "infrastructure",
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
    const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
    const filePath = `track-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(IMAGE_BUCKET)
      .upload(filePath, file);

    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  };

  async function onSubmit(data: TrackFormValues) {
    setIsSubmitting(true);
    const { dismiss } = toast({ title: "Guardando Pista...", description: "Por favor espera." });

    try {
      let mainImageUrl = track?.imageUrl;
      if (mainImageFile) {
        mainImageUrl = await uploadFileToSupabase(mainImageFile);
      } else if (!isEditing) {
        throw new Error("La imagen principal es obligatoria para crear una nueva pista.");
      }

      let galleryImageUrls = track?.galleryImageUrls || [];
      if (galleryImageFiles.length > 0) {
        galleryImageUrls = await Promise.all(
          galleryImageFiles.map(file => uploadFileToSupabase(file))
        );
      }

      const payload = {
        id: track?.id,
        ...data,
        imageUrl: mainImageUrl!,
        galleryImageUrls: galleryImageUrls,
        infrastructure: data.infrastructure?.map(item => item.value).filter(Boolean) || [],
      };

      const result = await saveTrack(payload);

      if (!result.success) throw new Error(result.error || "Ocurrió un error en el servidor.");
      
      dismiss();
      toast({ title: "¡Éxito!", description: result.message });
      router.push('/admin/tracks');
      router.refresh();

    } catch (error: any) {
      dismiss();
      toast({ title: "Error al Guardar", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nombre de la Pista</FormLabel><FormControl><Input placeholder="Ej: Kartódromo de Arocagua" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Ubicación</FormLabel><FormControl><Input placeholder="Ej: Cochabamba, Bolivia" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea placeholder="Breve descripción de la pista..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FormField control={form.control} name="length" render={({ field }) => (<FormItem><FormLabel>Longitud</FormLabel><FormControl><Input placeholder="Ej: 1,200 metros" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="width" render={({ field }) => (<FormItem><FormLabel>Ancho</FormLabel><FormControl><Input placeholder="Ej: 8-10 metros" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="curves" render={({ field }) => (<FormItem><FormLabel>Curvas</FormLabel><FormControl><Input type="number" placeholder="Ej: 14" {...field} onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="altitude" render={({ field }) => (<FormItem><FormLabel>Altitud (msnm)</FormLabel><FormControl><Input placeholder="Ej: 2,558 msnm" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="record" render={({ field }) => (<FormItem><FormLabel>Récord de Pista</FormLabel><FormControl><Input placeholder="Ej: 0:52.123" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="max_speed" render={({ field }) => (<FormItem><FormLabel>Velocidad Máxima (aprox.)</FormLabel><FormControl><Input placeholder="Ej: 110 km/h" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>

        <div>
          <Label>Infraestructura</Label>
          <div className="space-y-2 mt-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <FormField control={form.control} name={`infrastructure.${index}.value`} render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input placeholder={`Característica #${index + 1}`} {...field} /></FormControl><FormMessage /></FormItem>)} />
                <Button type="button" variant="outline" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ value: "" })}><PlusCircle className="mr-2 h-4 w-4" />Añadir Característica</Button>
        </div>

        <div className="space-y-4">
            <FormItem>
              <FormLabel>Imagen Principal</FormLabel>
              <FormControl>
                <div className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors">
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      {mainImagePreview ? <Image src={mainImagePreview} alt="Vista previa" fill style={{objectFit: "contain"}} className="rounded-lg p-2" /> : <><UploadCloud className="w-10 h-10 text-muted-foreground mb-2" /><p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Haz clic para subir</span></p></>}
                   </div>
                   <Input id="main-image-input" type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleMainImageChange} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
            
            <FormItem>
              <FormLabel>Galería de Imágenes</FormLabel>
              <FormControl>
                <div className="relative flex flex-col items-center justify-center w-full min-h-[10rem] border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors p-4">
                    {galleryPreviews.length > 0 ? <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">{galleryPreviews.map((src, index) => (<div key={index} className="relative aspect-square"><Image src={src} alt={`Vista previa ${index+1}`} fill style={{objectFit: "cover"}} className="rounded-md" /></div>))}</div> : <div className="text-center"><ImagePlus className="w-10 h-10 text-muted-foreground mx-auto mb-2" /><p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Subir imágenes adicionales</span></p></div>}
                    <Input id="gallery-images-input" type="file" accept="image/*" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleGalleryImagesChange} />
                </div>
              </FormControl>
              <FormDescription>Al subir nuevas imágenes se reemplazarán las anteriores.</FormDescription>
              <FormMessage />
            </FormItem>
        </div>
        
        <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : (isEditing ? "Actualizar Pista" : "Guardar Pista")}
        </Button>
      </form>
    </Form>
  );
}
