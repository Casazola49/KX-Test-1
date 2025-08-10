
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { createPilot, updatePilot } from '@/app/admin/pilots/actions';
import type { Pilot } from "@/lib/types";

import { createClient } from '@supabase/supabase-js';
import type { Category } from '@/lib/types';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { UploadCloud, PlusCircle, Trash2, User, Car, Flag, Palette, Loader2, Timer, Box } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// Client-side validation schema
const PilotFormSchema = z.object({
  firstName: z.string().min(2, { message: 'El nombre debe tener al menos 2 caracteres.' }),
  lastName: z.string().min(2, { message: 'El apellido debe tener al menos 2 caracteres.' }),
  slug: z.string().min(3, { message: 'El slug debe tener al menos 3 caracteres.' }).regex(/^[a-z0-9-]+$/, { message: 'El slug solo puede contener minúsculas, números y guiones.' }),
  email: z.string().email({ message: 'Correo electrónico inválido.' }).optional().or(z.literal('')),
  city: z.string().optional(),
  number: z.coerce.number({invalid_type_error: 'El número de auto es obligatorio.'}).int().positive({ message: 'El número de auto debe ser un entero positivo.' }),
  category: z.string().min(3, { message: 'La categoría es requerida.' }),
  yearsOfExperience: z.coerce.number().int().min(0).optional().nullable(),
  teamName: z.string().optional(),
  teamOrigin: z.string().optional(),
  teamColor: z.string().regex(/^#([0-9a-fA-F]{6})$/, "Formato de color inválido, usa #RRGGBB").optional().or(z.literal('')),
  teamAccentColor: z.string().regex(/^#([0-9a-fA-F]{6})$/, "Formato de color inválido, usa #RRGGBB").optional().or(z.literal('')),
  dob: z.string().optional(),
  nationality: z.string().optional(),
  bio: z.string().optional(),
  achievements: z.array(z.object({ value: z.string() })).optional(),
  performanceHistory: z.array(z.object({
      race: z.string(),
      lapTime: z.coerce.number(),
  })).optional(),
  // NOTE: model_3d_url and imageUrl are handled via state, not direct form control.
});

type PilotFormValues = z.infer<typeof PilotFormSchema>;

interface PilotFormProps {
    pilot?: Pilot;
}

const SectionTitle: React.FC<{ icon: React.ElementType; title: string }> = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 mb-4">
    <Icon className="w-6 h-6 text-primary" />
    <h3 className="text-xl font-semibold text-foreground">{title}</h3>
  </div>
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const IMAGE_BUCKET = 'kpx-images';
const KART_BUCKET = 'karts';


export default function PilotFormV2({ pilot }: PilotFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(pilot?.imageUrl || null);
  const [kartModelFile, setKartModelFile] = useState<File | null>(null);
  const [kartModelName, setKartModelName] = useState<string | null>(pilot?.model_3d_url ? pilot.model_3d_url.split('/').pop()! : null);

  // Lista por defecto en caso de que aún no exista la tabla o falle la carga
  const DEFAULT_CATEGORY_OPTIONS = useMemo(
    () => [
      '100cc JUNIOR',
      '125cc PROFESIONAL',
      'BABY KART',
      'F200 STANDARD',
      'F200 SUPER',
      'F200 MASTER',
      'INFANTIL 65',
      'MASTER X30',
      'MINI 60',
      'PROFESIONAL T35',
      'VORTEX 100',
      'F390',
    ],
    []
  );

  const [categoryOptions, setCategoryOptions] = useState<string[]>(DEFAULT_CATEGORY_OPTIONS);

  const isEditing = !!pilot;

  const form = useForm<PilotFormValues>({
    resolver: zodResolver(PilotFormSchema),
    defaultValues: {
      firstName: pilot?.firstName || "",
      lastName: pilot?.lastName || "",
      slug: pilot?.slug || "",
      email: pilot?.email || "",
      city: pilot?.city || "",
      number: pilot?.number ?? ('' as any),
      category: pilot?.category || "",
      yearsOfExperience: pilot?.yearsOfExperience ?? null,
      teamName: pilot?.teamName || "",
      teamOrigin: pilot?.teamOrigin || "",
      teamColor: pilot?.teamColor || "#222222",
      teamAccentColor: pilot?.teamAccentColor || "#9ACD32",
      dob: pilot?.dob || "",
      nationality: pilot?.nationality || "bo",
      bio: pilot?.bio || "",
      achievements: pilot?.achievements?.map(ach => ({ value: ach })) || [{ value: "" }],
      performanceHistory: pilot?.performanceHistory?.map(ph => ({ race: ph.race, lapTime: ph.lapTime })) || [],
    },
  });

  // Cargar categorías desde la BD para poblar el selector
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('name')
          .order('name', { ascending: true });
        if (error) throw error;
        const names = (data as Category[]).map(c => c.name).filter(Boolean);
        // Asegurar que la categoría del piloto en edición esté presente
        const withEditing = pilot?.category && !names.includes(pilot.category)
          ? [...names, pilot.category]
          : names;
        setCategoryOptions(withEditing.length > 0 ? withEditing : DEFAULT_CATEGORY_OPTIONS);
      } catch {
        // Si falla, mantenemos las opciones por defecto
        setCategoryOptions(prev => {
          if (pilot?.category && !prev.includes(pilot.category)) return [...prev, pilot.category];
          return prev;
        });
      }
    };
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { fields: achievementFields, append: appendAchievement, remove: removeAchievement } = useFieldArray({
    control: form.control,
    name: "achievements",
  });

  const { fields: performanceFields, append: appendPerformance, remove: removePerformance } = useFieldArray({
    control: form.control,
    name: "performanceHistory",
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleKartModelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.glb')) {
      setKartModelFile(file);
      setKartModelName(file.name);
    } else {
      toast({
        title: "Archivo no válido",
        description: "Por favor, selecciona un archivo con formato .glb.",
        variant: "destructive"
      });
    }
  };

  const uploadFileToSupabase = async (file: File, bucket: string, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  async function onSubmit(data: PilotFormValues) {
    setIsSubmitting(true);
    toast({
        title: "Guardando Piloto...",
        description: "Por favor espera mientras se procesa la información."
    });

    try {
      let finalImageUrl = pilot?.imageUrl;
      if (imageFile) {
        finalImageUrl = await uploadFileToSupabase(imageFile, IMAGE_BUCKET, 'pilot-images');
      }

      if (!isEditing && !finalImageUrl) {
        throw new Error("La imagen del piloto es obligatoria.");
      }

      let finalKartModelUrl = pilot?.model_3d_url;
      if (kartModelFile) {
        finalKartModelUrl = await uploadFileToSupabase(kartModelFile, KART_BUCKET, 'karts');
      }

      const achievementsArray = data.achievements?.map(a => a.value).filter(Boolean) || [];
      const performanceHistoryArray = data.performanceHistory?.filter(p => p.race && p.lapTime).map(p => ({ race: p.race, lapTime: Number(p.lapTime) })) || [];

      const payload = {
        ...data,
        imageUrl: finalImageUrl!,
        model_3d_url: finalKartModelUrl,
        achievements: achievementsArray,
        performanceHistory: performanceHistoryArray,
      };

      const result = isEditing && pilot
        ? await updatePilot(pilot.id, payload)
        : await createPilot(payload);

      if (!result.success) {
        throw new Error(result.error || "Ocurrió un error desconocido en el servidor.");
      }

      toast({ title: "¡Éxito!", description: result.message });
      router.push('/admin/pilots');
      router.refresh();

    } catch (error: any) {
      toast({ title: "Error al Guardar", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-4">
                {/* Corrected: Removed FormField wrapper as this is not part of the schema */}
                <FormItem>
                  <FormLabel className="text-base font-semibold">Foto del Piloto</FormLabel>
                  <FormControl>
                    <div className="relative flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors">
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          {imagePreview ? (
                            <Image src={imagePreview} alt="Vista previa" fill style={{objectFit: "contain"}} className="rounded-lg p-2" />
                          ) : (
                            <>
                              <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
                              <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Haz clic para subir</span></p>
                              <p className="text-xs text-muted-foreground">PNG (MAX. 5MB)</p>
                            </>
                          )}
                       </div>
                       <Input id="pilot-image-input" type="file" accept="image/png, image/jpeg, image/webp" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isSubmitting} onChange={handleImageChange} />
                    </div>
                  </FormControl>
                  <FormDescription>{isEditing ? "Sube una nueva imagen para reemplazar la actual." : "Imagen obligatoria."}</FormDescription>
                </FormItem>

                {/* Corrected: Removed FormField wrapper as this is not part of the schema */}
                <FormItem>
                    <FormLabel className="text-base font-semibold">Modelo 3D del Kart</FormLabel>
                    <FormControl>
                        <div className="relative flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted transition-colors">
                            <div className="flex flex-col items-center justify-center text-center">
                                <Box className="w-10 h-10 text-muted-foreground mb-2" />
                                {kartModelName ? (
                                    <>
                                        <p className="mb-2 text-sm font-semibold text-foreground">Archivo Seleccionado:</p>
                                        <p className="text-xs text-muted-foreground break-all">{kartModelName}</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Haz clic para subir el modelo</span></p>
                                        <p className="text-xs text-muted-foreground">Archivo .GLB (MAX. 10MB)</p>
                                    </>
                                )}
                            </div>
                            <Input
                                id="kart-model-input"
                                type="file"
                                accept=".glb"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isSubmitting}
                                onChange={handleKartModelChange}
                            />
                        </div>
                    </FormControl>
                    <FormDescription>{isEditing ? "Sube un nuevo .glb para reemplazar el modelo actual." : "Modelo 3D opcional."}</FormDescription>
                </FormItem>
            </div>
            <div className="lg:col-span-2 space-y-8">
                <section>
                    <SectionTitle icon={User} title="Datos del Piloto" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>Nombres</FormLabel><FormControl><Input placeholder="Ej: Lucas" {...field} disabled={isSubmitting}/></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Apellidos</FormLabel><FormControl><Input placeholder="Ej: Careaga" {...field} disabled={isSubmitting}/></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="slug" render={({ field }) => (<FormItem><FormLabel>Slug (URL)</FormLabel><FormControl><Input placeholder="Ej: lucas-careaga" {...field} disabled={isSubmitting}/></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="dob" render={({ field }) => (<FormItem><FormLabel>Fecha de Nacimiento</FormLabel><FormControl><Input type="date" {...field} disabled={isSubmitting}/></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input type="email" placeholder="ej: piloto@correo.com" {...field} disabled={isSubmitting}/></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>Ciudad de Procedencia</FormLabel><FormControl><Input placeholder="Ej: Cochabamba" {...field} disabled={isSubmitting}/></FormControl><FormMessage /></FormItem>)} />
                        <FormField control={form.control} name="nationality" render={({ field }) => (<FormItem><FormLabel>Nacionalidad (código 2 letras)</FormLabel><FormControl><Input placeholder="Ej: bo" {...field} disabled={isSubmitting}/></FormControl><FormMessage /></FormItem>)} />
                    </div>
                </section>
                <Separator />
                <section>
                    <SectionTitle icon={Car} title="Datos de Competición" />
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField 
                          control={form.control} 
                          name="category" 
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Categoría Actual</FormLabel>
                              <FormControl>
                                <select 
                                  {...field} 
                                  disabled={isSubmitting}
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <option value="">Seleccionar categoría...</option>
                                  {categoryOptions.map(name => (
                                    <option key={name} value={name}>{name}</option>
                                  ))}
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} 
                        />
                        <FormField control={form.control} name="number" render={({ field }) => (<FormItem><FormLabel>Número de Auto (Kart)</FormLabel><FormControl><Input type="number" placeholder="Ej: 77" {...field} disabled={isSubmitting} /></FormControl><FormMessage /></FormItem>)} />
                        <FormField
                            control={form.control}
                            name="yearsOfExperience"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Años de Trayectoria</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            placeholder="Ej: 5"
                                            {...field}
                                            value={field.value ?? ''}
                                            onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </section>
            </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <section>
              <SectionTitle icon={Flag} title="Datos del Equipo" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField control={form.control} name="teamName" render={({ field }) => (<FormItem><FormLabel>Nombre del Equipo</FormLabel><FormControl><Input placeholder="Ej: Team Careaga" {...field} disabled={isSubmitting}/></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="teamOrigin" render={({ field }) => (<FormItem><FormLabel>Procedencia del Equipo</FormLabel><FormControl><Input placeholder="Ej: Bolivia" {...field} disabled={isSubmitting}/></FormControl><FormMessage /></FormItem>)} />
              </div>
            </section>

            <Separator />

            <section>
                <SectionTitle icon={Palette} title="Color de Equipo (Hexadecimal)" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="teamColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color Principal</FormLabel>
                          <div className="flex items-center gap-2">
                             <FormControl>
                               <Input
                                  type="color"
                                  className="w-12 h-10 p-1 cursor-pointer"
                                  {...field}
                                  value={field.value || '#222222'}
                                  disabled={isSubmitting}
                                />
                             </FormControl>
                             <Input
                                type="text"
                                placeholder="#222222"
                                value={field.value || ''}
                                onChange={field.onChange}
                                disabled={isSubmitting}
                                className="font-mono"
                              />
                          </div>
                          <FormDescription>Selecciona el color principal del equipo.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="teamAccentColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Color de Acento</FormLabel>
                           <div className="flex items-center gap-2">
                             <FormControl>
                               <Input
                                  type="color"
                                  className="w-12 h-10 p-1 cursor-pointer"
                                  {...field}
                                  value={field.value || '#9ACD32'}
                                  disabled={isSubmitting}
                                />
                             </FormControl>
                             <Input
                                type="text"
                                placeholder="#9ACD32"
                                value={field.value || ''}
                                onChange={field.onChange}
                                disabled={isSubmitting}
                                className="font-mono"
                              />
                          </div>
                          <FormDescription>Selecciona el color de acento o secundario.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </div>
            </section>
          </div>

          <div className="lg:col-span-1 space-y-8">
             <section>
                 <SectionTitle icon={User} title="Biografía y Logros" />
                 <FormField control={form.control} name="bio" render={({ field }) => (<FormItem><FormLabel>Biografía</FormLabel><FormControl><Textarea placeholder="Pequeña biografía del piloto..." rows={5} {...field} disabled={isSubmitting}/></FormControl><FormMessage /></FormItem>)} />
                 <div className="mt-4">
                      <Label>Logros Destacados</Label>
                      {achievementFields.map((field, index) => (
                          <div key={field.id} className="flex items-center gap-2 mt-2">
                              <FormField control={form.control} name={`achievements.${index}.value`} render={({ field }) => (<FormItem className="flex-grow"><FormControl><Input placeholder={`Logro #${index + 1}`} {...field} disabled={isSubmitting}/></FormControl><FormMessage /></FormItem>)} />
                              <Button type="button" variant="outline" size="icon" onClick={() => removeAchievement(index)} disabled={isSubmitting}>
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                          </div>
                      ))}
                      <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendAchievement({ value: "" })} disabled={isSubmitting}><PlusCircle className="mr-2 h-4 w-4" />Añadir Logro</Button>
                  </div>
             </section>
          </div>
        </div>

        <Separator />

        <section>
          <SectionTitle icon={Timer} title="Historial de Tiempos" />
          <div className="space-y-4">
            {performanceFields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 items-end p-4 border rounded-md">
                <FormField
                  control={form.control}
                  name={`performanceHistory.${index}.race`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Carrera (Abreviatura)</FormLabel>
                      <FormControl><Input placeholder="Ej: CBA" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`performanceHistory.${index}.lapTime`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mejor Tiempo (segundos)</FormLabel>
                      <FormControl><Input type="number" step="0.001" placeholder="Ej: 55.321" {...field} disabled={isSubmitting} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removePerformance(index)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sm:sr-only ml-2">Eliminar Tiempo</span>
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={() => appendPerformance({ race: "", lapTime: '' as any })} disabled={isSubmitting}>
            <PlusCircle className="mr-2 h-4 w-4" />Añadir Tiempo
          </Button>
          <FormDescription className="mt-2">Añade los mejores tiempos del piloto en diferentes pistas. Deja los campos vacíos para no guardarlos.</FormDescription>
        </section>

        <Button type="submit" size="lg" disabled={isSubmitting} className="mt-12">
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...</> : (isEditing ? "Actualizar Piloto" : "Guardar Piloto")}
        </Button>
      </form>
    </Form>
  );
}
