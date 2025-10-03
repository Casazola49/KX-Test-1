'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { getOptimizedPilotImageProps } from '@/lib/pilots-optimizations';

interface LazyPilotImageProps {
  imageUrl: string;
  pilotName: string;
  className?: string;
  style?: React.CSSProperties;
  fill?: boolean;
}

export default function LazyPilotImage({ 
  imageUrl, 
  pilotName, 
  className, 
  style, 
  fill = false 
}: LazyPilotImageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px' // Empezar a cargar 50px antes
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const imageProps = getOptimizedPilotImageProps(imageUrl, pilotName);

  return (
    <div ref={imgRef} className={className} style={style}>
      {isVisible && (
        <>
          {/* Placeholder mientras carga */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {/* Imagen real */}
          <Image
            {...imageProps}
            fill={fill}
            style={fill ? { objectFit: "contain", objectPosition: "bottom center" } : undefined}
            onLoad={() => setIsLoaded(true)}
            className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </>
      )}
      
      {/* Placeholder inicial */}
      {!isVisible && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-gray-400 text-sm">Cargando...</div>
        </div>
      )}
    </div>
  );
}