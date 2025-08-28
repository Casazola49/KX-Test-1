
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Standing, Pilot, Track, RaceEvent } from '@/lib/types';
import { 
  getAllPilots, 
  getAllTracks, 
  getAllRaceEvents,
  getStandingsByType,
  createStanding,
  updateStanding,
  deleteStanding as deleteStandingFromDB
} from '@/lib/data-service';

// Zod schema for validating standing data
const standingSchema = z.object({
  pilotId: z.string().uuid('Debes seleccionar un piloto.'),
  points: z.coerce.number().min(0, 'Los puntos no pueden ser negativos.'),
  category: z.string().min(3, 'La categoría es obligatoria.'),
  eventId: z.string().uuid('Debes seleccionar un evento.').optional().nullable(),
  pilotName: z.string(),
  pilotImageUrl: z.string().optional().nullable(),
});

// Fetch all pilots from Firebase
export async function getPilots(): Promise<Pilot[]> {
  try {
    return await getAllPilots();
  } catch (error) {
    console.error('Error fetching pilots from Firebase:', error);
    throw new Error('Could not fetch pilots.');
  }
}

// Fetch all tracks from Firebase
export async function getTracks(): Promise<Track[]> {
  try {
    return await getAllTracks();
  } catch (error) {
    console.error('Error fetching tracks from Firebase:', error);
    throw new Error('Could not fetch tracks.');
  }
}

// Fetch all race events from Firebase
export async function getRaceEvents(): Promise<RaceEvent[]> {
  try {
    return await getAllRaceEvents();
  } catch (error) {
    console.error('Error fetching race events from Firebase:', error);
    throw new Error('Could not fetch race events.');
  }
}

// Fetch standings from Firebase
export async function getStandings(type: 'points' | 'time_trial'): Promise<Standing[]> {
  try {
    return await getStandingsByType(type);
  } catch (error) {
    console.error(`Error fetching ${type} standings from Firebase:`, error);
    throw new Error(`Could not fetch ${type} standings.`);
  }
}

export async function upsertStanding(id: string | undefined, data: z.infer<typeof standingSchema>) {
  try {
    let result;
    
    if (id) {
      // Update existing standing
      result = await updateStanding(id, data);
    } else {
      // Create new standing
      result = await createStanding(data);
    }

    if (!result.success) {
      return { success: false, error: 'Failed to save standing.' };
    }

    revalidatePath('/admin/standings');
    revalidatePath('/pilotos-equipos');

    return { success: true, standing: result };
  } catch (error) {
    console.error('Error upserting standing:', error);
    return { success: false, error: 'Failed to save standing.' };
  }
}

export async function deleteStanding(id: string) {
  if (!id) {
    return { error: 'Invalid ID provided.' };
  }
  
  try {
    const result = await deleteStandingFromDB(id);
    
    if (!result.success) {
      return { error: 'Failed to delete standing.' };
    }

    revalidatePath('/admin/standings');
    revalidatePath('/pilotos-equipos');
    return { success: true };
  } catch (error) {
    console.error('Error deleting standing:', error);
    return { error: 'Failed to delete standing.' };
  }
}
