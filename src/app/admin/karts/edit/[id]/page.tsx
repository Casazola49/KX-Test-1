
import { createClient } from '@supabase/supabase-js';
import PageTitle from '@/components/shared/PageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Section from '@/components/shared/Section';
import KartForm from '@/components/admin/KartForm';
import type { Kart } from '@/lib/types';
import { notFound } from 'next/navigation';

// Usamos el cliente de admin para obtener los datos en el servidor
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getKartById(id: string): Promise<Kart | null> {
  const { data, error } = await supabaseAdmin
    .from('karts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching kart by id:', error);
    return null;
  }
  return data;
}

export default async function EditKartPage({ params }: { params: { id: string } }) {
  const kart = await getKartById(params.id);

  if (!kart) {
    notFound();
  }

  return (
    <>
      <PageTitle title="Panel de Administración" subtitle={`Editando: ${kart.name}`} />
      <Section className="py-8 md:py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Detalles del Kart</CardTitle>
          </CardHeader>
          <CardContent>
            <KartForm kart={kart} />
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
