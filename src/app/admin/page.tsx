'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Calendar, 
  Newspaper, 
  Image as ImageIcon, 
  Package, 
  Map, 
  Car, 
  Wrench,
  Share2,
  Monitor,
  Plus
} from 'lucide-react';
import Link from 'next/link';

const adminSections = [
  {
    title: 'Pilotos',
    description: 'Gestionar pilotos y equipos',
    icon: Users,
    href: '/admin/pilots',
    color: 'bg-blue-500'
  },
  {
    title: 'Eventos',
    description: 'Administrar eventos y carreras',
    icon: Calendar,
    href: '/admin/events',
    color: 'bg-green-500'
  },
  {
    title: 'Noticias',
    description: 'Crear y editar noticias',
    icon: Newspaper,
    href: '/admin/news',
    color: 'bg-purple-500'
  },
  {
    title: 'Galería',
    description: 'Gestionar imágenes y videos',
    icon: ImageIcon,
    href: '/admin/gallery',
    color: 'bg-pink-500'
  },
  {
    title: 'Productos',
    description: 'Administrar equipamiento y servicios',
    icon: Package,
    href: '/admin/products',
    color: 'bg-orange-500'
  },
  {
    title: 'Pistas',
    description: 'Gestionar información de pistas',
    icon: Map,
    href: '/admin/tracks',
    color: 'bg-red-500'
  },
  {
    title: 'Karts',
    description: 'Administrar modelos de karts',
    icon: Car,
    href: '/admin/karts',
    color: 'bg-yellow-500'
  },
  {
    title: 'Asesores',
    description: 'Gestionar mecánicos y asesores',
    icon: Wrench,
    href: '/admin/mechanics',
    color: 'bg-gray-500'
  },
  {
    title: 'Redes Sociales',
    description: 'Administrar contenido de RRSS',
    icon: Share2,
    href: '/admin/rrss',
    color: 'bg-cyan-500'
  },
  {
    title: 'Publicidad',
    description: 'Gestionar anuncios y banners',
    icon: Monitor,
    href: '/admin/publicidad',
    color: 'bg-lime-500'
  }
];

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Gestiona todo el contenido de Karting Bolivia desde aquí
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.href} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${section.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 text-sm">
                  {section.description}
                </p>
                <Link href={section.href}>
                  <Button className="w-full">
                    Administrar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/events/add">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Evento
                </Button>
              </Link>
              <Link href="/admin/news/add">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Noticia
                </Button>
              </Link>
              <Link href="/admin/pilots/add">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Piloto
                </Button>
              </Link>
              <Link href="/admin/publicidad/add">
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Anuncio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}