import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import AdBanner from '@/components/shared/AdBanner';

export default function HistoriaPage() {
  return (
    <>
      <PageTitle title="Historia del Karting en Bolivia" subtitle="Un Legado de Velocidad" />
      <Section className="py-8 md:py-12">
        <Card className="p-6 md:p-8 lg:p-10 shadow-lg">
          <CardContent className="prose prose-lg dark:prose-invert max-w-none">
            <div className="float-right ml-6 mb-4 w-full md:w-1/3">
              <div className="rounded-lg overflow-hidden shadow-lg bg-muted">
                <Image 
                  src="/images/historia-karting.png" 
                  alt="Foto histórica de karting en Bolivia" 
                  width={600} 
                  height={400} 
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
              <p className="text-xs text-center text-muted-foreground mt-1">Imagen de archivo de los inicios del karting.</p>
            </div>
            <p>
              El karting en Bolivia tiene una rica historia que se remonta a mediados del siglo XX. Introducido por entusiastas del automovilismo,
              rápidamente ganó popularidad como una disciplina accesible y formativa para futuros pilotos. Las primeras competencias se organizaban
              en circuitos improvisados, con karts a menudo construidos artesanalmente.
            </p>
            <p>
              En las décadas de 1970 y 1980, el karting comenzó a formalizarse con la creación de los primeros clubes y asociaciones departamentales.
              Esto llevó a la organización de campeonatos más estructurados y a la adopción de reglamentos técnicos más estandarizados,
              siguiendo las tendencias internacionales. Ciudades como La Paz, Cochabamba y Santa Cruz fueron pioneras en el desarrollo de esta disciplina.
            </p>
            <h3 className="font-headline">Hitos Importantes</h3>
            <ul>
              <li><strong>Años 60:</strong> Primeras carreras y karts introducidos en el país.</li>
              <li><strong>Años 70:</strong> Formación de los primeros clubes y asociaciones. Construcción de los primeros kartódromos dedicados.</li>
              <li><strong>Años 80-90:</strong> Consolidación de campeonatos nacionales y mayor participación internacional de pilotos bolivianos.</li>
              <li><strong>Siglo XXI:</strong> Modernización de pistas, adopción de nuevas tecnologías y categorías. Surgimiento de nuevas generaciones de pilotos talentosos.</li>
            </ul>
            <p>
              A lo largo de los años, el karting boliviano ha sido cuna de grandes pilotos que luego destacaron en otras categorías del automovilismo
              nacional e internacional. La pasión por la velocidad y la competencia sigue impulsando el crecimiento de este deporte en todo el país.
              KartXperience Bolivia se enorgullece de ser parte de esta continua historia, promoviendo el karting para las nuevas generaciones.
            </p>
             <p className="mt-6 text-muted-foreground">
              <em>Esta sección se encuentra en desarrollo y se actualizará con más detalles, fotografías históricas y testimonios.</em>
            </p>
          </CardContent>
        </Card>
        
        <AdBanner />
      </Section>
    </>
  );
}
