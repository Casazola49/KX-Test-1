import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Zap, Globe, Wrench } from 'lucide-react';
import Image from 'next/image';
import AdBanner from '@/components/shared/AdBanner';

const futureAspects = [
  {
    icon: TrendingUp,
    title: "Crecimiento Sostenido",
    description: "Se espera que la popularidad del karting continúe creciendo, con más participantes en todas las categorías y mayor interés del público y los medios.",
  },
  {
    icon: Zap,
    title: "Adopción de Nuevas Tecnologías",
    description: "La posible introducción de karts eléctricos, sistemas de telemetría avanzados y mejoras en la seguridad marcarán el futuro tecnológico del deporte.",
  },
  {
    icon: Globe,
    title: "Mayor Proyección Internacional",
    description: "Con el fomento de talentos y la participación en eventos sudamericanos y mundiales, se busca posicionar a Bolivia en el mapa del karting internacional.",
  },
  {
    icon: Wrench,
    title: "Profesionalización y Formación",
    description: "El fortalecimiento de escuelas de pilotos, la capacitación de mecánicos y la mejora en la organización de eventos son claves para el desarrollo futuro."
  }
];

export default function FuturoPage() {
  return (
    <>
      <PageTitle title="El Futuro del Karting en Bolivia" subtitle="Acelerando Hacia Adelante" />
      <Section className="py-8 md:py-12">
        <div className="text-center mb-12 max-w-3xl mx-auto">
            <p className="text-lg text-muted-foreground leading-relaxed">
                El karting boliviano se encuentra en una trayectoria ascendente, con un enorme potencial para consolidarse como una
                disciplina deportiva de referencia. La combinación de talento emergente, pasión de la comunidad y esfuerzos
                institucionales auguran un futuro prometedor.
            </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="rounded-lg overflow-hidden shadow-lg bg-muted">
                <Image 
                    src="/images/futuro-karting.png" 
                    alt="Visión futura del karting" 
                    width={600}
                    height={338}
                    className="w-full h-auto object-contain"
                    priority
                />
            </div>
            <div className="space-y-6">
              {futureAspects.slice(0,2).map((aspect, index) => (
                <Card key={index} className="shadow-md">
                  <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <aspect.icon size={24} className="text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold">{aspect.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{aspect.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-8">
             {futureAspects.slice(2).map((aspect, index) => (
                <Card key={index} className="shadow-md">
                  <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <aspect.icon size={24} className="text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold">{aspect.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{aspect.description}</p>
                  </CardContent>
                </Card>
              ))}
        </div>
         <p className="mt-12 text-center text-muted-foreground">
            <em>KartXperience Bolivia se compromete a ser un actor clave en la configuración de este emocionante futuro.</em>
        </p>
        
        <AdBanner />
      </Section>
    </>
  );
}
