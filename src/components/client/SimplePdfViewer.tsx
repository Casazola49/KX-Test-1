"use client";

import React, { useState, useEffect } from 'react';

interface SimplePdfViewerProps {
  pdfUrl: string;
}

export default function SimplePdfViewer({ pdfUrl }: SimplePdfViewerProps) {
  const [mounted, setMounted] = useState(false);
  const [currentMethod, setCurrentMethod] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full aspect-[4/5] md:aspect-video bg-gray-200 animate-pulse rounded-md flex items-center justify-center">
        <div className="text-gray-500">Cargando PDF...</div>
      </div>
    );
  }

  // Construir URL absoluta
  const absolutePdfUrl = new URL(pdfUrl, window.location.origin).href;
  
  console.log('🔍 Intentando cargar PDF:', absolutePdfUrl);

  // Diferentes métodos de visualización en orden de preferencia
  const viewerMethods = [
    // Método 1: PDF.js desde CDN (más confiable)
    {
      url: `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(absolutePdfUrl)}`,
      name: 'PDF.js'
    },
    // Método 2: Visor nativo con parámetros optimizados
    {
      url: `${absolutePdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH&zoom=page-width`,
      name: 'Nativo'
    },
    // Método 3: Embed directo
    {
      url: absolutePdfUrl,
      name: 'Embed'
    }
  ];

  const currentViewer = viewerMethods[currentMethod];

  const handleLoad = () => {
    console.log(`✅ PDF cargado exitosamente con método: ${currentViewer.name}`);
    setIsLoading(false);
  };

  const handleError = () => {
    console.log(`❌ Método ${currentViewer.name} falló, probando siguiente...`);
    
    if (currentMethod < viewerMethods.length - 1) {
      setCurrentMethod(currentMethod + 1);
      setIsLoading(true);
    } else {
      console.log('❌ Todos los métodos fallaron');
      setIsLoading(false);
    }
  };

  const tryNextMethod = () => {
    if (currentMethod < viewerMethods.length - 1) {
      setCurrentMethod(currentMethod + 1);
      setIsLoading(true);
    }
  };

  return (
    <div className="w-full bg-white rounded-md border border-gray-200 overflow-hidden">
      <div className="relative aspect-[4/5] md:aspect-video w-full">
        {/* Indicador de carga */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">
                Cargando reglamento... ({currentViewer.name})
              </p>
            </div>
          </div>
        )}

        {/* Controles de debug */}
        <div className="absolute top-2 left-2 z-30 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
          Método: {currentViewer.name} ({currentMethod + 1}/{viewerMethods.length})
        </div>

        <div className="absolute top-2 right-2 z-30 flex gap-2">
          <button
            onClick={tryNextMethod}
            className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
            disabled={currentMethod >= viewerMethods.length - 1}
          >
            Probar siguiente
          </button>
          <a
            href={absolutePdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600"
          >
            Abrir PDF
          </a>
        </div>

        {/* Visor principal */}
        {currentMethod < 2 ? (
          <iframe
            key={`iframe-${currentMethod}`}
            src={currentViewer.url}
            title="Reglamento PDF"
            width="100%"
            height="100%"
            style={{ 
              border: 'none', 
              minHeight: '500px',
              backgroundColor: 'white'
            }}
            className="absolute inset-0"
            onLoad={handleLoad}
            onError={handleError}
            allow="fullscreen"
          />
        ) : (
          <embed
            key={`embed-${currentMethod}`}
            src={currentViewer.url}
            type="application/pdf"
            width="100%"
            height="100%"
            style={{ 
              border: 'none', 
              minHeight: '500px',
              backgroundColor: 'white'
            }}
            className="absolute inset-0"
            onLoad={handleLoad}
            onError={handleError}
          />
        )}

        {/* Fallback final */}
        {!isLoading && currentMethod >= viewerMethods.length - 1 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 p-6 z-10">
            <div className="text-center max-w-md">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-semibold mb-2">Vista previa no disponible</h3>
              <p className="text-sm text-gray-600 mb-4">
                Los navegadores pueden bloquear PDFs locales por seguridad. 
                En producción funcionará correctamente.
              </p>
              <div className="space-y-2">
                <a
                  href={absolutePdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Abrir PDF en nueva pestaña
                </a>
                <button
                  onClick={() => {
                    setCurrentMethod(0);
                    setIsLoading(true);
                  }}
                  className="block w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}