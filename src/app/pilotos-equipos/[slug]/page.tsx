
import type { Pilot } from '@/lib/types';
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Flag, Calendar, Layers, User, Award, Trophy, Info, BarChart } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Card, CardTitle, CardDescription, CardContent, CardHeader } from '@/components/ui/card';
import { createClient } from '@supabase/supabase-js';
import ModelViewer from '@/components/client/ModelViewer';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getPilot(slug: string): Promise<Pilot | undefined> {
  try {
    const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .eq('slug', slug)
        .limit(1)
        .single();
    
    if (error) throw error;
    
    return data as Pilot;

  } catch (error) {
    console.error(`Error fetching pilot with slug ${slug} from Supabase:`, error);
    return undefined;
  }
}

export default async function PilotDetailPage({ params }: { params: { slug: string } }) {
  const pilot = await getPilot(params.slug);

  if (!pilot) {
     return (
        <Section className="py-12">
            <div className="mb-8">
              <Button variant="outline" asChild>
                <Link href="/pilotos-equipos">
                  <ArrowLeft size={16} className="mr-2" />
                  Volver a la Lista de Pilotos
                </Link>
              </Button>
            </div>
            <Card className="text-center p-8">
                <h1 className="text-2xl font-bold mb-2">Piloto no encontrado</h1>
                <p className="text-muted-foreground">
                    El perfil para este piloto no fue encontrado en nuestra base de datos.
                </p>
            </Card>
        </Section>
    )
  }

  const getAge = (dob: string | null | undefined) => {
    if (!dob) return "N/A";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };

  return (
    <>
      <PageTitle title={`${pilot.firstName} ${pilot.lastName}`} subtitle={pilot.teamName || 'Piloto de Karting'} />
      <Section className="py-8 md:py-12">
        <div className="mb-8">
          <Button variant="outline" asChild>
            <Link href="/pilotos-equipos">
              <ArrowLeft size={16} className="mr-2" />
              Volver a la Lista de Pilotos
            </Link>
          </Button>
        </div>

        {/* --- SECCIÓN SUPERIOR REESTRUCTURADA --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Columna 1: Foto del Piloto (ahora más alta) */}
            <Card className="lg:col-span-1 shadow-2xl overflow-hidden relative border-none flex flex-col h-[600px]" style={{backgroundColor: pilot.teamColor || 'hsl(var(--card))'}}>
                <div className="relative flex-grow">
                    <Image
                        src={pilot.imageUrl || '/pilotos/piloto.png'}
                        alt={`Retrato de ${pilot.firstName} ${pilot.lastName}`}
                        fill
                        style={{objectFit:"contain", objectPosition: "center bottom"}}
                    />
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white w-full z-10">
                    <p className="text-8xl font-bold font-mono text-white/90" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.8)'}}>{pilot.number}</p>
                    <CardTitle className="text-5xl font-bold capitalize -mt-2">{pilot.lastName.toLowerCase()}</CardTitle>
                    <CardDescription className="text-2xl font-light capitalize text-white/90">{pilot.firstName.toLowerCase()}</CardDescription>
                </div>
                <div 
                    className="w-2 h-full absolute left-0 top-0" 
                    style={{ backgroundColor: pilot.teamAccentColor || 'hsl(var(--primary))' }}
                ></div>
            </Card>

            {/* Columna 2: Ficha y Logros (apilados) */}
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Info className="text-primary"/> Ficha Técnica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between"><span className="font-semibold text-muted-foreground flex items-center gap-2"><Flag size={16}/> Nacionalidad</span> <span>{pilot.nationality === 'bo' ? 'Boliviano' : pilot.nationality}</span></div>
                  <div className="flex items-center justify-between"><span className="font-semibold text-muted-foreground flex items-center gap-2"><Calendar size={16}/> Edad</span> <span>{getAge(pilot.dob)} años</span></div>
                  <div className="flex items-center justify-between"><span className="font-semibold text-muted-foreground flex items-center gap-2"><Layers size={16}/> Categoría</span> <span>{pilot.category}</span></div>
                  <div className="flex items-center justify-between"><span className="font-semibold text-muted-foreground flex items-center gap-2"><User size={16}/> Equipo</span> <span>{pilot.teamName || 'Independiente'}</span></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Trophy className="text-primary"/> Logros Destacados</CardTitle>
                </CardHeader>
                <CardContent>
                  {pilot.achievements && pilot.achievements.length > 0 ? (
                    <ul className="space-y-2 list-disc list-inside">
                      {pilot.achievements.map((ach, index) => <li key={index} className="flex items-start gap-2"><Award size={16} className="mt-1 text-yellow-500"/>{ach}</li>)}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No hay logros registrados.</p>
                  )}
                </CardContent>
              </Card>
            </div>
        </div>

        {/* --- NUEVA SECCIÓN DEDICADA AL KART 3D --- */}
        {pilot.model_3d_url && (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart className="text-primary"/> Kart del Piloto</CardTitle>
                </CardHeader>
                <CardContent className="h-[60vh]">
                    <ModelViewer modelUrl={pilot.model_3d_url} />
                </CardContent>
            </Card>
        )}
      </Section>
    </>
  );
}
