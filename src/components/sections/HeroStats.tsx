'use client';

import { Users, Calendar, Trophy, Zap } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: "150+",
    label: "Pilotos Activos",
    description: "Comunidad creciente"
  },
  {
    icon: Calendar,
    value: "24",
    label: "Eventos al Año",
    description: "Competencias regulares"
  },
  {
    icon: Trophy,
    value: "12",
    label: "Campeonatos",
    description: "Temporadas completadas"
  },
  {
    icon: Zap,
    value: "80+",
    label: "Km/h Máxima",
    description: "Velocidad alcanzada"
  }
];

export default function HeroStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-card/30 backdrop-blur-sm border border-primary/10 rounded-xl p-3 md:p-4 text-center hover:border-primary/30 transition-all duration-300 hover:scale-105 group"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex justify-center mb-2 md:mb-3">
              <div className="w-8 h-8 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                <Icon className="w-4 h-4 md:w-6 md:h-6 text-primary" />
              </div>
            </div>
            <div className="text-lg md:text-2xl lg:text-3xl font-f1-bold text-primary mb-1">
              {stat.value}
            </div>
            <div className="text-xs md:text-sm font-f1-bold text-foreground mb-1">
              {stat.label}
            </div>
            <div className="text-xs text-muted-foreground hidden sm:block">
              {stat.description}
            </div>
          </div>
        );
      })}
    </div>
  );
}