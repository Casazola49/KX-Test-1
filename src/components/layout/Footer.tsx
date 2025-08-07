
import Link from 'next/link';
import Logo from '@/components/shared/Logo';
import { FOOTER_LINKS, SOCIAL_LINKS, SITE_TITLE } from '@/lib/constants';
import { Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react'; 

// Custom SVG Icon for X (Twitter)
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props} className="h-6 w-6">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Custom SVG Icon for TikTok
const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props} className="h-6 w-6">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);


const iconComponents: { [key: string]: React.ElementType } = {
  Facebook: Facebook,
  Instagram: Instagram,
  Youtube: Youtube,
  XIcon: XIcon,
  TikTokIcon: TikTokIcon,
  MessageCircle: MessageCircle, // For WhatsApp
};

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border text-card-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              Promoviendo la pasión por el karting en Bolivia.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-headline font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
               <li>
                  <Link href="/contacto" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Contacto
                  </Link>
                </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-headline font-semibold mb-4">Síguenos</h3>
            <div className="flex space-x-4">
              {SOCIAL_LINKS.map((link) => {
                const IconComponent = iconComponents[link.icon];
                return IconComponent ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <IconComponent size={24} />
                  </a>
                ) : null;
              })}
            </div>
          </div>
        </div>
        <div className="border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {SITE_TITLE}. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Diseñado con <span className="text-primary">&hearts;</span> para la comunidad del karting.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
