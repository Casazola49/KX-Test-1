
import Link from 'next/link';
import { SITE_TITLE } from '@/lib/constants';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
};

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <Link href="/" aria-label={`Volver a la página de inicio de ${SITE_TITLE}`}>
      <div className={cn(`flex items-center group`, className)}>
        <Image 
          src="/logo 1.png" 
          alt={`${SITE_TITLE} Logo`} 
          width={150} // Ajusta el ancho según el tamaño de tu nuevo logo
          height={40} // Ajusta la altura según el tamaño de tu nuevo logo
          priority 
          className="group-hover:opacity-80 transition-opacity"
          data-ai-hint="company logo karting"
        />
      </div>
    </Link>
  );
};

export default Logo;
    