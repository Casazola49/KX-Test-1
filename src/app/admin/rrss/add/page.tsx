'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createSocialMediaPostAction } from '../actions';

export default function AddRRSSPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    platform: '',
    post_url: '',
    title: '',
    description: '',
    thumbnail_url: '',
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.platform || !formData.post_url) {
      alert('Por favor completa los campos obligatorios (Plataforma y URL)');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('platform', formData.platform);
      formDataToSend.append('post_url', formData.post_url);
      formDataToSend.append('title', formData.title || '');
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('thumbnail_url', formData.thumbnail_url || '');
      formDataToSend.append('is_active', formData.is_active.toString());

      const result = await createSocialMediaPostAction(formDataToSend);
      
      if (result.success) {
        router.push('/admin/rrss');
      } else {
        alert('Error al crear la publicación: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error al crear la publicación');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPreviewThumbnail = () => {
    if (formData.thumbnail_url && formData.thumbnail_url.trim()) {
      return formData.thumbnail_url;
    }
    
    switch (formData.platform) {
      case 'youtube':
        if (formData.post_url) {
          const match = formData.post_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
          if (match) {
            return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
          }
        }
        break;
      case 'instagram':
        return `https://via.placeholder.com/480x480/E4405F/white?text=Instagram+Post`;
      case 'tiktok':
        return `https://via.placeholder.com/480x480/000000/white?text=TikTok+Video`;
      case 'facebook':
        return `https://via.placeholder.com/480x480/1877F2/white?text=Facebook+Post`;
    }
    
    return null;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/rrss">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Añadir Publicación de Redes Sociales</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Nueva Publicación</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="platform">Plataforma *</Label>
              <Select 
                value={formData.platform} 
                onValueChange={(value) => handleInputChange('platform', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="post_url">URL de la Publicación *</Label>
              <Input
                id="post_url"
                type="url"
                value={formData.post_url}
                onChange={(e) => handleInputChange('post_url', e.target.value)}
                placeholder="https://..."
                required
              />
              <p className="text-sm text-gray-500">
                Pega aquí el enlace directo a la publicación
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título (opcional)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Título de la publicación (opcional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descripción de la publicación (opcional)"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="thumbnail_url">URL de Miniatura (opcional)</Label>
              <Input
                id="thumbnail_url"
                type="url"
                value={formData.thumbnail_url}
                onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                placeholder="https://..."
              />
              <p className="text-sm text-gray-500">
                URL de la imagen de vista previa. Si no se proporciona, se generará automáticamente para YouTube o se usará un placeholder para otras plataformas.
              </p>
              
              {/* Vista previa de la miniatura */}
              {(formData.post_url || formData.thumbnail_url) && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Vista previa:</p>
                  <div className="w-32 h-20 bg-gray-100 rounded overflow-hidden">
                    {getPreviewThumbnail() ? (
                      <img 
                        src={getPreviewThumbnail()!} 
                        alt="Vista previa" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">Sin imagen</div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                        Sin imagen
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Publicación activa</Label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar Publicación'}
              </Button>
              <Link href="/admin/rrss">
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