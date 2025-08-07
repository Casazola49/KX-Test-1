
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
    <div className="flex justify-center items-start flex-wrap p-0 gap-x-2 gap-y-1 sm:gap-x-3 md:gap-x-4 lg:gap-x-5">
      <FlipUnit currentValue={timeLeft.days} label="DÍAS" className="animate-in fade-in zoom-in-90 duration-500" delay={0} />
      <FlipUnit currentValue={timeLeft.hours} label="HORAS" className="animate-in fade-in zoom-in-90 duration-500" delay={100} />
      <FlipUnit currentValue={timeLeft.minutes} label="MINUTOS" className="animate-in fade-in zoom-in-90 duration-500" delay={200} />
      <FlipUnit currentValue={timeLeft.seconds} label="SEGUNDOS" className="animate-in fade-in zoom-in-90 duration-500" delay={300} />
    </div>
  );
};

export default CountdownTimer;
