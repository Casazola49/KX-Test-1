
import EventForm from '@/components/admin/EventForm';
import { 
  getAllTracks, 
  getAllPilots,
  getAllCategories
} from '@/lib/data-service';
import { ensureCategoriesExist } from '@/lib/init-categories';

export const revalidate = 0;

export default async function AddEventPage() {
  try {
    // Asegurar que las categorías existan en Firebase
    await ensureCategoriesExist();
    
    const [tracks, pilots, categories] = await Promise.all([
      getAllTracks(),
      getAllPilots(),
      getAllCategories()
    ]);

    if (!tracks || !pilots || !categories) {
      return <div>Error al cargar datos necesarios para el formulario.</div>;
    }

    const mappedPilots = pilots.map(p => ({ ...p, fullName: `${p.firstName} ${p.lastName}` }));

    return (
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-bold mb-8 text-center">Crear Nuevo Evento</h1>
        <EventForm
          tracks={tracks}
          pilots={mappedPilots}
          categories={categories}
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading add event page:', error);
    return <div>Error al cargar la página de creación de eventos.</div>;
  }
}
