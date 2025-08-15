"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize2, RotateCw } from 'lucide-react';

interface UniversalPdfViewerProps {
  pdfUrl: string;
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function UniversalPdfViewer({ pdfUrl }: UniversalPdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Delay inicial para asegurar que el componente esté completamente montado
    const timer = setTimeout(() => {
      loadPdfJs();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale, rotation]);

  const loadPdfJs = async () => {
    try {
      // Verificar si PDF.js ya está cargado
      if (window.pdfjsLib) {
        console.log('✅ PDF.js ya está disponible');
        loadPdf();
        return;
      }

      console.log('🔄 Cargando PDF.js...');
      
      // Cargar PDF.js desde CDN con mejor manejo de errores
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        console.log('✅ PDF.js cargado exitosamente');
        
        // Configurar worker
        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          
          // Pequeño delay para asegurar que todo esté configurado
          setTimeout(() => {
            loadPdf();
          }, 200);
        } else {
          setError('PDF.js no se inicializó correctamente');
          setIsLoading(false);
        }
      };
      
      script.onerror = (e) => {
        console.error('❌ Error cargando PDF.js:', e);
        setError('Error al cargar PDF.js desde CDN');
        setIsLoading(false);
      };
      
      // Verificar si el script ya existe
      const existingScript = document.querySelector('script[src*="pdf.min.js"]');
      if (!existingScript) {
        document.head.appendChild(script);
      } else {
        // Si ya existe, esperar un poco y verificar
        setTimeout(() => {
          if (window.pdfjsLib) {
            loadPdf();
          } else {
            setError('PDF.js no se pudo inicializar');
            setIsLoading(false);
          }
        }, 500);
      }
    } catch (err) {
      console.error('❌ Error al inicializar PDF.js:', err);
      setError('Error al inicializar el visor de PDF');
      setIsLoading(false);
    }
  };

  const loadPdf = async () => {
    if (!window.pdfjsLib) {
      console.error('❌ PDF.js no está disponible');
      setError('PDF.js no está disponible');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Construir URL absoluta
      const absolutePdfUrl = new URL(pdfUrl, window.location.origin).href;
      console.log('🔍 Cargando PDF desde:', absolutePdfUrl);

      // Configuración optimizada para carga rápida
      const loadingTask = window.pdfjsLib.getDocument({
        url: absolutePdfUrl,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
        cMapPacked: true,
        verbosity: 0,
        maxImageSize: 1024 * 1024,
        disableFontFace: false,
        disableRange: false,
        disableStream: false,
        // Configuraciones adicionales para mejor compatibilidad
        useSystemFonts: true,
        standardFontDataUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/standard_fonts/',
      });

      // Manejar progreso de carga
      loadingTask.onProgress = (progress: any) => {
        if (progress.total > 0) {
          const percent = Math.round((progress.loaded / progress.total) * 100);
          console.log(`📊 Progreso de carga: ${percent}%`);
        }
      };

      const pdf = await loadingTask.promise;
      
      if (!pdf) {
        throw new Error('PDF no se pudo cargar correctamente');
      }

      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      setIsLoading(false);
      
      console.log('✅ PDF cargado exitosamente:', pdf.numPages, 'páginas');
      
      // Renderizar la primera página inmediatamente
      setTimeout(() => {
        renderPage(1);
      }, 100);
      
    } catch (err) {
      console.error('❌ Error cargando PDF (método principal):', err);
      
      // Método alternativo: cargar como ArrayBuffer
      try {
        console.log('🔄 Intentando método alternativo (ArrayBuffer)...');
        
        const response = await fetch(new URL(pdfUrl, window.location.origin).href);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        
        if (arrayBuffer.byteLength === 0) {
          throw new Error('El archivo PDF está vacío');
        }
        
        const loadingTask = window.pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
          cMapPacked: true,
          verbosity: 0,
        });

        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        setIsLoading(false);
        
        console.log('✅ PDF cargado con método alternativo:', pdf.numPages, 'páginas');
        
        // Renderizar la primera página
        setTimeout(() => {
          renderPage(1);
        }, 100);
        
      } catch (fallbackErr) {
        console.error('❌ Error con método alternativo:', fallbackErr);
        setError(`No se pudo cargar el PDF: ${fallbackErr.message}`);
        setIsLoading(false);
      }
    }
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) {
      console.log('⚠️ PDF o canvas no disponible para renderizar');
      return;
    }

    try {
      console.log(`🎨 Renderizando página ${pageNum}...`);
      
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('No se pudo obtener el contexto del canvas');
      }

      // Limpiar canvas antes de renderizar
      context.clearRect(0, 0, canvas.width, canvas.height);

      // Calcular viewport con escala y rotación
      let viewport = page.getViewport({ scale, rotation });
      
      // Ajustar canvas con device pixel ratio para mejor calidad
      const devicePixelRatio = window.devicePixelRatio || 1;
      const scaledViewport = page.getViewport({ 
        scale: scale * devicePixelRatio, 
        rotation 
      });

      // Configurar canvas
      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;
      canvas.style.width = viewport.width + 'px';
      canvas.style.height = viewport.height + 'px';

      // Escalar contexto para alta resolución
      context.scale(devicePixelRatio, devicePixelRatio);

      // Renderizar página
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        enableWebGL: false, // Desactivar WebGL para mejor compatibilidad
      };

      const renderTask = page.render(renderContext);
      
      // Manejar cancelación si es necesario
      renderTask.onContinue = (cont: any) => {
        cont();
      };

      await renderTask.promise;
      console.log(`✅ Página ${pageNum} renderizada exitosamente`);
      
    } catch (err) {
      console.error(`❌ Error renderizando página ${pageNum}:`, err);
      
      // Intentar renderizado simple como fallback
      try {
        console.log(`🔄 Intentando renderizado simple para página ${pageNum}...`);
        
        const page = await pdfDoc.getPage(pageNum);
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (context) {
          const viewport = page.getViewport({ scale: scale * 0.8, rotation });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;
          
          console.log(`✅ Página ${pageNum} renderizada con método simple`);
        }
      } catch (fallbackErr) {
        console.error(`❌ Error en renderizado simple:`, fallbackErr);
        setError(`Error al renderizar la página ${pageNum}`);
      }
    }
  };

  const goToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    }
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const downloadPdf = () => {
    const link = document.createElement('a');
    link.href = new URL(pdfUrl, window.location.origin).href;
    link.download = pdfUrl.split('/').pop() || 'reglamento.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openFullscreen = () => {
    const url = new URL(pdfUrl, window.location.origin).href;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading) {
    return (
      <div className="w-full aspect-[4/5] md:aspect-video bg-gray-100 rounded-md flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Cargando reglamento...</p>
          <p className="text-gray-500 text-sm mt-2">Inicializando visor PDF</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full aspect-[4/5] md:aspect-video bg-gray-100 rounded-md flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-800">Error al cargar PDF</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <Button onClick={loadPdf} className="bg-blue-500 hover:bg-blue-600">
              Reintentar
            </Button>
            <Button onClick={openFullscreen} variant="outline">
              Abrir en nueva pestaña
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-md border border-gray-200 overflow-hidden">
      {/* Controles */}
      <div className="bg-gray-50 border-b border-gray-200 p-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft size={16} />
          </Button>
          
          <span className="text-sm font-medium px-2">
            {currentPage} / {totalPages}
          </span>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight size={16} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={zoomOut}>
            <ZoomOut size={16} />
          </Button>
          
          <span className="text-sm px-2 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <Button size="sm" variant="outline" onClick={zoomIn}>
            <ZoomIn size={16} />
          </Button>
          
          <Button size="sm" variant="outline" onClick={rotate}>
            <RotateCw size={16} />
          </Button>
          
          <Button size="sm" variant="outline" onClick={openFullscreen}>
            <Maximize2 size={16} />
          </Button>
          
          <Button size="sm" variant="outline" onClick={downloadPdf}>
            <Download size={16} />
          </Button>
        </div>
      </div>

      {/* Visor */}
      <div className="relative overflow-auto bg-gray-100" style={{ height: '600px' }}>
        <div className="flex justify-center p-4">
          <canvas
            ref={canvasRef}
            className="shadow-lg bg-white"
            style={{
              maxWidth: '100%',
              height: 'auto',
            }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="bg-gray-50 border-t border-gray-200 p-2 text-center">
        <p className="text-xs text-gray-500">
          Archivo: {pdfUrl.split('/').pop()} • Páginas: {totalPages} • Zoom: {Math.round(scale * 100)}%
        </p>
      </div>
    </div>
  );
}