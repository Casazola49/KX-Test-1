import Image from 'next/image';
import { getAdvertisementsBySection } from '@/app/admin/publicidad/actions';

interface ServerHorizontalAdProps {
  section: string;
  className?: string;
}

export default async function ServerHorizontalAd({ section, className = '' }: ServerHorizontalAdProps) {
  try {
    // Intentar obtener anuncios específicos de la sección
    let advertisements = await getAdvertisementsBySection(section, 'horizontal');
    
    // Si no hay anuncios específicos, buscar globales
    if (advertisements.length === 0 && section !== 'global') {
      advertisements = await getAdvertisementsBySection('global', 'horizontal');
    }
    
    // Si no hay anuncios, no mostrar nada
    if (advertisements.length === 0) {
      return null;
    }
    
    // Seleccionar un anuncio aleatorio
    const ad = advertisements[Math.floor(Math.random() * advertisements.length)];
    
    return (
      <div className={`w-full my-8 ${className}`}>
        <div className="container mx-auto px-4">
          {ad.link_url ? (
            <a 
              href={ad.link_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative w-full rounded-lg overflow-hidden shadow-lg bg-gradient-to-r from-muted/5 to-muted/10 cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.005]"
            >
              <div className="w-full p-2">
                <img
                  src={ad.image_url}
                  alt={ad.name}
                  className="w-full h-auto"
                  style={{
                    display: 'block',
                    maxWidth: '100%',
                    height: 'auto',
                  }}
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors duration-300" />
            </a>
          ) : (
            <div className="relative w-full rounded-lg overflow-hidden shadow-lg bg-gradient-to-r from-muted/5 to-muted/10">
              <div className="w-full p-2">
                <img
                  src={ad.image_url}
                  alt={ad.name}
                  className="w-full h-auto"
                  style={{
                    display: 'block',
                    maxWidth: '100%',
                    height: 'auto',
                  }}
                  loading="lazy"
                />
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center mt-2 opacity-70">Publicidad</p>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading server ad:', error);
    return null;
  }
}