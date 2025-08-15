"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, RefreshCw } from 'lucide-react';

interface FallbackPdfViewerProps {
  pdfUrl: string;
}

export default function FallbackPdfViewer({ pdfUrl }: FallbackPdfViewerProps) {
  const [currentMethod, setCurrentMethod] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const absolutePdfUrl = new URL(pdfUrl, window.location.origin).href;

  // Diferentes métodos de visualización
  const viewerMethods = [
    {
      name: 'Google Docs Viewer',
      url: `https://docs.google.com/gview?url=${encodeURIComponent(absolutePdfUrl)}&embedded=true`,
      description: 'Usando Google Docs para mostrar el PDF'
    },
    {
      name: 'PDF.js CDN',
      url: `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(absolutePdfUrl)}`,
      description: 'Usando PDF.js desde Mozilla'
    },
    {
      name: 'Visor Nativo',
      url: `${absolutePdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`,
      description: 'Usando el visor nativo del navegador'
    }
  ];

  const currentViewer = viewerMethods[currentMethod];

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    
    // Simular tiempo de carga
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [currentMethod]);

  const tryNextMethod = () => {
    if (currentMethod < viewerMethods.length - 1) {
      setCurrentMethod(currentMethod + 1);
    } else {
      setCurrentMethod(0); // Volver al primero
    }
  };

  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = absolutePdfUrl;
    link.download = pdfUrl.split('/').pop() || 'reglamento.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openInNewTab = () => {
    window.open(absolutePdfUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full bg-white rounded-md border border-gray-200 overflow-hidden">
      {/* Controles superiores */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {currentViewer.name} ({currentMethod + 1}/{viewerMethods.length})
          </span>
          {isLoading && (
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={tryNextMethod}>
            <RefreshCw size={16} className="mr-1" />
            Cambiar método
          </Button>
          
          <Button size="sm" variant="outline" onClick={openInNewTab}>
            <ExternalLink size={16} className="mr-1" />
            Abrir PDF
          </Button>
          
          <Button size="sm" variant="outline" onClick={downloadPdf}>
            <Download size={16} className="mr-1" />
            Descargar
          </Button>
        </div>
      </div>

      {/* Visor */}
      <div className="relative" style={{ height: '600px' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 font-semibold">Cargando PDF...</p>
              <p className="text-gray-500 text-sm mt-1">{currentViewer.description}</p>
            </div>
          </div>
        )}

        <iframe
          key={`${currentMethod}-${Date.now()}`} // Forzar recarga
          src={currentViewer.url}
          title="Visor de PDF"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          onLoad={() => {
            setIsLoading(false);
            setHasError(false);
            console.log(`✅ PDF cargado con ${currentViewer.name}`);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
            console.log(`❌ Error con ${currentViewer.name}`);
          }}
          allow="fullscreen"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />

        {/* Mensaje de error */}
        {hasError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 p-6">
            <div className="text-center max-w-md">
              <div className="text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold mb-2">Error con {currentViewer.name}</h3>
              <p className="text-gray-600 mb-4">
                Este método no pudo cargar el PDF. Prueba con otro método o abre el PDF directamente.
              </p>
              <div className="space-y-2">
                <Button onClick={tryNextMethod} className="w-full">
                  Probar siguiente método
                </Button>
                <Button onClick={openInNewTab} variant="outline" className="w-full">
                  Abrir PDF en nueva pestaña
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info inferior */}
      <div className="bg-gray-50 border-t border-gray-200 p-2 text-center">
        <p className="text-xs text-gray-500">
          Archivo: {pdfUrl.split('/').pop()} • Método: {currentViewer.name}
        </p>
      </div>
    </div>
  );
}