'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestPublicidadPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-firebase');
      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const seedAdvertisements = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/seed-advertisements', {
        method: 'POST'
      });
      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Test Publicidad</h1>
      
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Pruebas de Conexión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testFirebaseConnection} disabled={loading}>
              {loading ? 'Probando...' : 'Probar Conexión Firebase'}
            </Button>
            
            <Button onClick={seedAdvertisements} disabled={loading}>
              {loading ? 'Creando...' : 'Crear Datos de Ejemplo'}
            </Button>
          </CardContent>
        </Card>

        {testResult && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded text-sm overflow-auto">
                {testResult}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}