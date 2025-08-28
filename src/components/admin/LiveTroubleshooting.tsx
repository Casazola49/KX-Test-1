"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Wifi, 
  Monitor,
  MessageSquare
} from 'lucide-react';
// Migrado a Firebase - ya no usa Supabase

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export default function LiveTroubleshooting() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    try {
      // Test 1: Conexión a Firebase
      try {
        const { getLiveStreamConfig } = await import('@/lib/data-service');
        await getLiveStreamConfig();
        results.push({
          name: 'Conexión a Firebase',
          status: 'success',
          message: 'Conexión exitosa',
          details: 'Firebase conectado correctamente'
        });
      } catch (err) {
        results.push({
          name: 'Conexión a Firebase',
          status: 'error',
          message: 'Error de conexión',
          details: err instanceof Error ? err.message : 'Error desconocido'
        });
      }

      // Test 2: Configuración del stream
      try {
        const { getLiveStreamConfig } = await import('@/lib/data-service');
        const streamConfig = await getLiveStreamConfig();

        if (!streamConfig) {
          results.push({
            name: 'Configuración del Stream',
            status: 'warning',
            message: 'No se encontró configuración',
            details: 'Se usarán valores por defecto'
          });
        } else {
          results.push({
            name: 'Configuración del Stream',
            status: 'success',
            message: `Estado: ${streamConfig.is_live ? 'Activo' : 'Inactivo'}`,
            details: `Título: ${streamConfig.stream_title || 'Sin título'}`
          });
        }
      } catch (err) {
        results.push({
          name: 'Configuración del Stream',
          status: 'error',
          message: 'Error al verificar configuración',
          details: err instanceof Error ? err.message : 'Error desconocido'
        });
      }

      // Test 3: Mensajes de chat
      try {
        const { getChatMessages } = await import('@/lib/data-service');
        await getChatMessages();
        results.push({
          name: 'Mensajes de Chat',
          status: 'success',
          message: 'Acceso exitoso',
          details: 'Colección de mensajes accesible'
        });
      } catch (err) {
        results.push({
          name: 'Mensajes de Chat',
          status: 'error',
          message: 'Error al verificar mensajes',
          details: err instanceof Error ? err.message : 'Error desconocido'
        });
      }

      // Test 4: Variables de entorno Firebase
      const hasFirebaseConfig = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const hasFirebaseApiKey = !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

      results.push({
        name: 'Variables de Entorno Firebase',
        status: hasFirebaseConfig && hasFirebaseApiKey ? 'success' : 'error',
        message: hasFirebaseConfig && hasFirebaseApiKey ? 'Variables configuradas' : 'Variables faltantes',
        details: `Project ID: ${hasFirebaseConfig ? '✓' : '✗'}, API Key: ${hasFirebaseApiKey ? '✓' : '✗'}`
      });

      // Test 5: Funcionalidad simplificada
      results.push({
        name: 'Tiempo Real',
        status: 'warning',
        message: 'Modo simplificado activo',
        details: 'Usando polling en lugar de tiempo real (migración completa)'
      });

    } catch (error) {
      results.push({
        name: 'Diagnóstico General',
        status: 'error',
        message: 'Error durante el diagnóstico',
        details: error instanceof Error ? error.message : 'Error desconocido'
      });
    }

    setDiagnostics(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800'
    } as const;

    const labels = {
      success: 'OK',
      error: 'Error',
      warning: 'Advertencia'
    };

    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[status]}`}>
        {labels[status]}
      </span>
    );
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const successCount = diagnostics.filter(d => d.status === 'success').length;
  const errorCount = diagnostics.filter(d => d.status === 'error').length;
  const warningCount = diagnostics.filter(d => d.status === 'warning').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Monitor className="mr-2 w-5 h-5" />
            Diagnóstico del Sistema
          </div>
          <Button
            onClick={runDiagnostics}
            disabled={isRunning}
            variant="outline"
            size="sm"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isRunning ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}
          </Button>
        </CardTitle>
        <CardDescription>
          Verifica el estado de todos los componentes del sistema de transmisión en vivo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {diagnostics.length > 0 && (
          <div className="flex gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-muted-foreground">Exitosos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-muted-foreground">Errores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
              <div className="text-sm text-muted-foreground">Advertencias</div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {diagnostics.map((diagnostic, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
              {getStatusIcon(diagnostic.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium">{diagnostic.name}</h4>
                  {getStatusBadge(diagnostic.status)}
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {diagnostic.message}
                </p>
                {diagnostic.details && (
                  <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                    {diagnostic.details}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {errorCount > 0 && (
          <div className="relative w-full rounded-lg border border-red-200 p-4 bg-red-50">
            <div className="flex">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div className="ml-3">
                <div className="text-sm text-red-800">
                  Se encontraron {errorCount} error(es). Revisa la configuración de Firebase y las variables de entorno.
                  Si los problemas persisten, contacta al administrador del sistema.
                </div>
              </div>
            </div>
          </div>
        )}

        {diagnostics.length === 0 && !isRunning && (
          <div className="text-center py-8 text-muted-foreground">
            <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Haz clic en "Ejecutar Diagnóstico" para verificar el sistema</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}