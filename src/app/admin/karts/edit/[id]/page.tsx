
import PageTitle from '@/components/shared/PageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Section from '@/components/shared/Section';
import KartForm from '@/components/admin/KartForm';
import type { Kart } from '@/lib/types';
import { notFound } from 'next/navigation';
import { getKartById } from '@/lib/data-service';

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
