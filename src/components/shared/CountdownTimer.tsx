
"use client";

import { useState, useEffect } from 'react';
import FlipUnit from './FlipUnit';

interface CountdownTimerProps {
  date: string; // La fecha del evento en formato ISO
  onCountdownEnd?: () => void;
}

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ date, onCountdownEnd }) => {
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
      <div className="flex justify-center items-center p-0 animate-pulse" style={{ minHeight: '120px' }}>
        <p className="text-xl md:text-2xl font-headline text-primary">Cargando cuenta regresiva...</p>
      </div>
    );
  }

  const isEnded = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0 && (+new Date(date) <= +new Date());

  if (isEnded) {
     return (
      <div className="flex justify-center items-center p-4">
        <p className="text-2xl md:text-4xl font-headline text-primary animate-in fade-in zoom-in-105 duration-700">¡El evento ha comenzado!</p>
      </div>
    );
  }


  
  return (
    <div className="countdown-container-force">
      <div className="countdown-force-horizontal p-1 sm:p-2 md:p-4 rounded-lg bg-card/20 backdrop-blur-sm border border-primary/20 max-w-full">
        <FlipUnit
          currentValue={timeLeft.days}
          label="DÍAS"
          delay={0}
          className="flip-unit-horizontal"
        />
        <div className="countdown-separator-horizontal text-sm sm:text-base md:text-2xl lg:text-3xl text-primary font-bold animate-pulse">:</div>
        <FlipUnit
          currentValue={timeLeft.hours}
          label="HORAS"
          delay={100}
          className="flip-unit-horizontal"
        />
        <div className="countdown-separator-horizontal text-sm sm:text-base md:text-2xl lg:text-3xl text-primary font-bold animate-pulse">:</div>
        <FlipUnit
          currentValue={timeLeft.minutes}
          label="MINUTOS"
          delay={200}
          className="flip-unit-horizontal"
        />
        <div className="countdown-separator-horizontal text-sm sm:text-base md:text-2xl lg:text-3xl text-primary font-bold animate-pulse">:</div>
        <FlipUnit
          currentValue={timeLeft.seconds}
          label="SEGUNDOS"
          delay={300}
          className="flip-unit-horizontal"
        />
      </div>
      
      {/* Mensaje adicional */}
      <div className="text-center mt-2 md:mt-4">
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
          ¡No te pierdas la próxima carrera!
        </p>
      </div>
    </div>
  );
};

export default CountdownTimer;
