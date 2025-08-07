
import { createClient } from '@/lib/supabase-server';
import EventForm from '@/components/admin/EventForm';

export const revalidate = 0;

export default async function AddEventPage() {
  const supabase = createClient();

  const { data: tracks } = await supabase.from('tracks').select('id, name');
  const { data: pilots } = await supabase.from('pilots').select('id, firstName, lastName');
  const { data: categories } = await supabase.from('categories').select('id, name');

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
}
