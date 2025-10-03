
import PageTitle from '@/components/shared/PageTitle';
import HorizontalAd from '@/components/shared/HorizontalAd';
import { Mechanic } from '@/lib/types';
import AsesoramientoClient from '@/components/client/AsesoramientoClient';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMechanics } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function AsesoramientoPage() {
  const mechanics = await getMechanics();

  return (
    <div className={cn("text-white bg-black pattern-bg min-h-screen")}>
      <PageTitle
        title="ASESORAMIENTO MECÁNICO"
        subtitle="Conecta con expertos y lleva tu kart al límite."
        className="font-formula1 text-4xl sm:text-5xl md:text-6xl neon-text-main"
        subtitleClassName="mt-4 text-lg text-gray-300"
      />
      
      <main className="container mx-auto px-4 py-12">
        {/* Botón para volver a Equipamiento y Servicios */}
        <div className="mb-8">
          <Button 
            asChild 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary hover:text-black transition-all duration-300"
          >
            <Link href="/equipamiento-servicios">
              <ArrowLeft size={16} className="mr-2" />
              Volver a Equipamiento y Servicios
            </Link>
          </Button>
        </div>

        <AsesoramientoClient mechanics={mechanics} />
      </main>

      <div className="mt-24">
        <HorizontalAd section="equipamiento" />
      </div>
    </div>
  );
}
