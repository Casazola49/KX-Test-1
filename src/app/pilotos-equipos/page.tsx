
// Migrado a Firebase - Ya no usa Supabase
import type { Metadata } from 'next';
import PilotsPageClient from '@/components/client/PilotsPageClient';
import { getAllPilots, getAllEvents } from '@/lib/data-service';
import { FIXED_CATEGORIES } from '@/lib/categories';
import { Pilot } from '@/lib/types';
import HorizontalAd from '@/components/shared/HorizontalAd';
import ResourcePreloader from '@/components/optimization/ResourcePreloader';
import InvisibleOptimizations from '@/components/optimization/InvisibleOptimizations';
import PilotsOptimizations from '@/components/optimization/PilotsOptimizations';


// Metadata específica para la página de pilotos
export const metadata: Metadata = {
  title: 'Pilotos y Equipos | Karting Bolivia',
  description: 'Conoce a los mejores pilotos de karting de Bolivia y sus equipos. Estadísticas, clasificaciones y perfiles completos.',
  keywords: 'pilotos karting, equipos karting, clasificaciones, estadísticas',
};

export const revalidate = 300; // Cache por 5 minutos para mejor rendimiento

// Función optimizada para cargar datos en paralelo con cache inteligente
async function getOptimizedPilotsAndEvents() {
  try {
    // Usar cache inteligente para mejor rendimiento
    const [pilots, events] = await Promise.allSettled([
      import('@/lib/pilots-optimizations').then(m => m.getCachedPilots()),
      import('@/lib/pilots-optimizations').then(m => m.getCachedEventsWithPodiums())
    ]);

    const pilotsData = pilots.status === 'fulfilled' ? pilots.value : [];
    const eventsData = events.status === 'fulfilled' ? events.value : [];
    
    // Usar las categorías fijas
    const categories = [...FIXED_CATEGORIES].sort();

    // Crear podios de ejemplo (estructura segura) solo si hay pilotos
    const initialGroupedPodiums = pilotsData.length > 0 ? {
      'Profesional': {
        categoryName: 'Profesional',
        results: pilotsData.slice(0, 3).map((pilot, index) => ({
          position: index + 1,
          pilot: {
            id: pilot.id,
            slug: pilot.slug,
            firstName: pilot.firstName,
            lastName: pilot.lastName,
            teamName: pilot.teamName,
            teamColor: pilot.teamColor,
            teamAccentColor: pilot.teamAccentColor,
            number: pilot.number,
            imageUrl: pilot.imageUrl,
            nationality: pilot.nationality
          }
        }))
      }
    } : {};

    return {
      pilots: pilotsData,
      events: eventsData,
      initialGroupedPodiums,
      categories,
    };
  } catch (error) {
    console.error('Error fetching pilots and events from Firebase:', error);
    // Fallback: intentar carga individual si falla la paralela
    try {
      const pilots = await getAllPilots();
      const events = await getAllEvents();
      const categories = [...FIXED_CATEGORIES].sort();
      
      return {
        pilots,
        events,
        initialGroupedPodiums: {},
        categories,
      };
    } catch (fallbackError) {
      console.error('Fallback loading also failed:', fallbackError);
      throw fallbackError;
    }
  }
}

export default async function PilotosEquiposPage() {
    try {
        const { pilots, events, initialGroupedPodiums, categories } = await getOptimizedPilotsAndEvents();
        return (
            <>
                <PilotsPageClient
                    pilots={pilots}
                    events={events}
                    initialGroupedPodiums={initialGroupedPodiums}
                    availableCategories={categories}
                />
                <HorizontalAd section="pilotos" />
                
                {/* Optimizaciones invisibles de rendimiento */}
                <ResourcePreloader />
                <InvisibleOptimizations />
                <PilotsOptimizations />
                

            </>
        );
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
        return (
            <div className="container mx-auto px-4 py-8 text-center text-red-500">
                <h1 className="text-2xl font-bold mb-4">Error al Cargar Datos</h1>
                <p>No se pudieron obtener los datos de los pilotos y/o clasificación.</p>
                <p className="text-sm text-muted-foreground mt-2">Detalles: {errorMessage}</p>
                
                {/* Optimizaciones invisibles incluso en error */}
                <ResourcePreloader />
                <InvisibleOptimizations />
                <PilotsOptimizations />

            </div>
        )
    }
}
