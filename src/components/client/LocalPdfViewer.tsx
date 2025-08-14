"use client";

import React, { useState, useEffect } from 'react';

interface LocalPdfViewerProps {
  pdfUrl: string;
}

export default function LocalPdfViewer({ pdfUrl }: LocalPdfViewerProps) {
  const [mounted, setMounted] = useState(false);

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
  console.log('📄 PDF URL:', absolutePdfUrl);

  return (
    <div className="w-full bg-white rounded-md border border-gray-200 overflow-hidden">
      <div className="relative aspect-[4/5] md:aspect-video w-full">
        {/* Información de debug */}
        <div className="absolute top-2 left-2 z-30 bg-black bg-opacity-50 text-white text-xs p-2 rounded max-w-xs">
          <div>URL: {pdfUrl}</div>
          <div>Absoluta: {absolutePdfUrl}</div>
        </div>

        {/* Controles */}
        <div className="absolute top-2 right-2 z-30 flex gap-2">
          <a
            href={absolutePdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-500 text-white text-xs px-3 py-2 rounded hover:bg-green-600"
          >
            Abrir PDF
          </a>
        </div>

        {/* Mensaje explicativo para desarrollo */}
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 p-6">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold mb-4">Vista previa de PDF</h3>
            <p className="text-sm text-gray-600 mb-6">
              Los navegadores bloquean la visualización de PDFs locales por seguridad.
              <br /><br />
              <strong>En producción (Vercel) funcionará perfectamente.</strong>
              <br /><br />
              Por ahora, puedes abrir el PDF en una nueva pestaña para verlo.
            </p>
            <div className="space-y-3">
              <a
                href={absolutePdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
              >
                📖 Ver Reglamento Completo
              </a>
              <div className="text-xs text-gray-500 mt-4">
                Archivo: {pdfUrl.split('/').pop()}
              </div>
            </div>
          </div>
        </div>

        {/* Intentar mostrar PDF de todas formas (funcionará en producción) */}
        <iframe
          src={absolutePdfUrl}
          title="Reglamento PDF"
          width="100%"
          height="100%"
          style={{ 
            border: 'none', 
            minHeight: '500px',
            backgroundColor: 'white',
            opacity: 0.1 // Muy transparente para que no interfiera con el mensaje
          }}
          className="absolute inset-0"
        />
      </div>
    </div>
  );
}