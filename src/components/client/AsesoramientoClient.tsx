
'use client';

import { useState, useMemo, useRef } from 'react';
import { Mechanic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, Variants } from 'framer-motion';
import Link from 'next/link';
import { ChevronsRight, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Reusable Animated Components ---

const AnimatedBorder = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-full h-full p-px group">
    <div className="absolute inset-0 overflow-hidden rounded-lg">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full">
        <rect className="svg-border-trace" x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="6" ry="6" fill="none" stroke="hsl(var(--primary))" strokeWidth="2"/>
      </svg>
    </div>
    {children}
  </div>
);

const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const xSpring = useSpring(x, { stiffness: 350, damping: 40 });
  const ySpring = useSpring(y, { stiffness: 350, damping: 40 });

  const rotateX = useTransform(ySpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
    ref.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    ref.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className={cn("relative h-full w-full", className)}>
      {children}
    </motion.div>
  );
};

const AnimatedTitle = ({ title }: { title: string }) => {
  const letters = Array.from(title);
  const container: Variants = { hidden: { opacity: 0 }, visible: (i = 1) => ({ opacity: 1, transition: { staggerChildren: 0.04, delayChildren: i * 0.05 } }) };
  const child: Variants = { visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 12, stiffness: 200 } }, hidden: { opacity: 0, y: 20 } };
  return (
    <CardTitle className="text-xl font-bold font-formula1 text-primary neon-text-subtle h-12">
      <motion.div className="flex flex-wrap" variants={container} initial="hidden" animate="visible">
        {letters.map((letter, index) => <motion.span key={index} variants={child}>{letter === ' ' ? '\u00A0' : letter}</motion.span>)}
      </motion.div>
    </CardTitle>
  );
};


// --- Main Asesoramiento Client Component ---
const allDepartments = ['Servicio Internacional', 'Cochabamba', 'La Paz', 'Santa Cruz', 'Oruro', 'Potosi', 'Chuquisaca', 'Tarija'];

export default function AsesoramientoClient({ mechanics }: { mechanics: Mechanic[] }) {
  const [selectedDept, setSelectedDept] = useState('Servicio Internacional');

  const filteredMechanics = mechanics.filter(m => m.department === selectedDept);

  const listVariants: Variants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } } };
  const cardVariants: Variants = { hidden: { opacity: 0, y: 100, scale: 0.7 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 25 } }, exit: { opacity: 0, y: -50, scale: 0.9 } };

  return (
    <div>
      {/* Department Filters */}
      <div className="mb-16 text-center">
        <h3 className="text-2xl font-formula1 font-bold neon-text-subtle mb-4 tracking-widest">SELECCIONA EL TIPO DE SERVICIO O DEPARTAMENTO</h3>
        <div className="flex flex-wrap justify-center gap-3 p-2 rounded-lg bg-black/30 border border-primary/20">
          {allDepartments.map(dept => (
            <Button key={dept} onClick={() => setSelectedDept(dept)} variant="ghost" className={`capitalize transition-all duration-200 font-bold px-4 py-2 ${selectedDept === dept ? 'bg-primary text-primary-foreground neon-button' : 'text-gray-400 hover:bg-primary/20 hover:text-primary'}`}>
              {dept}
            </Button>
          ))}
        </div>
      </div>

      {/* Mechanics Grid */}
      <motion.div variants={listVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-20">
        <AnimatePresence>
          {filteredMechanics.length > 0 ? (
            filteredMechanics.map((mechanic) => (
              <motion.div key={mechanic.id} variants={cardVariants} layout>
                <TiltCard>
                  <AnimatedBorder>
                    <Card className="bg-black/70 rounded-lg overflow-hidden h-full flex flex-col interactive-glow-card">
                      <CardHeader className="p-0">
                        <div className="relative h-64 w-full flex items-center justify-center">
                          {mechanic.image_url ? (
                            <Image src={mechanic.image_url} alt={mechanic.name} fill className="object-contain p-8" />
                          ) : (
                            <Wrench className="w-24 h-24 text-primary/50" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 flex-grow">
                        <AnimatedTitle title={mechanic.name} />
                        <p className="text-gray-400 mt-2 h-16 overflow-hidden text-sm">{mechanic.description}</p>
                      </CardContent>
                      <CardFooter className="p-4">
                         {mechanic.website_url && (
                            <Button asChild className="w-full bg-primary text-primary-foreground font-bold transition-all duration-300 neon-button transform hover:scale-105">
                              <Link href={mechanic.website_url} target="_blank" rel="noopener noreferrer">
                                Ver Servicios <ChevronsRight className="ml-2 h-5 w-5" />
                              </Link>
                            </Button>
                         )}
                      </CardFooter>
                    </Card>
                  </AnimatedBorder>
                </TiltCard>
              </motion.div>
            ))
          ) : (
            <motion.div initial={{ opacity: 0}} animate={{opacity: 1}} className="col-span-full text-center py-16">
              <p className="text-3xl text-gray-600 font-formula1 tracking-widest">No hay mecánicos disponibles</p>
              <p className="text-gray-400 mt-2">Prueba seleccionando otra opción.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
