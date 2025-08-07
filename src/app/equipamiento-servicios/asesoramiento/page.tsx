
import { createClient } from '@supabase/supabase-js';
import PageTitle from '@/components/shared/PageTitle';
import AdBanner from '@/components/shared/AdBanner';
import { Mechanic } from '@/lib/types';
import AsesoramientoClient from '@/components/client/AsesoramientoClient';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getMechanics(): Promise<Mechanic[]> {
  const { data, error } = await supabase
    .from('mechanics')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching mechanics:', error);
    return [];
  }
  return data as Mechanic[];
}

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
        <AsesoramientoClient mechanics={mechanics} />
      </main>

      <div className="mt-24">
        <AdBanner />
      </div>
    </div>
  );
}
