
import type { TrackInfo } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, Ruler, TrendingUp, ListChecks, Mountain, Zap, Info, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';


interface TrackInfoCardProps {
  track: TrackInfo;
}

const DetailItem: React.FC<{ icon: React.ElementType, label: string, value?: string | number | null }> = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start text-sm">
      <Icon size={16} className="mr-2 mt-0.5 text-primary flex-shrink-0" />
      <div>
        <span className="font-semibold text-foreground/90">{label}:</span>
        <span className="ml-1 text-muted-foreground">{value}</span>
      </div>
    </div>
  );
};

const TrackInfoCard: React.FC<TrackInfoCardProps> = ({ track }) => {
  const aiHint = `karting track ${track.location?.split(',')[0].toLowerCase()}`;

  return (
    <Card className="group/trackcard w-full overflow-hidden shadow-lg hover:shadow-primary/10 transition-shadow duration-300 flex flex-col md:flex-row my-6">
      <div className="md:w-2/5 relative aspect-video md:aspect-auto min-h-[250px] md:min-h-0">
        <Image
          src={track.image_url || 'https://placehold.co/800x600.png'}
          alt={`Imagen de ${track.name}`}
          fill
          objectFit="cover"
          className="group-hover/trackcard:scale-105 transition-transform duration-300"
          data-ai-hint={aiHint}
        />
      </div>
      <div className="flex-grow p-4 md:p-6 flex flex-col">
        <CardHeader className="p-0 mb-3">
          <CardTitle className="text-2xl md:text-3xl font-bold group-hover/trackcard:text-primary transition-colors duration-300">
            {track.name}
          </CardTitle>
          <CardDescription className="text-md text-muted-foreground flex items-center">
            <MapPin size={16} className="mr-1.5 text-primary/80" /> {track.location}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-3 flex-grow">
          {track.description && <p className="text-muted-foreground text-sm mb-3">{track.description}</p>}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-border/50">
            <DetailItem icon={Ruler} label="Longitud" value={track.length} />
            <DetailItem icon={Ruler} label="Ancho" value={track.width} />
            <DetailItem icon={TrendingUp} label="Curvas" value={track.curves?.toString()} />
            <DetailItem icon={Mountain} label="Altitud" value={track.altitude} />
            <DetailItem icon={Zap} label="Récord de Pista" value={track.record} />
            <DetailItem icon={Zap} label="Velocidad Máx. (aprox.)" value={track.max_speed} />
          </div>

          {track.infrastructure && track.infrastructure.length > 0 && (
            <div className="pt-3 border-t border-border/50">
              <h4 className="text-sm font-semibold text-foreground/90 mb-1.5 flex items-center">
                <ListChecks size={16} className="mr-1.5 text-primary" />Infraestructura:
              </h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-0.5 pl-2 text-sm">
                {track.infrastructure.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
         <div className="mt-4 pt-4 border-t border-border/50">
            <Button asChild variant="outline">
                <Link href={`/pistas/${track.id}`}>
                    Ver Detalles y Eventos
                    <ArrowRight className="ml-2 h-4 w-4"/>
                </Link>
            </Button>
        </div>
      </div>
    </Card>
  );
};

export default TrackInfoCard;
