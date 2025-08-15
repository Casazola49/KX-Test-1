"use client";

import React, { useState, useEffect } from 'react';
import UniversalPdfViewer from './UniversalPdfViewer';
import FallbackPdfViewer from './FallbackPdfViewer';

interface HybridPdfViewerProps {
  pdfUrl: string;
}

export default function HybridPdfViewer({ pdfUrl }: HybridPdfViewerProps) {
  const [useUniversal, setUseUniversal] = useState(true);
  const [universalFailed, setUniversalFailed] = useState(false);

  // Detectar si PDF.js está disponible
  useEffect(() => {
    const checkPdfJs = () => {
      // Intentar cargar PDF.js
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.onload = () => {
        console.log('✅ PDF.js disponible, usando UniversalPdfViewer');
        setUseUniversal(true);
      };
      script.onerror = () => {
        console.log('❌ PDF.js no disponible, usando FallbackPdfViewer');
        setUseUniversal(false);
        setUniversalFailed(true);
      };
      
      // Solo agregar si no existe ya
      if (!document.querySelector('script[src*="pdf.min.js"]')) {
        document.head.appendChild(script);
      }
    };

    checkPdfJs();
  }, []);

  // Si el universal falló, cambiar al fallback
  const handleUniversalError = () => {
    console.log('🔄 UniversalPdfViewer falló, cambiando a FallbackPdfViewer');
    setUniversalFailed(true);
    setUseUniversal(false);
  };

  // Botón para cambiar entre visores
  const switchViewer = () => {
    setUseUniversal(!useUniversal);
  };

  return (
    <div className="w-full">
      {/* Controles para cambiar visor */}
      <div className="mb-2 flex justify-end">
        <button
          onClick={switchViewer}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          {useUniversal ? 'Usar visor alternativo' : 'Usar visor avanzado'}
        </button>
      </div>

      {/* Visor actual */}
      {useUniversal && !universalFailed ? (
        <div className="relative">
          <UniversalPdfViewer pdfUrl={pdfUrl} />
          {/* Detector de errores invisible */}
          <div className="absolute top-0 left-0 w-1 h-1 opacity-0 pointer-events-none">
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  // Detectar errores del UniversalPdfViewer
                  window.addEventListener('error', function(e) {
                    if (e.message && e.message.includes('pdf')) {
                      console.log('Error detectado en UniversalPdfViewer');
                      // Enviar evento personalizado
                      window.dispatchEvent(new CustomEvent('universalPdfError'));
                    }
                  });
                `
              }}
            />
          </div>
        </div>
      ) : (
        <FallbackPdfViewer pdfUrl={pdfUrl} />
      )}

      {/* Información del visor actual */}
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-500">
          Usando: {useUniversal && !universalFailed ? 'Visor Avanzado (PDF.js)' : 'Visor Alternativo (Múltiples métodos)'}
        </p>
      </div>
    </div>
  );
}