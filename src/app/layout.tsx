
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from "@/components/ui/toaster";
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SponsorPopupWrapper from '@/components/shared/SponsorPopupWrapper';
import { BasicAnalytics } from '@/components/analytics/BasicAnalytics';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

// Metadata principal del sitio
export const metadata: Metadata = {
  title: 'Karting Bolivia - La comunidad de karting más grande de Bolivia',
  description: 'La comunidad de karting más grande de Bolivia. Encuentra información sobre carreras, pilotos, equipos y eventos de karting.',
  keywords: 'karting, bolivia, carreras, pilotos, equipos, automovilismo, deportes de motor',
  authors: [{ name: 'Karting Bolivia' }],
  creator: '@kartingbolivia',
  publisher: 'Karting Bolivia',
  
  // Open Graph
  openGraph: {
    type: 'website',
    title: 'Karting Bolivia',
    description: 'La comunidad de karting más grande de Bolivia',
    siteName: 'Karting Bolivia',
    locale: 'es_BO',
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Karting Bolivia',
    description: 'La comunidad de karting más grande de Bolivia',
    creator: '@kartingbolivia',
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  icons: {
    icon: '/favicon.ico',
  },
};

// Viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
  colorScheme: 'dark light'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@400;700&display=swap" rel="stylesheet" />
        
        {/* Preload fuentes críticas F1 con prioridad alta */}
        <link rel="preload" href="/fonts/Formula1-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" fetchPriority="high" />
        <link rel="preload" href="/fonts/Formula1-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" fetchPriority="high" />
        
        {/* Preconnect a dominios externos para mejor rendimiento */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Optimizaciones de rendimiento */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#84cc16" />
      </head>
      <body className={`${inter.className} antialiased flex flex-col min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-grow" role="main">
            {children}
          </main>
          <Footer />
          <Toaster />
          <SponsorPopupWrapper />
          <BasicAnalytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
