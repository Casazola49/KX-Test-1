
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { Standing, Pilot, RaceEvent } from '@/lib/types';
import { upsertStanding } from '../actions';
import { useState } from 'react';

const formSchema = z.object({
  pilotId: z.string().uuid('Debes seleccionar un piloto válido.'),
  points: z.coerce.number().min(0, 'Los puntos no pueden ser negativos.'),
  category: z.string().min(3, 'La categoría es obligatoria.'),
  eventId: z.string(), 
});

type FormValues = z.infer<typeof formSchema>;

interface StandingFormProps {
  standing?: Standing;
  pilots: Pilot[];
  events: RaceEvent[];
}

export default function StandingForm({ standing, pilots, events }: StandingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!standing;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pilotId: standing?.pilotId || '',
      points: standing?.points || 0,
      category: standing?.category || '',
      eventId: standing?.eventId || 'none', 
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    toast({ title: isEditing ? 'Actualizando...' : 'Guardando...' });

    const pilot = pilots.find(p => p.id === data.pilotId);
    if (!pilot) {
      toast({ title: 'Error', description: 'Piloto no encontrado.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    const payload = {
      ...data,
      eventId: data.eventId === 'none' ? null : data.eventId,
      pilotName: `${pilot.firstName} ${pilot.lastName}`,
      pilotImageUrl: pilot.imageUrl,
    };

    const result = await upsertStanding(standing?.id, payload as any);

    if (result.success) {
      toast({ title: '¡Éxito!', description: 'Clasificación guardada.' });
      router.push('/admin/standings');
      router.refresh();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="pilotId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Piloto</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un piloto..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {pilots.map(p => (
                      <SelectItem key={p.id} value={p.id}>
                        {`${p.firstName} ${p.lastName}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: F200 Super" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="points"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Puntos</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Guardar Clasificación'}
        </Button>
      </form>
    </Form>
  );
}
