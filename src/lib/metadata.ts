export type SiteConfig = {
  url: string;
};

// Base URL del sitio. En producción, define NEXT_PUBLIC_SITE_URL en Vercel
// por ejemplo: https://tudominio.com
export const SITE_CONFIG: SiteConfig = {
  url:
    (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SITE_URL) ||
    'http://localhost:3000',
};



