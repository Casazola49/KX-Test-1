
import React from 'react';
import PageTitle from '@/components/shared/PageTitle';
import MechanicForm from '@/components/admin/MechanicForm';
import { createClient } from '@/lib/supabase-server'; // Reverted to alias path
import { notFound } from 'next/navigation';
import { Mechanic } from '@/lib/types';

interface EditMechanicPageProps {
  params: {
    id: string;
  };
}

async function getMechanic(id: string): Promise<Mechanic | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('mechanics')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        console.error('Error fetching mechanic or mechanic not found:', error);
        return null;
    }
    return data;
}


export default async function EditMechanicPage({ params }: EditMechanicPageProps) {
  const mechanic = await getMechanic(params.id);

  if (!mechanic) {
    notFound();
  }

  return (
    <>
      <PageTitle title="Editar Asesor Mecánico" />
      <MechanicForm mechanic={mechanic} />
    </>
  );
}
