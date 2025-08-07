
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import type { TrackInfo } from '@/lib/types';
import TrackListClient from '@/components/admin/TrackListClient';
import { createClient } from '@supabase/supabase-js';

// Usamos la clave de servicio para tener acceso garantizado en el entorno de admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getTracks() {
  try {
    const { data, error } = await supabaseAdmin
      .from('tracks')
      .select('id, name, location, record')
      .order('name', { ascending: true });

    if (error) throw error;
    return (data as Partial<TrackInfo>[]) || [];
  } catch (error) {
    console.error("Error fetching tracks for admin:", error);
    return [];
  }
}

export default async function TracksAdminPage() {
    const tracks = await getTracks();

    return (
        <>
            <PageTitle title="Panel de Administración" subtitle="Gestionar Pistas" />
            <Section>
                <TrackListClient tracks={tracks} />
            </Section>
        </>
    );
}
