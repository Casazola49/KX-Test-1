
import { updateLiveStreamSettings } from './actions';
import { getLiveStreamConfig } from '@/lib/data-service';
import PageTitle from '@/components/shared/PageTitle';
import Section from '@/components/shared/Section';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import LiveChatConsole from '@/components/admin/LiveChatConsole'; // Importamos la consola de chat
import LiveTroubleshooting from '@/components/admin/LiveTroubleshooting';

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
                  <CardTitle>Configuración del Iframe</CardTitle>
                  <CardDescription>
                    Pega el enlace de MYLAPS y activa la transmisión.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="stream_title">Título de la Transmisión</Label>
                    <Input id="stream_title" name="stream_title" defaultValue={settings.stream_title || ''} placeholder="Ej: Gran Carrera de Cochabamba" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iframe_url">URL del Iframe de MYLAPS</Label>
                    <Input id="iframe_url" name="iframe_url" defaultValue={settings.iframe_url || ''} placeholder="https://speedhive.mylaps.com/..." />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="is_live" className="text-base">Activar Transmisión</Label>
                      <p className="text-sm text-muted-foreground">
                        El iframe y el chat serán visibles en la página pública.
                      </p>
                    </div>
                    <Switch id="is_live" name="is_live" defaultChecked={settings.is_live} />
                  </div>
                  <Button type="submit">Guardar Cambios</Button>
                </CardContent>
              </Card>
            </form>

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
