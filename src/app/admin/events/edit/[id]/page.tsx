
import EventForm from '@/components/admin/EventForm';
import { notFound } from 'next/navigation';
import { 
  getEventWithPodiums, 
  getAllTracks, 
  getAllPilots,
  getAllCategories
} from '@/lib/data-service';
import { ensureCategoriesExist } from '@/lib/init-categories';

export const revalidate = 0;

export default async function EditEventPage({ params }: { params: { id: string } }) {
  try {
    // Asegurar que las categorías existan en Firebase
    await ensureCategoriesExist();
    
    const [
      tracks,
      pilots,
      categories,
      eventToEdit
    ] = await Promise.all([
      getAllTracks(),
      getAllPilots(),
      getAllCategories(),
      getEventWithPodiums(params.id)
    ]);

    if (!tracks || !pilots || !categories) {
      return <div>Error al cargar datos necesarios para el formulario.</div>;
    }
    
    if (!eventToEdit) {
        notFound();
    }

    const mappedPilots = pilots.map(p => ({ ...p, fullName: `${p.firstName} ${p.lastName}` }));

    return (
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-bold mb-8 text-center">Editar Evento</h1>
        <EventForm
          tracks={tracks}
          pilots={mappedPilots}
          categories={categories}
          eventToEdit={eventToEdit} 
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading edit event page:', error);
    return <div>Error al cargar la página de edición.</div>;
  }
}
