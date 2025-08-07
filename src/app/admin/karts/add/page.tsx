
import PageTitle from '@/components/shared/PageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Section from '@/components/shared/Section';
import KartForm from '@/components/admin/KartForm';

export default function AddKartPage() {
  return (
    <>
      <PageTitle title="Panel de Administración" subtitle="Añadir Nuevo Kart" />
      <Section className="py-8 md:py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Detalles del Nuevo Kart</CardTitle>
          </CardHeader>
          <CardContent>
            <KartForm />
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
