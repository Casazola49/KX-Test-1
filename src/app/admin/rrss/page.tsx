'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { SocialMediaPost } from '@/lib/types';
import { getAllSocialMediaPosts, deleteSocialMediaPost } from '@/lib/data-service';

export default function RRSSPage() {
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await getAllSocialMediaPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error loading social media posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      try {
        await deleteSocialMediaPost(id);
        await loadPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Error al eliminar la publicación');
      }
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'youtube': return 'bg-red-500';
      case 'instagram': return 'bg-pink-500';
      case 'tiktok': return 'bg-black';
      case 'facebook': return 'bg-blue-600';
      default: return 'bg-gray-500';
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'youtube': return 'YouTube';
      case 'instagram': return 'Instagram';
      case 'tiktok': return 'TikTok';
      case 'facebook': return 'Facebook';
      default: return platform;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando publicaciones...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Redes Sociales</h1>
        <Link href="/admin/rrss/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Añadir Publicación
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id} className="relative">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg line-clamp-2">
                  {post.title || 'Sin título'}
                </CardTitle>
                <Badge className={`${getPlatformColor(post.platform)} text-white`}>
                  {getPlatformName(post.platform)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {post.thumbnail_url && (
                <img 
                  src={post.thumbnail_url} 
                  alt={post.title || 'Thumbnail'} 
                  className="w-full h-32 object-cover rounded mb-3"
                />
              )}
              
              {post.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {post.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <Badge variant={post.is_active ? 'default' : 'secondary'}>
                  {post.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(post.post_url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  
                  <Link href={`/admin/rrss/edit/${post.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No hay publicaciones de redes sociales</p>
          <Link href="/admin/rrss/add">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Primera Publicación
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}