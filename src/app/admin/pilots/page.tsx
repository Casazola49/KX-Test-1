
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import type { Pilot } from '@/lib/types';
import PilotListClient from '@/components/admin/PilotListClient';
import { getAllPilots } from '@/lib/data-service';

async function getPilots() {
  try {
    const pilots = await getAllPilots();
    return (pilots as Pilot[]) || [];
  } catch (error) {
    console.error("Error fetching pilots for admin from Firebase:", error);
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
