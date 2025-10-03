'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createAdvertisement } from '../actions';
import { useToast } from '@/hooks/use-toast';
import SimpleImageUploader from '@/components/admin/SimpleImageUploader';

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
  { value: 'live', label: 'Carrera en Vivo' },
  { value: 'como-ser-piloto', label: 'Como ser Piloto' },
  { value: 'informacion-historia', label: 'Historia del Karting' },
  { value: 'informacion-panorama-actual', label: 'Panorama Actual' },
  { value: 'informacion-futuro', label: 'Futuro del Karting' }
];

export default function AddAdvertisementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    type: 'horizontal' as 'horizontal' | 'popup',
    image_url: '',
    link_url: '',
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.section || !formData.image_url) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await createAdvertisement(formData);
      toast({
        title: "Éxito",
        description: "Anuncio creado correctamente",
      });
      router.push('/admin/publicidad');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el anuncio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (url: string) => {
    setFormData(prev => ({ ...prev, image_url: url }));
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
        <h1 className="text-3xl font-bold">Nuevo Anuncio</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Anuncio</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Anuncio *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Banner KartXperience"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="section">Sección *</Label>
                <Select
                  value={formData.section}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, section: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una sección" />
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
                <Label htmlFor="type">Tipo de Anuncio *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'horizontal' | 'popup') => setFormData(prev => ({ ...prev, type: value }))}
                  required
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
                <Label htmlFor="link_url">URL de Destino</Label>
                <Input
                  id="link_url"
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                  placeholder="https://ejemplo.com"
                />
                <p className="text-sm text-muted-foreground">
                  URL a la que redirigirá cuando el usuario haga clic en el anuncio
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Imagen del Anuncio *</Label>
              <SimpleImageUploader
                onImageUpload={handleImageUpload}
                currentImageUrl={formData.image_url}
                folder="publicidad"
              />
              <p className="text-sm text-muted-foreground">
                {formData.type === 'horizontal' 
                  ? 'Recomendado: imagen horizontal (ej: 1200x300px)'
                  : 'Recomendado: imagen cuadrada o vertical (ej: 600x600px)'
                }
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Anuncio activo</Label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creando...' : 'Crear Anuncio'}
              </Button>
              <Link href="/admin/publicidad">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}