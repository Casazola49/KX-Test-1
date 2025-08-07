
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';
import type { Kart } from '@/lib/types';
import { createKart, updateKart } from '@/app/admin/karts/actions';

// Esquema de validación del formulario
const FormSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  category: z.string().min(3, 'La categoría es obligatoria.'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof FormSchema>;

interface KartFormProps {
  kart?: Kart; // El componente ahora acepta un kart existente para edición
}

// Cliente de Supabase para el navegador (solo para subir archivos)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function KartForm({ kart }: KartFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [modelFileName, setModelFileName] = useState<string | null>(kart?.model_url ? kart.model_url.split('/').pop()! : null);

  const isEditing = !!kart; // Determinamos si estamos en modo edición

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: kart?.name || '',
      category: kart?.category || '',
      description: kart?.description || '',
    },
  });

  // ... (handleFileChange y uploadModel se mantienen igual)
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.glb')) {
      setModelFile(file);
      setModelFileName(file.name);
    } else {
      setModelFile(null);
      setModelFileName(null);
      toast({
        title: 'Archivo no válido',
        description: 'Por favor, selecciona un archivo con formato .glb.',
        variant: 'destructive',
      });
    }
  };

  const uploadModel = async (): Promise<string> => {
    if (!modelFile) {
      throw new Error('No se ha seleccionado ningún archivo de modelo.');
    }
    const fileName = `karts/${Date.now()}-${modelFile.name}`;
    const { error } = await supabase.storage.from('karts').upload(fileName, modelFile);
    if (error) {
      throw new Error(`Error al subir el modelo: ${error.message}`);
    }
    const { data } = supabase.storage.from('karts').getPublicUrl(fileName);
    return data.publicUrl;
  };


  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    toast({ title: isEditing ? 'Actualizando Kart...' : 'Guardando Kart...' });
    try {
      let modelUrl = kart?.model_url;

      if (modelFile) {
        modelUrl = await uploadModel();
      }

      if (!modelUrl) {
        throw new Error('El modelo 3D (.glb) es obligatorio.');
      }

      const payload = { ...data, model_url: modelUrl };
      
      const result = isEditing
        ? await updateKart(kart.id, payload)
        : await createKart(payload);

      if (!result.success) {
        // Mejoramos el manejo de errores para mostrar detalles si están disponibles
        const errorMessage = typeof result.error === 'string' ? result.error : JSON.stringify(result.error);
        throw new Error(errorMessage);
      }

      toast({
        title: '¡Éxito!',
        description: `El kart "${data.name}" se ha guardado correctamente.`,
      });
      router.push('/admin/karts');
      router.refresh();
    } catch (error: any) {
      toast({
        title: 'Error al guardar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Kart</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Kart Profesional 125cc" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Profesional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe brevemente el kart o la categoría." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormLabel>Archivo del Modelo 3D (.glb)</FormLabel>
            <FormControl>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-input px-6 py-10">
                <div className="text-center">
                  <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary-focus"
                    >
                      <span>Sube un archivo</span>
                      <Input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".glb" onChange={handleFileChange} />
                    </label>
                    <p className="pl-1">o arrástralo aquí</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">Solo archivos .glb de hasta 10MB</p>
                  {modelFileName && <p className="text-sm font-semibold text-green-600 mt-2">{modelFileName}</p>}
                </div>
              </div>
            </FormControl>
          </div>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Actualizar Kart' : 'Guardar Kart'}
        </Button>
      </form>
    </Form>
  );
}
