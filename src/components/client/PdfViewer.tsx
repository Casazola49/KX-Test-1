"use client";

import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Eye, RefreshCw } from 'lucide-react';

export default function PdfViewer({ pdfUrl }: { pdfUrl: string }) {
  const [mounted, setMounted] = useState(false);
  const [viewerType, setViewerType] = useState<'embed' | 'iframe' | 'object' | 'fallback'>('embed');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton className="aspect-[4/5] md:aspect-video w-full" />;
  }

  const absolutePdfUrl = new URL(pdfUrl, window.location.origin).href;

  const tryNextViewer = () => {
    setHasError(false);
    if (viewerType === 'embed') {
      setViewerType('iframe');
    } else if (viewerType === 'iframe') {
      setViewerType('object');
    } else if (viewerType === 'object') {
      setViewerType('fallback');
    } else {
      setViewerType('embed');
    }
  };

  const handleError = () => {
    setHasError(true);
    // Automáticamente probar el siguiente visor después de 1 segundo
    setTimeout(() => {
      tryNextViewer();
    }, 1000);
  };

  const renderPdfViewer = () => {
    const commonProps = {
      width: "100%",
      height: "100%",
      style: { border: 'none', minHeight: '500px' },
      onError: handleError,
      onLoad: () => setHasError(false)
    };

    switch (viewerType) {
      case 'embed':
        return (
          <embed
            src={`${absolutePdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            type="application/pdf"
            {...commonProps}
          />
        );
      
      case 'iframe':
        return (
          <iframe
            src={`${absolutePdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            title="PDF Viewer"
            {...commonProps}
          />
        );
      
      case 'object':
        return (
          <object
            data={`${absolutePdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            type="application/pdf"
            {...commonProps}
          >
            <p>Tu navegador no puede mostrar PDFs. 
              <a href={absolutePdfUrl} target="_blank" rel="noopener noreferrer">
                Haz clic aquí para abrir el PDF
              </a>
            </p>
          </object>
        );
      
      default:
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-muted p-6">
            <div className="text-center max-w-md">
              <FileText size={64} className="text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                Vista previa no disponible
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Los navegadores bloquean la visualización de PDFs locales por seguridad.
                En producción (cuando subas el sitio) funcionará perfectamente.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={tryNextViewer}
                  variant="outline" 
                  size="sm"
                  className="mr-2"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Probar otro método
                </Button>
                <Button 
                  onClick={() => window.open(absolutePdfUrl, '_blank')}
                  variant="default" 
                  size="sm"
                >
                  <Eye size={16} className="mr-2" />
                  Ver PDF Completo
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full bg-muted rounded-md border border-border overflow-hidden">
      {/* Controles superiores */}
      <div className="absolute top-2 left-2 z-10">
        <div className="bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground">
          Método: {viewerType}
        </div>
      </div>

      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <Button 
          onClick={tryNextViewer}
          variant="secondary" 
          size="sm"
          title="Probar otro método de visualización"
        >
          <RefreshCw size={16} />
        </Button>
        <Button 
          onClick={() => window.open(absolutePdfUrl, '_blank')}
          variant="secondary" 
          size="sm"
        >
          <ExternalLink size={16} className="mr-1" />
          Abrir PDF
        </Button>
      </div>

      <div className="relative aspect-[4/5] md:aspect-video w-full bg-white">
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-yellow-50 z-10">
            <div className="text-center p-4">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">
                Probando método {viewerType}...
              </p>
            </div>
          </div>
        )}
        
        {renderPdfViewer()}
      </div>

      {/* Indicador de estado */}
      <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground">
        {hasError ? 'Cargando...' : 'Vista previa'}
      </div>
    </div>
  );
}
