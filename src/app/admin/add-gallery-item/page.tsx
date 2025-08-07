
import PageTitle from '@/components/shared/PageTitle';
import GalleryItemForm from '@/components/admin/GalleryItemForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Section from '@/components/shared/Section';
import { getRaceEvents } from '@/app/admin/standings/actions';

export default async function AddGalleryItemPage() {
  const events = await getRaceEvents();
  return (
    <>
      <PageTitle title="Panel de Administración" subtitle="Añadir a Galería" />
      <Section className="py-8 md:py-12">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle>Detalles del Elemento</CardTitle>
          </CardHeader>
          <CardContent>
            <GalleryItemForm events={events} />
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
