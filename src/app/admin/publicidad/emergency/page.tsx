'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const sections = [
  { value: 'global', label: 'Global (todas las secciones)' },
  { value: 'home', label: 'Inicio' },
  { value: 'noticias', label: 'Noticias' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'pilotos', label: 'Pilotos' },
  { value: 'galeria', label: 'Galería' },
  { value: 'pistas', label: 'Pistas' },
  { value: 'kart', label: 'Kart' },
  { value: 'equipamiento', label: 'Equipamiento' },
  { value: 'reglamento', label: 'Reglamento' },
  { value: 'contacto', label: 'Contacto' },
  { value: 'live', label: 'Carrera en Vivo' }
];

export default function EmergencyAdvertisementPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    section: 'global',
    type: 'horizontal' as 'horizontal' | 'popup',
    image_url: '/publicidad/publicidad.jpg',
    link_url: 'https://kartxperience.bo',
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simular guardado exitoso
    toast({
      title: "Modo de Emergencia",
      description: "Los anuncios se están mostrando usando el sistema de fallback. Firebase no está disponible.",
      variant: "default",
    });
  };

  const updateFallbackConfig = () => {
    // Actualizar la configuración de fallback en localStorage
    const fallbackConfig = {
      ...formData,
      id: 'emergency-' + Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const existingConfig = JSON.parse(localStorage.getItem('fallback-ads') || '[]');
    existingConfig.push(fallbackConfig);
    localStorage.setItem('fallback-ads', JSON.stringify(existingConfig));
    
    toast({
      title: "Configuración Guardada",
      description: "Anuncio guardado en modo de emergencia (localStorage)",
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/publicidad">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Modo de Emergencia</h1>
          <p className="text-muted-foreground">Firebase no disponible - Usando sistema de fallback</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-orange-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-orange-700">Estado del Sistema</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span>Firebase:</span>
              <span className="text-red-600 font-semibold">❌ No disponible</span>
            </div>
            <div className="flex justify-between">
              <span>Sistema de Fallback:</span>
              <span className="text-green-600 font-semibold">✅ Activo</span>
            </div>
            <div className="flex justify-between">
              <span>Anuncios Visibles:</span>
              <span className="text-green-600 font-semibold">✅ Funcionando</span>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-sm">
              <p className="text-orange-800">
                <strong>Nota:</strong> Los anuncios se están mostrando usando imágenes por defecto. 
                Una vez que Firebase esté disponible, podrás gestionar anuncios normalmente.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración de Emergencia</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Anuncio</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Banner KartXperience"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">Sección</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, section: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.value} value={section.value}>
                        {section.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'horizontal' | 'popup') => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="horizontal">Horizontal (Banner)</SelectItem>
                    <SelectItem value="popup">Pop-up (Emergente)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL de Imagen</Label>
                <Select
                  value={formData.image_url}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, image_url: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="/publicidad/publicidad.jpg">Banner Horizontal</SelectItem>
                    <SelectItem value="/publicidad/publicidad vertical.png">Banner Vertical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_url">URL de Destino</Label>
                <Input
                  id="link_url"
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                  placeholder="https://ejemplo.com"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Anuncio activo</Label>
              </div>

              <div className="flex gap-2">
                <Button type="button" onClick={updateFallbackConfig} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar en Modo Emergencia
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Soluciones para Restaurar Firebase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>1. Verificar variables de entorno:</strong>
            <ul className="list-disc list-inside ml-4 text-muted-foreground">
              <li>FIREBASE_PROJECT_ID</li>
              <li>FIREBASE_CLIENT_EMAIL</li>
              <li>FIREBASE_PRIVATE_KEY</li>
            </ul>
          </div>
          <div>
            <strong>2. Verificar Firestore:</strong>
            <ul className="list-disc list-inside ml-4 text-muted-foreground">
              <li>Comprobar que Firestore esté habilitado en Firebase Console</li>
              <li>Verificar reglas de seguridad de Firestore</li>
            </ul>
          </div>
          <div>
            <strong>3. Reiniciar servidor:</strong>
            <ul className="list-disc list-inside ml-4 text-muted-foreground">
              <li>Detener el servidor de desarrollo</li>
              <li>Ejecutar: npm run dev</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}