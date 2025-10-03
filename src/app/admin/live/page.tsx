
import { updateLiveStreamSettings } from './actions';
import { getLiveStreamConfig } from '@/lib/data-service';
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import LiveChatConsole from '@/components/admin/LiveChatConsole';
import LiveTroubleshooting from '@/components/admin/LiveTroubleshooting';
import SpeedHiveGuide from '@/components/admin/SpeedHiveGuide';

export default async function AdminLivePage() {
  let settings;
  
  try {
    settings = await getLiveStreamConfig();
  } catch (error: any) {
    return <Section><p>Error al cargar la configuración: {error.message}</p></Section>;
  }

  // Si no hay configuración, usar valores por defecto
  if (!settings) {
    settings = {
      is_live: false,
      stream_title: '',
      iframe_url: ''
    };
  }

  return (
    <>
      <PageTitle title="Panel de Administración" subtitle="Gestionar Transmisión en Vivo" />
      <Section className="py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna de Configuración */}
          <div className="lg:col-span-2 space-y-8">
            <form action={updateLiveStreamSettings}>
              <Card>
                <CardHeader>
                  <CardTitle>Configuración de Transmisión en Vivo</CardTitle>
                  <CardDescription>
                    Configura la transmisión de SpeedHive/MyLaps para mostrar el timing en vivo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="stream_title">Título de la Transmisión</Label>
                    <Input 
                      id="stream_title" 
                      name="stream_title" 
                      defaultValue={settings.stream_title || ''} 
                      placeholder="Ej: Campeonato Nacional Santa Cruz - Fecha 3" 
                    />
                    <p className="text-xs text-muted-foreground">
                      Este título aparecerá en la página pública de transmisión
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="iframe_url">URL de SpeedHive/MyLaps</Label>
                    <Input 
                      id="iframe_url" 
                      name="iframe_url" 
                      defaultValue={settings.iframe_url || ''} 
                      placeholder="https://speedhive.mylaps.com/livetiming/BB70F2F9205D5E3D-2147487781/active" 
                    />
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mt-2">
                      <p className="text-xs text-blue-400 font-semibold mb-2">📋 Instrucciones:</p>
                      <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Ve a SpeedHive: <a href="https://speedhive.mylaps.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">speedhive.mylaps.com</a></li>
                        <li>Busca tu evento activo en MyLaps</li>
                        <li>Copia la URL completa del live timing (debe incluir "/livetiming/")</li>
                        <li>Pégala aquí y activa la transmisión</li>
                      </ol>
                    </div>
                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                      ⚠️ Asegúrate de que el evento esté activo en MyLaps antes de activar la transmisión
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/50">
                    <div className="space-y-0.5">
                      <Label htmlFor="is_live" className="text-base font-semibold">Activar Transmisión</Label>
                      <p className="text-sm text-muted-foreground">
                        El timing en vivo y el relato serán visibles para todos los usuarios
                      </p>
                    </div>
                    <Switch id="is_live" name="is_live" defaultChecked={settings.is_live} />
                  </div>
                  
                  <Button type="submit" className="w-full" size="lg">
                    💾 Guardar Cambios
                  </Button>
                </CardContent>
              </Card>
            </form>

            {/* Guía de SpeedHive */}
            <SpeedHiveGuide />

            {/* Diagnóstico del Sistema */}
            <LiveTroubleshooting />
          </div>

          {/* Columna del Chat en Vivo */}
          <div className="lg:col-span-1">
            <LiveChatConsole />
          </div>

        </div>
      </Section>
    </>
  );
}
