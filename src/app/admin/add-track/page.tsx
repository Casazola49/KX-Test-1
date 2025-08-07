
import PageTitle from '@/components/shared/PageTitle';
import TrackForm from '@/components/admin/track/TrackForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Section from '@/components/shared/Section';

export default function AddTrackPage() {
  return (
    <>
      <PageTitle title="Panel de Administración" subtitle="Añadir Nueva Pista" />
      <Section className="py-8 md:py-12">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle>Detalles de la Pista</CardTitle>
          </CardHeader>
          <CardContent>
            <TrackForm />
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
