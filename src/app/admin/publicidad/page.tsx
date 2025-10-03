'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, ExternalLink, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Advertisement } from '@/lib/types';
import { getAdvertisements, toggleAdvertisementStatus, deleteAdvertisement } from './actions';
import { useToast } from '@/hooks/use-toast';

export default function PublicidadPage() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadAdvertisements();
  }, []);

  const loadAdvertisements = async () => {
    try {
      const ads = await getAdvertisements();
      setAdvertisements(ads);
    } catch (error: any) {
      console.error('Error loading advertisements:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los anuncios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleAdvertisementStatus(id, !currentStatus);
      await loadAdvertisements();
      toast({
        title: "Éxito",
        description: `Anuncio ${!currentStatus ? 'activado' : 'desactivado'} correctamente`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del anuncio",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este anuncio?')) return;
    
    try {
      await deleteAdvertisement(id);
      await loadAdvertisements();
      toast({
        title: "Éxito",
        description: "Anuncio eliminado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el anuncio",
        variant: "destructive",
      });
    }
  };

  const getSectionLabel = (section: string) => {
    const labels: { [key: string]: string } = {
      'home': 'Inicio',
      'noticias': 'Noticias',
      'eventos': 'Eventos',
      'pilotos': 'Pilotos',
      'galeria': 'Galería',
      'pistas': 'Pistas',
      'kart': 'Kart',
      'equipamiento': 'Equipamiento',
      'reglamento': 'Reglamento',
      'contacto': 'Contacto',
      'live': 'Carrera en Vivo',
      'global': 'Global'
    };
    return labels[section] || section;
  };

  const getTypeLabel = (type: string) => {
    return type === 'horizontal' ? 'Horizontal' : 'Pop-up';
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando anuncios...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestión de Publicidad</h1>
        <Link href="/admin/publicidad/add">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Anuncio
          </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {advertisements.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No hay anuncios configurados</p>
              <Link href="/admin/publicidad/add">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer anuncio
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          advertisements.map((ad) => (
            <Card key={ad.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {ad.name}
                      <Badge variant={ad.is_active ? "default" : "secondary"}>
                        {ad.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                      <Badge variant="outline">
                        {getTypeLabel(ad.type)}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sección: {getSectionLabel(ad.section)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(ad.id, ad.is_active)}
                    >
                      {ad.is_active ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Link href={`/admin/publicidad/edit/${ad.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(ad.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="relative w-32 h-20 bg-muted rounded overflow-hidden">
                    <Image
                      src={ad.image_url}
                      alt={ad.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    {ad.link_url && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ExternalLink className="h-4 w-4" />
                        <a 
                          href={ad.link_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {ad.link_url}
                        </a>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      Creado: {new Date(ad.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}