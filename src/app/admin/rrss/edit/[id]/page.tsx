'use client';

import { useState, useEffect } from 'react';
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
import { getSocialMediaPostAction, updateSocialMediaPostAction } from '../../actions';
import { SocialMediaPost } from '@/lib/types';

interface EditRRSSPageProps {
  params: {
    id: string;
  };
}

export default function EditRRSSPage({ params }: EditRRSSPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    platform: '',
    post_url: '',
    title: '',
    description: '',
    thumbnail_url: '',
    is_active: true
  });

  useEffect(() => {
    loadPost();
  }, [params.id]);

  const loadPost = async () => {
    try {
      const post = await getSocialMediaPostAction(params.id);
      if (post) {
        setFormData({
          platform: post.platform,
          post_url: post.post_url,
          title: post.title || '',
          description: post.description || '',
          thumbnail_url: post.thumbnail_url || '',
          is_active: post.is_active
        });
      }
    } catch (error) {
      console.error('Error loading post:', error);
      alert('Error al cargar la publicación');
    } finally {
      setInitialLoading(false);
    }
  };

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

      const result = await updateSocialMediaPostAction(params.id, formDataToSend);
      
      if (result.success) {
        router.push('/admin/rrss');
      } else {
        alert('Error al actualizar la publicación: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error al actualizar la publicación');
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

  if (initialLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando publicación...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/rrss">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Editar Publicación de Redes Sociales</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Editar Publicación</CardTitle>
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
                {loading ? 'Guardando...' : 'Guardar Cambios'}
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