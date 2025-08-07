
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { Standing, Pilot, Track, RaceEvent } from '@/lib/types';

// Zod schema for validating standing data
const standingSchema = z.object({
  pilotId: z.string().uuid('Debes seleccionar un piloto.'),
  points: z.coerce.number().min(0, 'Los puntos no pueden ser negativos.'),
  category: z.string().min(3, 'La categoría es obligatoria.'),
  eventId: z.string().uuid('Debes seleccionar un evento.').optional().nullable(),
  pilotName: z.string(),
  pilotImageUrl: z.string().optional().nullable(),
});


// Fetch all pilots from Supabase
export async function getPilots(): Promise<Pilot[]> {
  const { data, error } = await supabaseAdmin.from('pilots').select('*');
  if (error) {
    console.error('Error fetching pilots from Supabase:', error);
    throw new Error('Could not fetch pilots.');
  }
  return data || [];
}

// Fetch all tracks from Supabase
export async function getTracks(): Promise<Track[]> {
    const { data, error } = await supabaseAdmin.from('tracks').select('*');
    if (error) {
        console.error('Error fetching tracks from Supabase:', error);
        throw new Error('Could not fetch tracks.');
    }
    return data || [];
}

// Fetch all race events from Supabase
export async function getRaceEvents(): Promise<RaceEvent[]> {
  const { data, error } = await supabaseAdmin.from('raceevents').select('*');
  if (error) {
    console.error('Error fetching race events from Supabase:', error);
    throw new Error('Could not fetch race events.');
  }
  return data || [];
}


// Fetch standings from Supabase
export async function getStandings(type: 'points' | 'time_trial'): Promise<Standing[]> {
    const { data, error } = await supabaseAdmin
        .from('standings')
        .select('*')
        .eq('type', type);

    if (error) {
        console.error(`Error fetching ${type} standings from Supabase:`, error);
        throw new Error(`Could not fetch ${type} standings.`);
    }

    return data || [];
}

export async function upsertStanding(id: string | undefined, data: z.infer<typeof standingSchema>) {
  const { data: standing, error } = await supabaseAdmin
    .from('standings')
    .upsert({ id, ...data })
    .select()
    .single();

  if (error) {
    console.error('Error upserting standing:', error);
    return { success: false, error: 'Failed to save standing.' };
  }

  revalidatePath('/admin/standings');
  revalidatePath('/pilotos-equipos');

  return { success: true, standing };
}


export async function deleteStanding(id: string) {
    if (!id) {
        return { error: 'Invalid ID provided.' };
    }
    const { error } = await supabaseAdmin.from('standings').delete().match({ id });
    if (error) {
        console.error('Error deleting standing:', error);
        return { error: 'Failed to delete standing.' };
    }

    revalidatePath('/admin/standings');
    revalidatePath('/pilotos-equipos');
    return { success: true };
}
