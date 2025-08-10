'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, X, Download } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export default function UpdatePrompt() {
  const { updateAvailable, reloadApp } = usePWA();
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (updateAvailable) {
      setShowUpdatePrompt(true);
    }
  }, [updateAvailable]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Esperar un momento para mostrar el loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Recargar la aplicación
      reloadApp();
    } catch (error) {
      console.error('Error updating app:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  if (!showUpdatePrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-card border border-border rounded-lg shadow-lg p-4 animate-slide-up">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">Actualización disponible</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
            disabled={isUpdating}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Una nueva versión de Karting Bolivia está disponible con mejoras y correcciones.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="flex-1"
            disabled={isUpdating}
          >
            Más tarde
          </Button>
          <Button
            size="sm"
            onClick={handleUpdate}
            className="flex-1"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <RefreshCw className="w-3 h-3 mr-2" />
                Actualizar
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}