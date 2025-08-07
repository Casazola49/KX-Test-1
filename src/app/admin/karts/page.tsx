
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import type { Kart } from '@/lib/types';
import KartList from '@/components/admin/KartList'; // Importamos el nuevo componente cliente

// Cliente de Supabase para el servidor
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Función de servidor para obtener los karts
async function getKarts(): Promise<Kart[]> {
  const { data, error } = await supabase.from('karts').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching karts:', error);
    return [];
  }
  return data;
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
