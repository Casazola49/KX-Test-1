
import PageTitle from '@/components/shared/PageTitle';
import NewsForm from '@/components/admin/NewsForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Section from '@/components/shared/Section';

export default function AddNewsPage() {
  return (
    <>
      <PageTitle title="Panel de Administración" subtitle="Añadir Nueva Noticia" />
      <Section className="py-8 md:py-12">
        <Card className="max-w-2xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle>Detalles de la Noticia</CardTitle>
          </CardHeader>
          <CardContent>
            <NewsForm />
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
