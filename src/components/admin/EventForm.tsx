
'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Trash2, PlusCircle } from 'lucide-react';
import { createEventWithPodiums, updateEventWithPodiums } from '@/app/admin/events/actions';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import ImageUploader from './ImageUploader';
import { FieldErrors } from 'react-hook-form';
import { Event, Podium } from '@/lib/types';

const formatDateForInput = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
    return adjustedDate.toISOString().split('T');
};

const podiumResultSchema = z.object({
  id: z.string().optional(),
  pilotId: z.string().optional(),
  isGuest: z.boolean().optional().default(false),
  guestName: z.string().optional(),
  resultValue: z.string().optional(),
}).refine((val) => (val.isGuest ? !!val.guestName : !!val.pilotId), {
  message: 'Debes seleccionar un piloto o marcar Invitado y escribir su nombre.',
  path: ['pilotId'],
});

// CHANGE 1: Allow a variable number of results
const podiumSchema = z.object({
  id: z.string().optional(),
  categoryId: z.string().min(1, 'Debes seleccionar una categoría.'),
  podiumType: z.enum(['CLASIFICACION', 'MANGA_1', 'MANGA_2', 'MANGA_3_PRE_FINAL', 'FINAL', 'PODIO_EVENTO', 'PODIO_OFICIAL_DEFINITIVO']),
  determinationMethod: z.enum(['TIEMPO', 'PUNTOS']),
  results: z.array(podiumResultSchema).min(1, "Debe haber al menos un resultado"),
});

const eventFormSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  eventDate: z.string().min(1, 'Debes seleccionar una fecha.'),
  eventTime: z.string().min(1, 'Debes especificar una hora.'),
  trackId: z.string().min(1, 'Debes seleccionar una pista.'),
  description: z.string().optional(),
  promotionalImage: z.any().optional(),
  galleryImages: z.any().optional(),
  podiums: z.array(podiumSchema).optional(),
  // Campo fantasma que usamos solo para validar que ya existe imagen previa en modo edición
  existingPromotionalImage: z.string().optional(),
}).refine(data => {
    return (data as any).existingPromotionalImage || (data.promotionalImage && data.promotionalImage.length > 0);
}, {
    message: "La imagen promocional es requerida.",
    path: ["promotionalImage"],
});


type EventFormValues = z.infer<typeof eventFormSchema>;

interface Props {
  tracks: { id: string; name: string }[];
  pilots: { id: string; fullName: string }[];
  categories: { id: string; name: string }[];
  eventToEdit?: Event & { podiums: (Podium & { results: any[] })[] };
}

const podiumTypeLabels: { [key: string]: string } = {
    CLASIFICACION: 'Clasificación (Tiempo)',
    MANGA_1: 'Manga 1 (Puntos)',
    MANGA_2: 'Manga 2 (Puntos)',
    MANGA_3_PRE_FINAL: 'Pre-Final / Manga 3 (Puntos)',
    FINAL: 'Final (Puntos)',
    PODIO_EVENTO: 'Podio del Evento (Puntos)',
    PODIO_OFICIAL_DEFINITIVO: 'Podio Oficial Definitivo (Puntos)',
};

export default function EventForm({ tracks, pilots, categories, eventToEdit }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!eventToEdit;

  const [initialDate, initialTime] = (eventToEdit as any)?.event_date 
    ? formatDateForInput(new Date((eventToEdit as any).event_date)) 
    : ['', ''];

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: isEditMode ? {
        name: eventToEdit.name,
        eventDate: initialDate,
        eventTime: initialTime.substring(0, 5),
        trackId: eventToEdit.track_id,
        description: eventToEdit.description || '',
        existingPromotionalImage: eventToEdit.promotional_image_url,
        // Mapear estructura de la BD -> estructura del formulario preservando IDs
        podiums: (eventToEdit.podiums || []).map((p: any) => ({
            id: p.id,
            categoryId: p.category_id,
            podiumType: p.podium_type,
            determinationMethod: p.determination_method,
            results: (p.results || [])
              .slice()
              .sort((a: any, b: any) => a.position - b.position)
              .map((r: any) => ({
                id: r.id,
                pilotId: r.pilot_id,
                resultValue: r.result_value ?? '',
              })),
        })),
    } : {
        name: '', eventDate: '', eventTime: '09:00', trackId: '', description: '', podiums: [],
    },
  });

  // Ordenar pilotos alfabéticamente (soporta acentos)
  const sortedPilots = useMemo(() => {
    return [...pilots].sort((a, b) => a.fullName.localeCompare(b.fullName, 'es', { sensitivity: 'base' }));
  }, [pilots]);

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'podiums',
    });

  async function onSubmit(data: EventFormValues) {
    const formData = new FormData();
    const combinedDateTime = `${data.eventDate}T${data.eventTime}:00`;
    
    formData.append('name', data.name);
    formData.append('eventDateTime', combinedDateTime);
    formData.append('trackId', data.trackId);
    formData.append('description', data.description || '');
    
    if (data.promotionalImage && data.promotionalImage.length > 0) {
        formData.append('promotionalImage', data.promotionalImage[0]);
    }
    if (data.galleryImages && data.galleryImages.length > 0) {
        data.galleryImages.forEach((file: File) => formData.append('galleryImages', file));
    }
    
    // CHANGE 2: Add position to each result before stringifying
    const podiumsWithPositions = data.podiums?.map(podium => ({
        ...podium,
        results: podium.results.map((result, index) => ({
            ...result,
            position: index + 1, // Add position dynamically
        }))
    }));

    formData.append('podiums', JSON.stringify(podiumsWithPositions));

    try {
      const result = isEditMode
        ? await updateEventWithPodiums(eventToEdit.id, formData)
        : await createEventWithPodiums(formData);
      
      if (result.success) {
        toast({ title: 'Éxito', description: `El evento ha sido ${isEditMode ? 'actualizado' : 'creado'}.` });
        router.push('/admin/events');
        router.refresh();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
        toast({ title: 'Error', description: (error as Error).message, variant: 'destructive' });
    }
  }

    const onFormError = (errors: FieldErrors<EventFormValues>) => {
        console.error("Form validation errors:", errors);
        toast({
            title: "Hay errores en el formulario",
            description: "Revisa los campos marcados en rojo. Asegúrate de que todos los podios tengan al menos un resultado.",
            variant: "destructive",
        });
    };
    
    const handlePodiumTypeChange = (value: string, index: number) => {
        const isTiempo = value === 'CLASIFICACION';
        form.setValue(`podiums.${index}.determinationMethod`, isTiempo ? 'TIEMPO' : 'PUNTOS');
        form.setValue(`podiums.${index}.podiumType`, value as any);
    };

    // Component to manage the dynamic results array
    const ResultsArray = ({ podiumIndex }: { podiumIndex: number }) => {
        const { fields: resultsFields, append: appendResult, remove: removeResult } = useFieldArray({
            control: form.control,
            name: `podiums.${podiumIndex}.results` as const,
        });

        return (
            <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Resultados</h4>
                    <Button type="button" size="sm" variant="outline" onClick={() => appendResult({ pilotId: '', isGuest: false, guestName: '', resultValue: '' })}>
                        <PlusCircle className="mr-2 h-4 w-4"/> Añadir Piloto
                    </Button>
                </div>
                {resultsFields.map((field, resultIndex) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr,1fr,auto] gap-4 items-end">
                        <Controller control={form.control} name={`podiums.${podiumIndex}.results.${resultIndex}.pilotId`} render={({ field: fieldPilot }) => (
                            <FormItem>
                                <FormLabel>Puesto {resultIndex + 1}</FormLabel>
                                {/* Toggle de piloto invitado */}
                                <div className="flex items-center gap-3 mb-2">
                                  <Switch
                                    checked={form.watch(`podiums.${podiumIndex}.results.${resultIndex}.isGuest`) || false}
                                    onCheckedChange={(checked) => {
                                      form.setValue(`podiums.${podiumIndex}.results.${resultIndex}.isGuest`, checked);
                                      if (checked) {
                                        form.setValue(`podiums.${podiumIndex}.results.${resultIndex}.pilotId`, '');
                                      }
                                    }}
                                  />
                                  <span className="text-sm">Piloto invitado (no registrado)</span>
                                </div>
                                {!form.watch(`podiums.${podiumIndex}.results.${resultIndex}.isGuest`) ? (
                                  <Select onValueChange={fieldPilot.onChange} value={fieldPilot.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un piloto" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                      {sortedPilots.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>{p.fullName}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Controller
                                    control={form.control}
                                    name={`podiums.${podiumIndex}.results.${resultIndex}.guestName`}
                                    render={({ field: guestField }) => (
                                      <Input placeholder="Nombre completo del piloto invitado" {...guestField} />
                                    )}
                                  />
                                )}
                                <FormMessage/>
                                <div className="text-xs text-muted-foreground mt-1">
                                  ¿No encuentras al piloto? Añádelo en otra pestaña:
                                  <a href="/admin/add-pilot" target="_blank" rel="noopener noreferrer" className="underline ml-1">Crear piloto</a>
                                </div>
                            </FormItem>
                        )} />
                        <Controller control={form.control} name={`podiums.${podiumIndex}.results.${resultIndex}.resultValue`} render={({ field: fieldResult }) => (
                            <FormItem>
                                <FormLabel>Resultado ({form.watch(`podiums.${podiumIndex}.determinationMethod`) === 'TIEMPO' ? 'Tiempo' : 'Puntos'})</FormLabel>
                                <Input placeholder={form.watch(`podiums.${podiumIndex}.determinationMethod`) === 'TIEMPO' ? 'Ej: 1:04.552' : 'Ej: 25'} {...fieldResult} />
                                <FormMessage/>
                            </FormItem>
                        )} />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeResult(resultIndex)} className="self-center mb-1">
                            <Trash2 className="h-4 w-4 text-red-500"/>
                        </Button>
                    </div>
                ))}
            </div>
        );
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, onFormError)} className="space-y-8">
        {/* --- Event Details Card (No changes here) --- */}
        <Card>
          <CardHeader><CardTitle>Detalles del Evento</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <FormField name="name" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Nombre del Evento</FormLabel><FormControl><Input placeholder="Ej: Campeonato Nacional - Día 1" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="eventDate" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Fecha del Evento</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                <FormField name="eventTime" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Hora de Inicio</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem> )} />
            </div>
            <FormField name="trackId" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Pista</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona una pista" /></SelectTrigger></FormControl><SelectContent>{tracks.map((track) => (<SelectItem key={track.id} value={track.id}>{track.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem> )}/>
            <FormField name="description" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Descripción (Opcional)</FormLabel><FormControl><Textarea placeholder="Añade una descripción corta sobre el evento..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="promotionalImage" render={({ field }) => (
                <FormItem>
                    <FormLabel>Imagen Promocional Principal</FormLabel>
                    <FormControl><ImageUploader field={field} /></FormControl>
                    <FormDescription>Esta es la imagen principal que se mostrará en la cabecera.</FormDescription>
                    {/* Mostrar imagen actual y marcar existingPromotionalImage para saltar validación */}
                    {isEditMode && eventToEdit.promotional_image_url && !field.value && (
                      <>
                        <input type="hidden" value={eventToEdit.promotional_image_url} {...form.register('existingPromotionalImage' as any)} />
                        <div className="mt-2 text-sm text-muted-foreground">Imagen actual: <a href={eventToEdit.promotional_image_url} target="_blank" rel="noopener noreferrer" className="underline">ver imagen</a></div>
                      </>
                    )}
                    <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="galleryImages" render={({ field }) => (
                <FormItem>
                    <FormLabel>Galería de Imágenes (Opcional)</FormLabel>
                    <FormControl><ImageUploader field={field} multiple /></FormControl>
                    <FormDescription>Sube imágenes adicionales sobre el evento. Estas no se borrarán al editar, solo se añadirán nuevas.</FormDescription>
                    <FormMessage />
                </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* --- Podiums Management Card (Main changes here) --- */}
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Gestión de Resultados por Categoría</CardTitle>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ categoryId: '', podiumType: 'CLASIFICACION', determinationMethod: 'TIEMPO', results: [] })} >
                        Añadir Categoría
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {fields.map((field, index) => (
                    <Card key={field.id} className="p-4 relative border-2 data-[invalid]:border-destructive" data-invalid={!!form.formState.errors.podiums?.[index]}>
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                        {/* Preservar ID del podio para updates */}
                        <input type="hidden" {...form.register(`podiums.${index}.id` as const)} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <Controller control={form.control} name={`podiums.${index}.podiumType`} render={({ field: fieldType }) => ( <FormItem><FormLabel>Tipo de Resultado</FormLabel><Select onValueChange={(value) => handlePodiumTypeChange(value, index)} value={fieldType.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un tipo" /></SelectTrigger></FormControl><SelectContent>{Object.entries(podiumTypeLabels).map(([key, label]) => ( <SelectItem key={key} value={key}>{label}</SelectItem> ))}</SelectContent></Select><FormMessage /></FormItem> )} />
                           <Controller control={form.control} name={`podiums.${index}.categoryId`} render={({ field: fieldCategory }) => ( <FormItem><FormLabel>Categoría</FormLabel><Select onValueChange={fieldCategory.onChange} value={fieldCategory.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger></FormControl><SelectContent>{categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}</SelectContent></Select><FormMessage /></FormItem> )}/>
                        </div>
                        {/* CHANGE 3: Use the new dynamic results component */}
                        <ResultsArray podiumIndex={index} />
                    </Card>
                ))}
            </CardContent>
        </Card>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (isEditMode ? 'Guardando...' : 'Creando...') : (isEditMode ? 'Guardar Cambios' : 'Crear Evento')}
        </Button>
      </form>
    </Form>
  );
}
