'use client';

import { useEffect, useState } from 'react';

export default function SpeedIndicator() {
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    // Detectar móviles y preferencias de movimiento
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Desactivar animación si el usuario prefiere menos movimiento
    if (prefersReducedMotion) {
      setSpeed(75); // Velocidad fija
      return;
    }

    // Intervalo más lento en móviles para mejor rendimiento
    const updateInterval = isMobile ? 200 : 100;
    
    const interval = setInterval(() => {
      setSpeed(prev => {
        const variation = isMobile ? 5 : 10; // Menos variación en móviles
        const newSpeed = prev + (Math.random() - 0.5) * variation;
        return Math.max(0, Math.min(120, newSpeed));
      });
    }, updateInterval);

    // Inicializar con velocidad aleatoria
    setSpeed(60 + Math.random() * 40);

    return () => clearInterval(interval);
  }, []);

  const speedPercentage = (speed / 120) * 100;
  const rotation = (speedPercentage / 100) * 180 - 90; // -90 a 90 grados

  return (
    <div className="absolute top-4 right-4 md:top-8 md:right-8 opacity-60">
      <div className="relative w-20 h-20 md:w-24 md:h-24">
        {/* Fondo del velocímetro */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="2"
            strokeDasharray="141.37"
            strokeDashoffset="70.68"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeDasharray="141.37"
            strokeDashoffset={141.37 - (speedPercentage / 100) * 70.68}
            className="transition-all duration-300 ease-out"
          />
        </svg>
        
        {/* Aguja */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-0.5 h-8 bg-primary origin-bottom transition-transform duration-300 ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          />
        </div>
        
        {/* Centro */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-primary rounded-full" />
        </div>
        
        {/* Texto de velocidad */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-xs font-f1-bold text-primary mt-6">
            {Math.round(speed)}
          </div>
        </div>
      </div>
      
      <div className="text-center mt-1">
        <div className="text-xs text-muted-foreground font-f1-bold">KM/H</div>
      </div>
    </div>
  );
}