
'use client';

import Link from 'next/link';
import { SITE_TITLE } from '@/lib/constants';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

type LogoProps = {
  className?: string;
};

const Logo: React.FC<LogoProps> = ({ className }) => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determinar qué logo usar basado en el tema
  const currentTheme = mounted ? (resolvedTheme || theme) : 'dark';
  const logoSrc = currentTheme === 'light' ? '/logo-claro.png' : '/logo 1.png';

  return (
    <Link href="/" aria-label={`Volver a la página de inicio de ${SITE_TITLE}`}>
      <div className={cn(`flex items-center group`, className)}>
        <Image 
          src={logoSrc}
          alt={`${SITE_TITLE} Logo`} 
          width={150}
          height={40}
          priority 
          className={cn(
            "group-hover:opacity-80 transition-all duration-300",
            !mounted && "opacity-0"
          )}
          style={{ 
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
          data-ai-hint="company logo karting"
          onLoad={() => {
            // Asegurar que la imagen sea visible una vez cargada
            if (mounted) {
              const img = document.querySelector(`img[alt="${SITE_TITLE} Logo"]`) as HTMLImageElement;
              if (img) img.style.opacity = '1';
            }
          }}
        />
      </div>
    </Link>
  );
};

export default Logo;
    