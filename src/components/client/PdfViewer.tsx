"use client";

import React, { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PdfViewer({ pdfUrl }: { pdfUrl:string }) {
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  useEffect(() => {
    // Para que Google Docs Viewer funcione, necesita una URL absoluta y públicamente accesible.
    // Construimos la URL absoluta usando el origen de la ventana actual.
    const absolutePdfUrl = new URL(pdfUrl, window.location.origin).href;
    
    // Creamos la URL para el visor de Google Docs.
    // El parámetro `embedded=true` asegura que se muestre sin cabeceras ni pies de página de Google.
    setViewerUrl(`https://docs.google.com/gview?url=${encodeURIComponent(absolutePdfUrl)}&embedded=true`);
    
  }, [pdfUrl]); // Este efecto se ejecuta cada vez que el pdfUrl cambia.

  // Mientras se genera la URL del visor, mostramos un esqueleto de carga.
  if (!viewerUrl) {
    return <Skeleton className="aspect-[4/5] md:aspect-video w-full" />;
  }

  // Renderizamos el iframe apuntando al servicio de Google.
  return (
    <div className="relative w-full bg-muted rounded-md border border-border overflow-hidden">
      <div className="relative aspect-[4/5] md:aspect-video w-full">
        <iframe
          src={viewerUrl}
          title="Visor de PDF"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
