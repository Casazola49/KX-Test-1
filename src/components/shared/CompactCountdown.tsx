'use client';

import { useState, useEffect } from 'react';

interface CompactCountdownProps {
  date: string;
  onCountdownEnd?: () => void;
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// Componente ultra-compacto para dispositivos muy pequeños
const CompactCountdown: React.FC<CompactCountdownProps> = ({ date, onCountdownEnd }) => {
  const [timeLeft, setTimeLeft] = useState<CountdownTime | null>(null);
  const [isClient, setIsClient] = useState(false);

  const calculateTimeLeft = (target: Date): CountdownTime => {
    const difference = +target - +new Date();
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  useEffect(() => {
    setIsClient(true);
    const target = new Date(date);
    setTimeLeft(calculateTimeLeft(target));

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(target);
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.days === 0 && newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        if (+target <= +new Date()) {
          clearInterval(timer);
          if (onCountdownEnd) {
            onCountdownEnd();
          }
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [date, onCountdownEnd]);

  if (!isClient || timeLeft === null) {
    return (
      <div className="flex justify-center items-center p-2">
        <p className="text-sm text-primary">Cargando...</p>
      </div>
    );
  }

  const isEnded = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 && (+new Date(date) <= +new Date());

  if (isEnded) {
    return (
      <div className="flex justify-center items-center p-2">
        <p className="text-lg font-bold text-primary">¡Evento iniciado!</p>
      </div>
    );
  }

  const formatValue = (val: number) => String(val).padStart(2, '0');

  return (
    <div className="flex justify-center items-center gap-1 p-2 max-w-full overflow-hidden">
      <div className="flex flex-col items-center">
        <div className="w-6 h-8 bg-card border border-primary/30 rounded flex items-center justify-center">
          <span className="text-xs font-bold text-primary">{formatValue(timeLeft.days)}</span>
        </div>
        <span className="text-[8px] text-muted-foreground mt-0.5">DÍAS</span>
      </div>
      
      <span className="text-primary font-bold">:</span>
      
      <div className="flex flex-col items-center">
        <div className="w-6 h-8 bg-card border border-primary/30 rounded flex items-center justify-center">
          <span className="text-xs font-bold text-primary">{formatValue(timeLeft.hours)}</span>
        </div>
        <span className="text-[8px] text-muted-foreground mt-0.5">HRS</span>
      </div>
      
      <span className="text-primary font-bold">:</span>
      
      <div className="flex flex-col items-center">
        <div className="w-6 h-8 bg-card border border-primary/30 rounded flex items-center justify-center">
          <span className="text-xs font-bold text-primary">{formatValue(timeLeft.minutes)}</span>
        </div>
        <span className="text-[8px] text-muted-foreground mt-0.5">MIN</span>
      </div>
      
      <span className="text-primary font-bold">:</span>
      
      <div className="flex flex-col items-center">
        <div className="w-6 h-8 bg-card border border-primary/30 rounded flex items-center justify-center">
          <span className="text-xs font-bold text-primary">{formatValue(timeLeft.seconds)}</span>
        </div>
        <span className="text-[8px] text-muted-foreground mt-0.5">SEG</span>
      </div>
    </div>
  );
};

export default CompactCountdown;