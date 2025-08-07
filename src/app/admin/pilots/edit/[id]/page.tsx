
"use client";

import { useEffect, useState } from 'react';
import PageTitle from '@/components/shared/PageTitle';
import PilotFormV2 from '@/components/admin/PilotFormV2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Section from '@/components/shared/Section';
import type { Pilot } from '@/lib/types';
import { getPilotById } from '@/app/admin/pilots/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { notFound } from 'next/navigation';

function EditPilotSkeleton() {
    return (
        <Card className="max-w-4xl mx-auto shadow-lg">
            <CardHeader>
                <Skeleton className="h-8 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="flex space-x-4">
                    <Skeleton className="h-48 w-48 rounded-lg" />
                    <div className="flex-1 space-y-4">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-3/4" />
                    </div>
                </div>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
            </CardContent>
        </Card>
    )
}

export default function EditPilotPage({ params }: { params: { id: string } }) {
  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPilotData() {
      try {
        const fetchedPilot = await getPilotById(params.id);
        if (!fetchedPilot) {
            // Trigger notFound if the pilot doesn't exist
            return notFound();
        }
        setPilot(fetchedPilot);
      } catch (error) {
        console.error("Failed to load pilot data", error);
        // Optionally, handle error state here
      } finally {
        setLoading(false);
      }
    }
    loadPilotData();
  }, [params.id]);


  const pilotName = pilot ? `${pilot.firstName || ''} ${pilot.lastName || ''}`.trim() : "Cargando...";

  return (
    <>
      <PageTitle title="Panel de Administración" subtitle="Editar Piloto" />
      <Section className="py-8 md:py-12">
        {loading ? (
           <EditPilotSkeleton />
        ) : pilot ? (
            <Card className="max-w-4xl mx-auto shadow-lg">
                <CardHeader>
                    <CardTitle>Editando: {pilotName}</CardTitle>
                </CardHeader>
                <CardContent>
                    <PilotFormV2 pilot={pilot} />
                </CardContent>
            </Card>
        ) : (
            // This part is mostly for safety, as notFound() should redirect
            <Card>
                <CardHeader><CardTitle>Error</CardTitle></CardHeader>
                <CardContent><p>No se pudo cargar la información del piloto.</p></CardContent>
            </Card>
        )}
      </Section>
    </>
  );
}
