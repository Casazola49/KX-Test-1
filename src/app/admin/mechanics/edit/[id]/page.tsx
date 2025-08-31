
import React from 'react';
import PageTitle from '@/components/shared/PageTitle';
import MechanicForm from '@/components/admin/MechanicForm';
import { notFound } from 'next/navigation';
import { Mechanic } from '@/lib/types';
import { getMechanicById } from '@/lib/data-service';

interface EditMechanicPageProps {
  params: {
    id: string;
  };
}

async function getMechanic(id: string): Promise<Mechanic | null> {
  try {
    return await getMechanicById(id);
  } catch (error) {
    console.error('Error fetching mechanic:', error);
    return null;
  }
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
