
import { createClient } from '@supabase/supabase-js';
import PageTitle from '@/components/shared/PageTitle';
import AdBanner from '@/components/shared/AdBanner';
import { Product } from '@/lib/types';
import EquipamientoServiciosClient from '@/components/client/EquipamientoServiciosClient';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getProducts() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return products as Product[];
}

export default async function EquipamientoServiciosPage() {
  const products = await getProducts();

  return (
    <div 
      className={cn(
        "text-white bg-black pattern-bg min-h-screen",
      )}
    >
      <PageTitle
        title="EQUIPAMIENTO Y SERVICIOS"
        subtitle="Todo lo que necesitas para dominar la pista. Auspiciadores oficiales."
        className="font-formula1 text-4xl sm:text-5xl md:text-6xl neon-text-main"
        subtitleClassName="mt-4 text-lg text-gray-300"
      />
      
      <main className="container mx-auto px-4 py-12">
        <EquipamientoServiciosClient products={products} />

        <section className="mt-32 text-center">
          <div className="relative inline-block p-8 rounded-lg bg-black/50 border border-primary/30 neon-pulse-box">
            <h2 className="text-3xl font-bold font-formula1 neon-text-main">¿NECESITAS ASESORAMIENTO PROFESIONAL?</h2>
            <p className="mt-4 text-lg text-gray-300">
              Conecta con nuestros expertos para obtener el mejor rendimiento de tu kart.
            </p>
            <Button asChild className="mt-6 bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 neon-button">
              <Link href="/equipamiento-servicios/asesoramiento">
                Obtener Asesoramiento <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <div className="mt-24">
        <AdBanner />
      </div>
    </div>
  );
}
