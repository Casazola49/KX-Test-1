
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import type { Pilot } from '@/lib/types';
import PilotListClient from '@/components/admin/PilotListClient';
import { createClient } from '@supabase/supabase-js';

// Usamos la clave de servicio para tener acceso garantizado en el entorno de admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getPilots() {
  try {
    const { data, error } = await supabaseAdmin
      .from('pilots')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    
    return (data as Pilot[]) || [];
  } catch (error) {
    console.error("Error fetching pilots for admin from Supabase:", error);
    return [];
  }
}

export default async function PilotsAdminPage() {
    const pilots = await getPilots();

    return (
        <>
            <PageTitle title="Panel de Administración" subtitle="Gestionar Pilotos" />
            <Section>
                <PilotListClient pilots={pilots} />
            </Section>
        </>
    );
}
