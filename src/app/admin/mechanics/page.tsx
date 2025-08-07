
import { createClient } from '@/lib/supabase-server'; // Reverted to alias path
import { Mechanic } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import PageTitle from '@/components/shared/PageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

async function getMechanics(): Promise<Mechanic[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('mechanics')
    .select('*')
    .order('department', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching mechanics:', error);
    return [];
  }
  return data;
}

export default async function AdminMechanicsPage() {
  const mechanics = await getMechanics();

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <PageTitle title="Asesores Mecánicos" />
        <Button asChild>
          <Link href="/admin/mechanics/add">
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Mecánico
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lista de Mecánicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mechanics.length > 0 ? (
              mechanics.map((mechanic) => (
                <div key={mechanic.id} className="bg-card p-4 rounded-lg shadow-md flex flex-col justify-between">
                  <div>
                    {mechanic.image_url && (
                        <div className="relative h-40 w-full mb-4">
                            <Image src={mechanic.image_url} alt={mechanic.name} layout="fill" objectFit="contain" className="rounded-md" />
                        </div>
                    )}
                    <h3 className="text-xl font-bold">{mechanic.name}</h3>
                    <p className="text-muted-foreground">{mechanic.department}</p>
                    <p className="text-sm mt-2">{mechanic.description}</p>
                    {mechanic.website_url && <p className="text-sm mt-2 text-blue-400 break-all">{mechanic.website_url}</p>}
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                     <Button variant="outline" size="sm" asChild>
                       <Link href={`/admin/mechanics/edit/${mechanic.id}`}>Editar</Link>
                     </Button>
                     {/* Delete button would go here, implemented with a client component */}
                  </div>
                </div>
              ))
            ) : (
              <p>No hay mecánicos registrados.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
