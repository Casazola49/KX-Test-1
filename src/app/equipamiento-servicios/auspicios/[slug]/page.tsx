
import type { AuspicioItem } from '@/lib/types';
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AuspicioDetailView from '@/components/client/AuspicioDetailView';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

async function getAuspicioItem(slug: string): Promise<AuspicioItem | undefined> {
  try {
    // Por ahora retornamos undefined ya que no tenemos auspicios en Firebase
    // TODO: Implementar cuando se migre la tabla de auspicios
    console.log(`Auspicio item with slug ${slug} not implemented in Firebase yet`);
    return undefined;
  } catch (error) {
    console.error(`Error fetching auspicio item with slug ${slug}:`, error);
    return undefined;
  }
}

export default async function AuspicioDetailPage({ params }: { params: { slug: string } }) {
  const auspicioItem = await getAuspicioItem(params.slug);

  if (!auspicioItem) {
     return (
        <Section className="py-12">
            <div className="mb-8">
              <Button variant="outline" asChild>
                <Link href="/equipamiento-servicios">
                  <ArrowLeft size={16} className="mr-2" />
                  Volver a Equipamiento y Servicios
                </Link>
              </Button>
            </div>
            <Card className="text-center p-8">
                <h1 className="text-2xl font-bold mb-2">Producto no encontrado</h1>
                <p className="text-muted-foreground">
                    Los detalles de este producto se cargarán desde nuestra base de datos muy pronto.
                </p>
            </Card>
        </Section>
    )
  }

  return (
    <>
      <PageTitle title={auspicioItem.title} subtitle="Detalles del Producto/Servicio" />
      <Section className="py-8 md:py-12">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/equipamiento-servicios">
              <ArrowLeft size={16} className="mr-2" />
              Volver a Equipamiento y Servicios
            </Link>
          </Button>
        </div>
        <AuspicioDetailView auspicioItem={auspicioItem} />
      </Section>
    </>
  );
}
