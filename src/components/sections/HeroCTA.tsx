'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function HeroCTA() {
  return (
    <div className="flex justify-center items-center mt-8">
      <Button 
        asChild
        size="lg" 
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-f1-bold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
      >
        <Link href="/calendario" className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Ver Calendario
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </Link>
      </Button>
    </div>
  );
}