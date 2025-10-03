'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Play } from 'lucide-react';
import { SocialMediaPost } from '@/lib/types';
import { getLatestSocialMediaPostsByPlatform } from '@/lib/data-service';

interface SocialMediaSectionProps {
  className?: string;
}

export default function SocialMediaSection({ className = '' }: SocialMediaSectionProps) {
  const [posts, setPosts] = useState<{
    youtube: SocialMediaPost | null;
    instagram: SocialMediaPost | null;
    tiktok: SocialMediaPost | null;
    facebook: SocialMediaPost | null;
  }>({
    youtube: null,
    instagram: null,
    tiktok: null,
    facebook: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLatestPosts();
  }, []);

  const loadLatestPosts = async () => {
    try {
      const latestPosts = await getLatestSocialMediaPostsByPlatform();
      setPosts(latestPosts);
    } catch (error) {
      console.error('Error loading social media posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformConfig = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return {
          name: 'YouTube',
          color: 'bg-red-600 hover:bg-red-700',
          icon: <Play className="h-6 w-6 fill-white" />,
          defaultImage: '/images/youtube-placeholder.jpg'
        };
      case 'instagram':
        return {
          name: 'Instagram',
          color: 'bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600',
          icon: <div className="h-6 w-6 rounded-lg border-2 border-white relative"><div className="absolute top-1 right-1 h-1 w-1 bg-white rounded-full"></div></div>,
          defaultImage: '/images/instagram-placeholder.jpg'
        };
      case 'tiktok':
        return {
          name: 'TikTok',
          color: 'bg-black hover:bg-gray-800',
          icon: <div className="h-6 w-6 bg-white rounded-lg flex items-center justify-center text-black font-bold text-xs">TT</div>,
          defaultImage: '/images/tiktok-placeholder.jpg'
        };
      case 'facebook':
        return {
          name: 'Facebook',
          color: 'bg-blue-600 hover:bg-blue-700',
          icon: <div className="h-6 w-6 bg-white rounded text-blue-600 flex items-center justify-center font-bold text-sm">f</div>,
          defaultImage: '/images/facebook-placeholder.jpg'
        };
      default:
        return {
          name: platform,
          color: 'bg-gray-500 hover:bg-gray-600',
          icon: <ExternalLink className="h-4 w-4" />,
          defaultImage: '/images/social-placeholder.jpg'
        };
    }
  };

  const extractVideoId = (url: string, platform: string) => {
    if (platform === 'youtube') {
      const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
      return match ? match[1] : null;
    }
    return null;
  };

  const extractInstagramId = (url: string) => {
    const match = url.match(/instagram\.com\/(?:p|reel)\/([^\/\?]+)/);
    return match ? match[1] : null;
  };

  const extractTikTokId = (url: string) => {
    const match = url.match(/tiktok\.com\/@[^\/]+\/video\/(\d+)/);
    return match ? match[1] : null;
  };

  const extractFacebookId = (url: string) => {
    const match = url.match(/facebook\.com\/.*\/(?:posts|videos)\/(\d+)/);
    return match ? match[1] : null;
  };

  const getEmbedUrl = (post: SocialMediaPost) => {
    if (post.platform === 'youtube') {
      const videoId = extractVideoId(post.post_url, 'youtube');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }
    return null;
  };

  const getThumbnailUrl = (post: SocialMediaPost) => {
    // Si hay una URL de miniatura personalizada, usarla
    if (post.thumbnail_url && post.thumbnail_url.trim()) {
      return post.thumbnail_url;
    }
    
    // Generar miniaturas automáticamente según la plataforma
    switch (post.platform) {
      case 'youtube':
        const videoId = extractVideoId(post.post_url, 'youtube');
        if (videoId) {
          // Usar hqdefault que es más confiable
          return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
        return null;
      
      case 'instagram':
        return null; // Usaremos el fallback
      
      case 'tiktok':
        return null; // Usaremos el fallback
      
      case 'facebook':
        return null; // Usaremos el fallback
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-0">
              <div className="aspect-video bg-gray-200 rounded-t-lg" />
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const hasAnyPosts = posts.youtube || posts.instagram || posts.tiktok || posts.facebook;

  if (!hasAnyPosts) {
    return null;
  }

  return (
    <div className={`mb-8 ${className}`}>
      <h2 className="text-2xl font-bold mb-6 text-center">Síguenos en Redes Sociales</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(['youtube', 'instagram', 'tiktok', 'facebook'] as const).map((platform) => {
          const post = posts[platform];
          const config = getPlatformConfig(platform);
          
          if (!post) {
            return (
              <Card key={platform} className="opacity-50">
                <CardContent className="p-0">
                  <div className="aspect-video bg-gray-100 rounded-t-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <div className="mb-2">{config.icon}</div>
                      <p className="text-sm">No hay contenido de {config.name}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <Badge className={`${config.color} text-white mb-2`}>
                      {config.name}
                    </Badge>
                    <p className="text-sm text-gray-500">Próximamente...</p>
                  </div>
                </CardContent>
              </Card>
            );
          }

          const thumbnailUrl = getThumbnailUrl(post);
          const embedUrl = getEmbedUrl(post);

          return (
            <Card key={platform} className="group hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-0">
                <div 
                  className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden relative cursor-pointer"
                  onClick={() => window.open(post.post_url, '_blank')}
                >
                  {thumbnailUrl ? (
                    <img 
                      src={thumbnailUrl} 
                      alt={post.title || `${config.name} post`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        // Si falla la imagen, ocultar y mostrar fallback
                        e.currentTarget.style.display = 'none';
                        const fallback = e.currentTarget.parentElement?.querySelector('.fallback-content');
                        if (fallback) {
                          fallback.classList.remove('hidden');
                        }
                      }}
                    />
                  ) : null}
                  
                  <div className={`fallback-content w-full h-full bg-gradient-to-br ${config.color} flex items-center justify-center text-white ${thumbnailUrl ? 'hidden' : ''}`}>
                    <div className="text-center">
                      <div className="mb-2 flex justify-center text-2xl">{config.icon}</div>
                      <p className="text-sm font-medium">{config.name}</p>
                      {post.title && <p className="text-xs mt-1 opacity-80 px-2">{post.title}</p>}
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  <Badge className={`${config.color} text-white mb-2`}>
                    {config.name}
                  </Badge>
                  
                  {post.title && (
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                      {post.title}
                    </h3>
                  )}
                  
                  {post.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {post.description}
                    </p>
                  )}
                  
                  <button
                    onClick={() => window.open(post.post_url, '_blank')}
                    className="mt-3 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    Ver en {config.name}
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}