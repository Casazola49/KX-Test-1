"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SpeedHiveGuide() {
  return (
    <Card className="border-blue-500/20 bg-blue-500/5">
      <CardHeader>
        <CardTitle className="flex items-center text-lg">
          <ExternalLink className="mr-2 w-5 h-5 text-blue-500" />
          Guía de Integración SpeedHive/MyLaps
        </CardTitle>
        <CardDescription>
          Cómo obtener la URL correcta para la transmisión en vivo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="text-sm font-semibold">Accede a SpeedHive</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ve a{' '}
                <a 
                  href="https://speedhive.mylaps.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  speedhive.mylaps.com
                </a>
                {' '}e inicia sesión con tu cuenta de MyLaps
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="text-sm font-semibold">Encuentra tu evento activo</p>
              <p className="text-xs text-muted-foreground mt-1">
                Busca el evento que está en curso o que vas a transmitir. Debe estar marcado como "Active" o "En vivo"
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="text-sm font-semibold">Abre el Live Timing</p>
              <p className="text-xs text-muted-foreground mt-1">
                Haz clic en "Live Timing" o "Ver timing en vivo" para abrir la vista de timing
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
              4
            </div>
            <div>
              <p className="text-sm font-semibold">Copia la URL completa</p>
              <p className="text-xs text-muted-foreground mt-1">
                Copia la URL de la barra de direcciones. Debe verse similar a:
              </p>
              <code className="block mt-2 p-2 bg-black/20 rounded text-xs text-green-400 break-all">
                https://speedhive.mylaps.com/livetiming/BB70F2F9205D5E3D-2147487781/active
              </code>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-green-500">URL correcta:</strong> Debe contener "/livetiming/" y terminar con "/active" o un ID de sesión
            </p>
          </div>
          
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-red-500">Importante:</strong> El evento debe estar activo en MyLaps para que funcione la transmisión
            </p>
          </div>
        </div>

        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <p className="text-xs text-yellow-600 dark:text-yellow-500">
            <strong>💡 Consejo:</strong> Prueba la URL en una pestaña de incógnito antes de activar la transmisión pública para asegurarte de que funciona correctamente.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
