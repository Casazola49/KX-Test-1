
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useFormState } from 'react-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { saveMechanic } from '@/app/admin/mechanics/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Mechanic } from '@/lib/types';
import { uploadToCloudinary } from '@/lib/cloudinary';

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, UploadCloud } from 'lucide-react';
import Image from 'next/image';

const FormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  department: z.string().min(1, { message: 'Debes seleccionar un departamento.' }),
  description: z.string().optional(),
  website_url: z.union([
    z.string().url({ message: 'Debe ser una URL válida' }),
    z.literal(''),
    z.undefined()
  ]).optional(),
  image_url: z.union([
    z.string().url({ message: 'Debe ser una URL válida' }),
    z.literal(''),
    z.undefined()
  ]).optional(),
});

type FormValues = z.infer<typeof FormSchema>;
interface MechanicFormProps { mechanic?: Mechanic; }
type MechanicFormState = { message: string; errors?: z.ZodIssue[]; success: boolean; };
const departments = ['General', 'Cochabamba', 'La Paz', 'Santa Cruz', 'Oruro', 'Potosi', 'Chuquisaca', 'Tarija'];

export default function MechanicForm({ mechanic }: MechanicFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(mechanic?.image_url || null);
  const [isUploading, setIsUploading] = useState(false);

  const initialState: MechanicFormState = { message: '', success: false };
  const [state, formAction] = useFormState(saveMechanic, initialState);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id: mechanic?.id,
      name: mechanic?.name || "",
      department: mechanic?.department || "",
      description: mechanic?.description || "",
      website_url: mechanic?.website_url || "",
      image_url: mechanic?.image_url || "",
    },
  });

  useEffect(() => {
    if (state.message) {
      setIsUploading(false);
      if (state.success) {
        toast({ title: "¡Éxito!", description: state.message });
        router.push('/admin/mechanics');
      } else {
        toast({ title: "Error", description: state.message, variant: 'destructive' });
      }
    }
  }, [state, toast, router]);

  const uploadFile = async (file: File): Promise<string> => {
    try {
      const url = await uploadToCloudinary(file, 'mechanic-logos');
      return url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Error al subir el archivo');
    }
  };

  // THE DEFINITIVE FIX: Build FormData from react-hook-form's state, not the DOM
  const handleFormSubmit = async (data: FormValues) => {
    setIsUploading(true);
    
    try {
      let imageUrl = mechanic?.image_url;
      if (imageFile) {
        toast({ title: "Subiendo imagen...", description: "Por favor espera." });
        imageUrl = await uploadFile(imageFile);
      }
      
      const formData = new FormData();
      // Append data from react-hook-form's state (the source of truth)
      for (const key in data) {
          const value = data[key as keyof FormValues];
          if (value) {
            formData.append(key, value as string);
          }
      }
      if (imageUrl) {
        formData.set('image_url', imageUrl); // Use set to overwrite if needed
      }
      
      formAction(formData);

    } catch (error: any) {
      toast({ title: "Error de Subida", description: error.message, variant: 'destructive' });
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      {/* Use handleSubmit from react-hook-form, not a manual ref */}
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <FormField control={form.control} name="id" render={({ field }) => <input type="hidden" {...field} />} />
        
        <Card>
            <CardHeader><CardTitle>Información del Asesor Mecánico</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Nombre del Asesor/Taller</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="department" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Departamento / Tipo de Servicio</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecciona una opción" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="General">General (Aparece en todos los departamentos)</SelectItem>
                              {departments.slice(1).map(dept => <SelectItem key={dept} value={dept}>{dept}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            "General" hace que el asesor aparezca en todos los departamentos. 
                            Departamentos específicos solo aparecen en su departamento + asesores generales.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="website_url" render={({ field }) => (<FormItem><FormLabel>Sitio Web o Red Social</FormLabel><FormControl><Input {...field} placeholder="https://..."/></FormControl><FormMessage /></FormItem>)} />
                </div>

                <FormItem>
                  <FormLabel>Logo o Imagen</FormLabel>
                  <FormControl>
                    <div className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted">
                       {imagePreview ? <Image src={imagePreview} alt="Vista previa" fill style={{objectFit: "contain"}} className="p-2" /> : <UploadCloud className="w-10 h-10 text-muted-foreground" />}
                       <Input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0" onChange={(e) => {
                         const file = e.target.files?.[0];
                         if(file) { setImageFile(file); setImagePreview(URL.createObjectURL(file));}
                       }} />
                    </div>
                  </FormControl>
                </FormItem>

                <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Descripción Breve</FormLabel><FormControl><Textarea {...field} placeholder="Una breve descripción del servicio que ofrece."/></FormControl><FormMessage /></FormItem>)} />
            </CardContent>
        </Card>

        <Button type="submit" disabled={isUploading}>
          {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</> : (mechanic ? 'Actualizar Asesor' : 'Crear Asesor')}
        </Button>
      </form>
    </Form>
  );
}
