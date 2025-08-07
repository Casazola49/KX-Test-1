import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, MapPin, AlertCircle } from 'lucide-react';
import Image from 'next/image';

const currentPanoramaPoints = [
  {
    icon: TrendingUp,
    title: "Campeonatos Activos",
    description: "Actualmente, Bolivia cuenta con campeonatos nacionales y departamentales en diversas categorías, desde infantiles (Kid Kart, Cadetes) hasta seniors y profesionales (Rotax Max, KZ). Estos eventos atraen a un número creciente de participantes y espectadores."
  },
  {
    icon: Users,
    title: "Perfiles de Pilotos Destacados",
    description: "Pilotos como Lucas Careaga (Cochabamba), Marco Bulacia Jr. (Santa Cruz, con experiencia internacional previa en karting), y Rodrigo Gutiérrez Jr. son algunos de los nombres que resuenan. Además, existe una nueva generación de jóvenes talentos empujando fuerte en todas las categorías."
  },
  {
    icon: MapPin,
    title: "Infraestructura y Pistas",
    description: "El país cuenta con varios kartódromos homologados, siendo los más importantes los de Cochabamba (Arocagua), Santa Cruz, La Paz (Pura Pura), Sucre y Tarija. Se realizan esfuerzos continuos por mejorar y mantener estas instalaciones."
  },
  {
    icon: AlertCircle,
    title: "Desafíos y Oportunidades",
    description: "Los principales desafíos incluyen la obtención de patrocinios, el alto costo del equipamiento y la necesidad de mayor difusión. Sin embargo, hay grandes oportunidades de crecimiento a través de la formación de nuevas escuelas, la organización de eventos internacionales y el fomento del deporte base."
  }
];

export default function PanoramaActualPage() {
  return (
    <>
      <PageTitle title="Panorama Actual del Karting" subtitle="Bolivia en la Pista" />
      <Section className="py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-headline mb-4">El Karting Boliviano Hoy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              El karting en Bolivia vive un momento de renovado impulso, con una comunidad apasionada y un calendario de competencias cada vez más consolidado.
              A pesar de los desafíos, el deporte sigue creciendo, formando nuevos talentos y ofreciendo un espectáculo emocionante en cada carrera.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              La Federación Boliviana de Automovilismo Deportivo (FEBAD) y las asociaciones departamentales juegan un rol crucial en la organización y fiscalización
              de las competencias, buscando siempre elevar el nivel y la seguridad del karting nacional.
            </p>
          </div>
          <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
             <Image src="https://placehold.co/600x338.png" alt="Karting moderno en Bolivia" layout="fill" objectFit="cover" data-ai-hint="modern kart race" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {currentPanoramaPoints.map((point, index) => (
            <Card key={index} className="shadow-lg">
              <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                <div className="p-2 bg-primary/10 rounded-md">
                  <point.icon size={24} className="text-primary" />
                </div>
                <CardTitle className="text-lg font-semibold">{point.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{point.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
         <p className="mt-12 text-center text-muted-foreground">
            <em>Esta sección está en constante actualización para reflejar los últimos acontecimientos del karting en Bolivia.</em>
        </p>
      </Section>
    </>
  );
}
