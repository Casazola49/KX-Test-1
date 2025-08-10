
import { createClient } from '@supabase/supabase-js';
import type { Metadata } from 'next';
import PilotsPageClient from '@/components/client/PilotsPageClient';
import { groupPodiumsByCategory, FullEvent } from '@/lib/utils';
import { unstable_noStore as noStore } from 'next/cache';
import { Pilot, Category } from '@/lib/types';

// Metadata específica para la página de pilotos
export const metadata: Metadata = {
  title: 'Pilotos y Equipos | Karting Bolivia',
  description: 'Conoce a los mejores pilotos de karting de Bolivia y sus equipos. Estadísticas, clasificaciones y perfiles completos.',
  keywords: 'pilotos karting, equipos karting, clasificaciones, estadísticas',
};

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
  
  // Debug logging
  console.log('Categories loaded:', categoriesData);
  
  const categoriesMap = new Map(categoriesData.map(c => [c.id, c.name]));
  const categoryNamesSet = new Set(categoriesData.map(c => c.name));

  // CORRECTED: Use the 'category' column, which is the correct name in the database.
  const { data: pilotsData, error: pilotsError } = await supabaseAdmin
    .from('pilots')
    .select('id, slug, firstName, lastName, teamName, teamColor, teamAccentColor, number, imageUrl, nationality, category')
    .order('lastName', { ascending: true });
    
  if (pilotsError) throw new Error(`DATABASE ERROR (Pilots): ${pilotsError.message}`);
  if (!pilotsData) throw new Error('Error de Datos: No se pudieron obtener los pilotos.');

  // Debug logging
  console.log('Pilots data sample:', pilotsData.slice(0, 3).map(p => ({ 
    name: `${p.firstName} ${p.lastName}`, 
    category: p.category 
  })));

  const formattedPilots = pilotsData.map(pilot => {
    // La columna 'category' puede venir como UUID (FK) o como nombre según datos antiguos.
    // 1) Si es UUID y existe en el mapa -> obtenemos el nombre.
    // 2) Si ya es un nombre válido -> lo usamos tal cual.
    // 3) En cualquier otro caso -> 'Sin Categoría'.
    let categoryName: string | undefined;
    if (pilot.category) {
      categoryName = categoriesMap.get(pilot.category);
      if (!categoryName && categoryNamesSet.has(pilot.category)) {
        categoryName = pilot.category;
      }
    }
    
    // Debug logging to help identify the issue
    if (pilot.category && !categoryName) {
      console.log(`Warning: Category UUID "${pilot.category}" not found in categories map for pilot ${pilot.firstName} ${pilot.lastName}`);
    }
    
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
  // Priorizar eventos que ya tienen podios para la vista de Clasificación
  const eventsWithPodiums = pastEvents.filter(e => Array.isArray(e.podiums) && e.podiums.length > 0);
  const initialGroupedPodiums = groupPodiumsByCategory(eventsWithPodiums[0]?.podiums);

  return {
    pilots: (formattedPilots as Pilot[]) || [],
    // Enviamos primero los eventos con podios; si no hay, enviamos todos los pasados
    events: (eventsWithPodiums.length > 0 ? eventsWithPodiums : pastEvents),
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
