
import Link from 'next/link';
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import type { Kart } from '@/lib/types';
import KartList from '@/components/admin/KartList';
import { getAllKarts } from '@/lib/data-service';

// Función de servidor para obtener los karts desde Firebase
async function getKarts(): Promise<Kart[]> {
  try {
    const karts = await getAllKarts();
    return karts || [];
  } catch (error) {
    console.error('Error fetching karts:', error);
    return [];
  }
}

// La página ahora es un Componente de Servidor puro
export default async function KartsAdminPage() {
  const karts = await getKarts();

  return (
    <>
      <PageTitle title="Panel de Administración" subtitle="Gestionar Karts 3D" />
      <Section className="py-8 md:py-12">
        <Card className="max-w-7xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lista de Karts</CardTitle>
            <Link href="/admin/karts/add">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Nuevo Kart
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {/* Renderizamos el componente cliente, pasándole los datos iniciales */}
            <KartList initialKarts={karts} />
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
