
// Migrado a Firebase - Ya no usa Supabase
import type { Metadata } from 'next';
import PilotsPageClient from '@/components/client/PilotsPageClient';
import { getAllPilots, getAllEvents, getAllCategories } from '@/lib/data-service';
import { Pilot } from '@/lib/types';

// Metadata específica para la página de pilotos
export const metadata: Metadata = {
  title: 'Pilotos y Equipos | Karting Bolivia',
  description: 'Conoce a los mejores pilotos de karting de Bolivia y sus equipos. Estadísticas, clasificaciones y perfiles completos.',
  keywords: 'pilotos karting, equipos karting, clasificaciones, estadísticas',
};

export const revalidate = 0;

async function getPilotsAndEvents() {
  try {
    // Obtener pilotos de Firebase
    const pilots = await getAllPilots();
    const events = await getAllEvents();
    
    // Obtener todas las categorías de la base de datos
    const categoriesData = await getAllCategories();
    const categories = categoriesData.map(cat => cat.name).sort();

    // Crear podios de ejemplo (estructura segura)
    const initialGroupedPodiums = pilots.length > 0 ? {
      'Profesional': {
        categoryName: 'Profesional',
        results: pilots.slice(0, 3).map((pilot, index) => ({
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
      pilots,
      events,
      initialGroupedPodiums,
      categories,
    };
  } catch (error) {
    console.error('Error fetching pilots and events from Firebase:', error);
    throw error;
  }
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
