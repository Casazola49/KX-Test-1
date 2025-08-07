
import { createClient } from '@supabase/supabase-js';
import PilotsPageClient from '@/components/client/PilotsPageClient';
import { groupPodiumsByCategory, FullEvent } from '@/lib/utils';
import { unstable_noStore as noStore } from 'next/cache';
import { Pilot, Category } from '@/lib/types';

export const revalidate = 0;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getPilotsAndEvents() {
  noStore();

  const { data: categoriesData, error: categoriesError } = await supabaseAdmin
    .from('categories')
    .select('id, name');

  if (categoriesError) throw new Error(`DATABASE ERROR (Categories): ${categoriesError.message}`);
  if (!categoriesData) throw new Error('Error de Datos: No se pudieron obtener las categorías.');
  
  const categoriesMap = new Map(categoriesData.map(c => [c.id, c.name]));

  // CORRECTED: Use the 'category' column, which is the correct name in the database.
  const { data: pilotsData, error: pilotsError } = await supabaseAdmin
    .from('pilots')
    .select('id, slug, firstName, lastName, teamName, teamColor, teamAccentColor, number, imageUrl, nationality, category')
    .order('lastName', { ascending: true });
    
  if (pilotsError) throw new Error(`DATABASE ERROR (Pilots): ${pilotsError.message}`);
  if (!pilotsData) throw new Error('Error de Datos: No se pudieron obtener los pilotos.');

  const formattedPilots = pilotsData.map(pilot => {
    // The 'pilot.category' field now correctly holds the category UUID from the database.
    const categoryName = pilot.category ? categoriesMap.get(pilot.category) : undefined;
    return {
      ...pilot,
      // We overwrite the 'category' property (which was the UUID) with the category's actual name.
      category: categoryName || 'Sin Categoría',
    };
  });

  const { data: events, error: eventsError } = await supabaseAdmin
    .from('events')
    .select(`
      *,
      track:tracks(name, location),
      podiums(id,podium_type,determination_method,category:categories(name),results:podium_results(*,pilot:pilots(id,slug,firstName,lastName,teamName,teamColor,teamAccentColor,number,imageUrl,nationality)))
    `)
    .order('event_date', { ascending: false });

  if (eventsError) {
    console.error("Error al obtener datos para la pestaña de Clasificación:", eventsError.message);
    throw new Error(`DATABASE ERROR (Events): ${eventsError.message}`);
  }

  const allEvents = (events as unknown as FullEvent[]) || [];
  
  const currentDate = new Date().toISOString();
  const pastEvents = allEvents.filter(event => new Date(event.event_date) <= new Date(currentDate));

  const initialGroupedPodiums = groupPodiumsByCategory(pastEvents[0]?.podiums);

  return {
    pilots: (formattedPilots as Pilot[]) || [],
    events: pastEvents,
    initialGroupedPodiums,
    categories: categoriesData.map(c => c.name).sort() || [],
  };
}

export default async function PilotosEquiposPage() {
    try {
        const { pilots, events, initialGroupedPodiums, categories } = await getPilotsAndEvents();
        return (
            <PilotsPageClient
                pilots={pilots}
                events={events}
                initialGroupedPodiums={initialGroupedPodiums}
                availableCategories={categories}
            />
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-500">
                <h1 className="text-2xl font-bold mb-4">Error al Cargar Datos</h1>
                <p>No se pudieron obtener los datos de los pilotos y/o clasificación.</p>
                <p className="text-sm text-muted-foreground mt-2">Detalles: {errorMessage}</p>
            </div>
        )
    }
}
