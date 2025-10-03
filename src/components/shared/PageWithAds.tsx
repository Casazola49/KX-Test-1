'use client';

import { usePathname } from 'next/navigation';
import HorizontalAd from './HorizontalAd';

interface PageWithAdsProps {
  children: React.ReactNode;
  showTopAd?: boolean;
  showBottomAd?: boolean;
  showMiddleAd?: boolean;
  className?: string;
}

export default function PageWithAds({ 
  children, 
  showTopAd = false, 
  showBottomAd = true, 
  showMiddleAd = false,
  className = ''
}: PageWithAdsProps) {
  const pathname = usePathname();
  
  // No mostrar anuncios en páginas de admin
  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  const getSectionFromPath = (path: string): string => {
    if (path === '/') return 'home';
    if (path.startsWith('/noticias')) return 'noticias';
    if (path.startsWith('/eventos')) return 'eventos';
    if (path.startsWith('/pilotos')) return 'pilotos';
    if (path.startsWith('/galeria')) return 'galeria';
    if (path.startsWith('/pistas')) return 'pistas';
    if (path.startsWith('/kart')) return 'kart';
    if (path.startsWith('/equipamiento')) return 'equipamiento';
    if (path.startsWith('/reglamento')) return 'reglamento';
    if (path.startsWith('/contacto')) return 'contacto';
    if (path.startsWith('/live')) return 'live';
    return 'home';
  };

  const section = getSectionFromPath(pathname);

  return (
    <div className={className}>
      {showTopAd && <HorizontalAd section={section} />}
      
      {showMiddleAd ? (
        <div>
          {/* Renderizar la primera mitad del contenido */}
          <div className="first-half">
            {children}
          </div>
          <HorizontalAd section={section} />
          {/* Renderizar la segunda mitad del contenido */}
        </div>
      ) : (
        children
      )}
      
      {showBottomAd && <HorizontalAd section={section} />}
    </div>
  );
}