
import type { Pilot } from '@/lib/types';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, CalendarDays, Trophy, UserCircle, Award } from 'lucide-react';

interface PilotProfileCardProps {
  pilot: Pilot;
}

const PilotProfileCard: React.FC<PilotProfileCardProps> = ({ pilot }) => {
  const dobDate = pilot.dob ? new Date(pilot.dob) : null;
  const age = dobDate ? new Date().getFullYear() - dobDate.getFullYear() : null;

  if (!pilot.imageUrl) return null; // Don't render if no image

  return (
    <Card className="group/pilotcard w-full overflow-hidden shadow-lg hover:shadow-primary/10 transition-shadow duration-300 flex flex-col md:flex-row">
      <div className="md:w-1/3 relative aspect-[3/4] md:aspect-auto bg-muted/20"> {/* Added bg for letterboxing if needed */}
        <Image
          src={pilot.imageUrl}
          alt={`Foto de ${pilot.name}`}
          fill
          objectFit="contain" // Changed from cover to contain
          className="group-hover/pilotcard:scale-105 transition-transform duration-300"
          data-ai-hint="karting pilot portrait"
        />
        {pilot.number && (
          <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground text-xl font-bold w-10 h-10 flex items-center justify-center rounded-full shadow-md">
            {pilot.number}
          </div>
        )}
      </div>
      <div className="flex-grow p-4 md:p-6">
        <CardHeader className="p-0 mb-3">
          <div className="flex justify-between items-start mb-2">
            {pilot.teamName && (
              <div className="flex items-center text-xs text-muted-foreground">
                {pilot.teamLogoUrl && <Image src={pilot.teamLogoUrl} alt={`${pilot.teamName} logo`} width={20} height={20} className="mr-1.5 rounded-sm" data-ai-hint="team logo"/>}
                {pilot.teamName}
              </div>
            )}
            {pilot.category && <Badge variant="outline">{pilot.category}</Badge>}
          </div>
          <CardTitle className="text-2xl md:text-3xl font-bold group-hover/pilotcard:text-primary transition-colors duration-300">
            {pilot.name}
          </CardTitle>
          {pilot.nationality && <CardDescription className="text-sm text-muted-foreground">{pilot.nationality}</CardDescription>}
        </CardHeader>
        <CardContent className="p-0 space-y-3 text-sm">
          {pilot.bio && (
            <div className="flex items-start">
              <UserCircle size={16} className="mr-2 mt-0.5 text-primary flex-shrink-0" />
              <p className="text-muted-foreground leading-relaxed">{pilot.bio}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-2 border-t border-border/50">
            {pilot.dob && age !== null && (
              <div className="flex items-center text-foreground">
                <CalendarDays size={16} className="mr-2 text-primary" /> Edad: {age} años
              </div>
            )}
             {pilot.teamName && (
                <div className="flex items-center text-foreground">
                    <Briefcase size={16} className="mr-2 text-primary" /> Equipo: {pilot.teamName}
                </div>
            )}
          </div>

          {pilot.achievements && pilot.achievements.length > 0 && (
            <div className="pt-2 border-t border-border/50">
              <h4 className="text-xs font-semibold text-muted-foreground mb-1.5 flex items-center">
                <Award size={14} className="mr-1.5 text-primary" />Logros Destacados:
              </h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-0.5 pl-2 text-xs">
                {pilot.achievements.slice(0, 3).map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default PilotProfileCard;
