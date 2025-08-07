
import { createClient } from '@/lib/supabase-server';
import EventForm from '@/components/admin/EventForm';
import { notFound } from 'next/navigation';

export const revalidate = 0;

async function getEventForEdit(id: string) {
    const supabase = createClient();
    const { data: event, error } = await supabase
        .from('events')
        .select(`
            *,
            podiums:podiums(
                *,
                results:podium_results(*)
            )
        `)
        .eq('id', id)
        .single();
    
    if (error) {
        console.error('Error fetching event for editing:', error);
        return null;
    }
    return event;
}

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const [
    { data: tracks },
    { data: pilots },
    { data: categories },
    eventToEdit
  ] = await Promise.all([
    supabase.from('tracks').select('id, name'),
    supabase.from('pilots').select('id, firstName, lastName'),
    supabase.from('categories').select('id, name'),
    getEventForEdit(params.id)
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
      {/* We will pass the existing event data to the form */}
      <EventForm
        tracks={tracks}
        pilots={mappedPilots}
        categories={categories}
        eventToEdit={eventToEdit} 
      />
    </div>
  );
}
