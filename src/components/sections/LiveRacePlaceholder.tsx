import Section from '@/components/shared/Section';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioTower, BarChart2, ListOrdered } from 'lucide-react';

// Definimos las props que el componente aceptará
interface LiveRacePlaceholderProps {
  raceName?: string; // Hacemos que raceName sea opcional
}

const LiveRacePlaceholder: React.FC<LiveRacePlaceholderProps> = ({ raceName }) => {
  return (
    // Usamos el nombre de la carrera si está disponible, si no, un texto por defecto.
    <Section title={raceName ? `🔴 EN VIVO: ${raceName}` : "🔴 Carrera en Vivo"} subtitle="Transmisión en directo" className="bg-gradient-to-b from-red-900/20 to-background">
      <Card className="text-center shadow-xl border-primary/50">
        <CardHeader>
          <div className="mx-auto w-fit p-4 bg-primary/10 rounded-full mb-4">
             <RadioTower size={48} className="text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold font-headline">¡Siente la Adrenalina en Tiempo Real!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-2">
            Estamos trabajando para traerte la emoción de las carreras de KartXperience Bolivia directamente a tu pantalla.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-foreground">
            Gracias a la tecnología de transponders MyLaps en los karts, pronto podrás disfrutar de:
          </p>
          <ul className="list-none space-y-3 text-left max-w-md mx-auto">
            <li className="flex items-start">
              <BarChart2 size={24} className="text-accent mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Estadísticas en Vivo</h4>
                <p className="text-sm text-muted-foreground">Tiempos por vuelta, velocidades máximas, comparativas entre pilotos y más.</p>
              </div>
            </li>
            <li className="flex items-start">
              <ListOrdered size={24} className="text-accent mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Tabla de Posiciones Dinámica</h4>
                <p className="text-sm text-muted-foreground">Sigue las posiciones actualizadas al instante durante toda la carrera.</p>
              </div>
            </li>
             <li className="flex items-start">
              <RadioTower size={24} className="text-accent mr-3 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Posible Transmisión de Video</h4>
                <p className="text-sm text-muted-foreground">Exploraremos opciones para integrar video en vivo de los eventos más importantes.</p>
              </div>
            </li>
          </ul>
          <p className="text-sm text-muted-foreground pt-4 border-t border-border">
            Esta funcionalidad es una prioridad clave y estamos emocionados por las posibilidades que ofrecerá. ¡Mantente atento para más actualizaciones!
          </p>
        </CardContent>
      </Card>
    </Section>
  );
};

export default LiveRacePlaceholder;
