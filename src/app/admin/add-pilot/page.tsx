
"use client"
import PageTitle from '@/components/shared/PageTitle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Section from '@/components/shared/Section';
import PilotFormV2 from '@/components/admin/PilotFormV2';

export default function AddPilotPage() {
  return (
    <>
      <PageTitle title="Panel de Administración" subtitle="Añadir Nuevo Piloto" />
      <Section className="py-8 md:py-12">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle>Detalles del Piloto</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Se asegura de usar el componente correcto, ahora unificado */}
            <PilotFormV2 />
          </CardContent>
        </Card>
      </Section>
    </>
  );
}
