"use client";

import type { Pilot } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface PilotDriverCardProps {
  pilot: Pilot;
}

const PilotDriverCard: React.FC<PilotDriverCardProps> = ({ pilot }) => {
  const name = `${pilot.firstName || ''} ${pilot.lastName || ''}`.trim() || pilot.name;
  
  // --- REDISEÑO DEL DEGRADADO ---
  // Se eliminan las texturas de líneas y se hace el degradado de color
  // mucho más prominente, yendo de izquierda a derecha.
  const backgroundStyle: React.CSSProperties = {
    backgroundColor: pilot.teamColor || '#1c1c1c',
    backgroundImage: `
      linear-gradient(to right, ${pilot.teamColor || '#1c1c1c'} 40%, #0A0A0A 100%)
    `,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <Link href={`/pilotos-equipos/${pilot.slug}`} className="block group rounded-xl overflow-hidden relative shadow-lg hover:shadow-primary/30 transition-all duration-300 transform hover:-translate-y-1">
        <div 
          className="w-full h-full absolute inset-0"
          style={backgroundStyle}
        ></div>
        
        <div 
          className="w-2 h-full absolute left-0 top-0 transition-all duration-300" 
          style={{ backgroundColor: pilot.teamAccentColor || 'hsl(var(--primary))' }}
        ></div>
        
        <div className="relative flex items-center justify-between p-4 min-h-[180px]">
          <div className="relative z-10 text-white w-1/2 pl-4">
            <p className="font-f1 text-xl text-white drop-shadow-lg text-stroke-contrast" style={{ WebkitTextStroke: '1.5px rgba(0,0,0,0.9)' }}>{pilot.firstName}</p>
            <p className="font-f1-bold text-3xl -mt-1 text-white drop-shadow-lg text-stroke-contrast" style={{ WebkitTextStroke: '1.5px rgba(0,0,0,0.9)' }}>{pilot.lastName}</p>
            <p className="font-sans text-sm text-gray-200 mt-1 drop-shadow-md text-stroke-contrast" style={{ WebkitTextStroke: '1px rgba(0,0,0,0.9)' }}>{pilot.teamName}</p>
            
            <div className="flex items-end mt-4">
              <p className="font-f1-bold text-7xl text-white leading-none drop-shadow-xl text-stroke-contrast-strong" style={{ WebkitTextStroke: '2.5px rgba(0,0,0,0.95)' }}>{pilot.number}</p>
              {pilot.nationality && (
                <Image 
                  src={`https://flagcdn.com/w40/${pilot.nationality.toLowerCase()}.png`}
                  alt={`${pilot.nationality} flag`}
                  width={30}
                  height={20}
                  className="ml-3 mb-1 rounded-sm shadow-md"
                />
              )}
            </div>
          </div>

          <div className="absolute right-0 bottom-0 w-3/5 h-[110%] transition-transform duration-500 ease-in-out group-hover:scale-105">
            {pilot.imageUrl && (
                <Image
                    src={pilot.imageUrl}
                    alt={`Foto de ${name}`}
                    fill
                    style={{objectFit: "contain", objectPosition: "bottom center"}}
                />
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default PilotDriverCard;
