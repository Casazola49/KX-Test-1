import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckSquare, Users, ShieldCheck, Award, Map, DollarSign, Heart } from 'lucide-react';

const steps = [
  {
    icon: Heart,
    title: "1. Pasión y Decisión",
    description: "El primer paso es tener el deseo de competir y la determinación para aprender y mejorar. ¡El karting es un deporte emocionante y exigente!",
  },
  {
    icon: Map,
    title: "2. Encuentra tu Pista Local",
    description: "Visita el kartódromo más cercano. En Cochabamba, el Kartódromo de Arocagua es un excelente punto de partida. Familiarízate con las instalaciones y observa algunas carreras.",
  },
  {
    icon: Users,
    title: "3. Únete a una Escuela o Club",
    description: "Muchas pistas ofrecen escuelas de karting para principiantes. Aprenderás los fundamentos de la conducción, las reglas de seguridad y las técnicas básicas.",
  },
  {
    icon: DollarSign,
    title: "4. Considera tu Equipamiento y Kart",
    description: "Inicialmente, puedes alquilar karts. A medida que progreses, podrías considerar adquirir tu propio kart y equipo de seguridad (casco, traje, guantes, etc.).",
  },
  {
    icon: ShieldCheck,
    title: "5. Obtén tu Licencia",
    description: "Para competir oficialmente, necesitarás una licencia deportiva emitida por la Federación Boliviana de Automovilismo Deportivo (FEBAD) o la asociación departamental.",
  },
  {
    icon: Award,
    title: "6. ¡Empieza a Competir!",
    description: "Inscríbete en campeonatos locales o regionales en la categoría adecuada para tu edad y experiencia. ¡La práctica y la competencia son claves para mejorar!",
  }
];

export default function ComoSerPilotoPage() {
  return (
    <>
      <PageTitle title="¿Cómo Ser Piloto de Karting?" subtitle="Tu Camino a la Pista" />
      <Section className="py-8 md:py-12">
        <p className="text-center text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
          Convertirse en piloto de karting es una aventura emocionante que combina habilidad, estrategia y pasión por la velocidad.
          Aquí te presentamos una guía básica para iniciar tu viaje en el mundo del karting en Bolivia.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="flex flex-col shadow-lg hover:shadow-primary/10 transition-shadow items-center text-center">
              <CardHeader>
                <div className="p-4 bg-primary/10 rounded-full mb-4 w-fit mx-auto">
                  <step.icon size={40} className="text-primary" />
                </div>
                <CardTitle className="text-xl font-bold">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center p-6 bg-card rounded-lg border border-border">
          <h3 className="text-2xl font-semibold mb-3">Recursos Adicionales</h3>
          <p className="text-muted-foreground mb-6">
            Te recomendamos contactar con la Federación Boliviana de Automovilismo Deportivo (FEBAD) o las asociaciones
            departamentales de karting para obtener información más detallada y actualizada.
          </p>
          <Button asChild size="lg">
            <Link href="/contacto">Contáctanos para más Información</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
