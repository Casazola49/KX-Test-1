import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, MapPin, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import AdBanner from '@/components/shared/AdBanner';

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
        {/* Título principal y descripción */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary mb-6">
            Estructura Dirigencial del Karting Boliviano
          </h2>
          <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
            Para entender el pulso del karting en Bolivia, es fundamental conocer a las personas y las entidades que, con su liderazgo y dedicación, hacen posible que los motores sigan rugiendo en nuestras pistas.
          </p>
        </div>

        {/* Imagen destacada */}
        <div className="mb-12">
          <div className="rounded-lg overflow-hidden shadow-lg bg-muted max-w-2xl mx-auto">
            <Image
              src="/images/panorama-karting.png"
              alt="Panorama del karting boliviano - Estructura dirigencial"
              width={600}
              height={338}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>

        {/* Contenido organizado en secciones */}
        <div className="space-y-12">
          {/* Comisión Nacional */}
          <div className="bg-primary/5 p-6 rounded-lg border-l-4 border-primary">
            <h3 className="text-2xl font-semibold text-primary mb-4">
              Comisión Nacional de Karting (CNK) Bolivia
            </h3>

            <p className="text-muted-foreground mb-4">
              Esta es la máxima autoridad del karting a nivel nacional, responsable de normar, organizar y promover la disciplina en todo el país, así como de coordinar los campeonatos nacionales.
            </p>

            <div className="bg-background p-4 rounded-lg border">
              <p className="font-medium text-foreground">
                <strong>Presidente:</strong> Sr. Iván Limachi<br />
                <strong>Vicepresidente:</strong> Sr. Abel Iriarte
              </p>
            </div>
          </div>

          {/* Asociaciones Departamentales */}
          <div>
            <h3 className="text-2xl font-semibold text-primary mb-6 text-center">
              Asociaciones Departamentales de Karting
            </h3>

            <p className="text-muted-foreground mb-8 text-center max-w-3xl mx-auto">
              A nivel departamental, la pasión y la organización se gestionan a través de asociaciones locales. Ellas son las encargadas de organizar los campeonatos regionales, promover el desarrollo de pilotos y gestionar los kartódromos de su jurisdicción.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-muted/50 p-4 rounded-lg border">
                <h4 className="font-semibold text-primary mb-2">Asociación de Karting Santa Cruz</h4>
                <p className="text-sm text-foreground">
                  <strong>Presidente:</strong> Sr. Jhasmany Hasse<br />
                  <strong>Vicepresidenta:</strong> Sra. Ericka Bezerra
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg border">
                <h4 className="font-semibold text-primary mb-2">Asociación de Karting La Paz</h4>
                <p className="text-sm text-foreground">
                  <strong>Presidente:</strong> Sr. Alejandro Ascarrunz<br />
                  <strong>Vicepresidente:</strong> Sr. Raúl Márquez
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg border">
                <h4 className="font-semibold text-primary mb-2">Asociación de Karting Potosí</h4>
                <p className="text-sm text-foreground">
                  <strong>Presidente:</strong> Sr. Jaime Cervantes<br />
                  <strong>Vicepresidente:</strong> Sr. Wilson Huanaco
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg border">
                <h4 className="font-semibold text-primary mb-2">Asociación de Karting Chuquisaca</h4>
                <p className="text-sm text-foreground">
                  <strong>Presidente:</strong> Sr. Carlos Keneth Incata Doria Medina<br />
                  <strong>Vicepresidente:</strong> Sr. José Francisco Iporre Hinojosa
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg border">
                <h4 className="font-semibold text-primary mb-2">Asociación de Karting Tarija</h4>
                <p className="text-sm text-foreground">
                  <strong>Presidente:</strong> Sr. Luis Antonio Pereira Gallardo<br />
                  <strong>Vicepresidente:</strong> Sr. Delfín Isidro Herrera Mamani
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg border">
                <h4 className="font-semibold text-primary mb-2">Asociación de Karting Cochabamba</h4>
                <p className="text-sm text-foreground">
                  <strong>Presidente:</strong> Sr. Andrés Jiménez<br />
                  <strong>Vicepresidente:</strong> (Información pendiente de confirmación)
                </p>
              </div>
            </div>
          </div>

          {/* Mensaje final */}
          <div className="bg-primary/5 p-6 rounded-lg border-l-4 border-primary">
            <p className="text-foreground mb-4 text-center">
              Esta estructura es el esqueleto que sostiene la competición y el desarrollo del karting en cada rincón de Bolivia. Son estas personas, con su visión y su trabajo incansable, quienes aseguran que el futuro de nuestro deporte siga acelerando.
            </p>

            <p className="text-foreground text-center">
              En <strong className="text-primary">KartXperience</strong>, valoramos enormemente el compromiso de estos dirigentes. Su labor es fundamental para que los pilotos tengan pistas, regulaciones claras y un calendario que les permita demostrar su talento.
            </p>
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

        <AdBanner />
      </Section>
    </>
  );
}
