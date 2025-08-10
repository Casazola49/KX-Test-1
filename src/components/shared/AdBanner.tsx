
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AdBannerProps {
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ className }) => {
  return (
    <div className={cn("my-8 md:my-12", className)}>
      <div 
        className="relative w-full max-w-3xl mx-auto aspect-[4/1] rounded-lg shadow-md overflow-hidden"
      >
        <Image 
          src="/publicidad/publicidad vertical.png" 
          alt="Publicidad KartXperience Bolivia"
          fill
          style={{ objectFit: 'cover' }}
          data-ai-hint="advertisement banner"
          priority
        />
      </div>
    </div>
  );
};

export default AdBanner;
