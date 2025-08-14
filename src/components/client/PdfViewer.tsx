"use client";

import React, { useState, useEffect } from 'react';

interface PdfViewerProps {
  pdfUrl: string;
}

export default function PdfViewer({ pdfUrl }: PdfViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [currentMethod, setCurrentMethod] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    setIsLoading(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full aspect-[4/5] md:aspect-video bg-gray-200 animate-pulse rounded-md flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  // Construir URL absoluta para el PDF
  const absolutePdfUrl = new URL(pdfUrl, window.location.origin).href;
  
  // Diferentes métodos de visualización
  const viewerMethods = [
    // Método 1: Google Docs Viewer (más confiable)
    `https://docs.google.com/gview?url=${encodeURIComponent(absolutePdfUrl)}&embedded=true`,
    
    // Método 2: PDF.js de Mozilla
    `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(absolutePdfUrl)}`,
    
    // Método 3: Visor directo del navegador
    `${absolutePdfUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`
  ];

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    console.log(`Método ${currentMethod + 1} falló, probando siguiente...`);
    if (currentMethod < viewerMethods.length - 1) {
      setCurrentMethod(currentMethod + 1);
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full bg-white rounded-md border border-gray-200 overflow-hidden">
      <div className="relative aspect-[4/5] md:aspect-video w-full">
        {/* Indicador de carga */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">
                Cargando reglamento... (Método {currentMethod + 1})
              </p>
            </div>
          </div>
        )}
        
        {/* Visor principal */}
        <iframe
          key={currentMethod} // Forzar re-render cuando cambia el método
          src={viewerMethods[currentMethod]}
          title="Visor de PDF"
          width="100%"
          height="100%"
          style={{ 
            border: 'none', 
            minHeight: '500px',
            backgroundColor: 'white'
          }}
          onLoad={handleLoad}
          onError={handleError}
          className="absolute inset-0"
          allow="fullscreen"
        />
        
        {/* Fallback final si todos los métodos fallan */}
        {!isLoading && currentMethod >= viewerMethods.length - 1 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 p-6">
            <div className="text-center max-w-md">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-semibold mb-2">PDF no disponible</h3>
              <p className="text-sm text-gray-600 mb-4">
                No se pudo cargar el PDF. Esto puede deberse a restricciones del navegador.
              </p>
              <a
                href={absolutePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Abrir PDF en nueva pestaña
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
