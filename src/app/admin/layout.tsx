
'use client';

import Link from 'next/link';
import {
  Home,
  Users,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
  Newspaper,
  Package,
  Map,
  Trophy,
  Car,
  Wrench, // Import Wrench icon
} from 'lucide-react';

import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from '@/components/ui/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarContent className="pt-16"> 
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin">
                    <Home className="h-4 w-4 mr-2" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/pilots">
                    <Users className="h-4 w-4 mr-2" />
                    <span>Pilots</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/standings">
                    <Trophy className="h-4 w-4 mr-2" />
                    <span>Standings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/events">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Events</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/news">
                    <Newspaper className="h-4 w-4 mr-2" />
                    <span>News</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/gallery">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    <span>Gallery</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/products">
                    <Package className="h-4 w-4 mr-2" />
                    <span>Products</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Added Mechanics Link */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/mechanics">
                    <Wrench className="h-4 w-4 mr-2" />
                    <span>Asesores</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/karts">
                    <Car className="h-4 w-4 mr-2" />
                    <span>Karts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/tracks">
                    <Map className="h-4 w-4 mr-2" />
                    <span>Tracks</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/admin/live">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span>Live Chat</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <main className="flex-1 w-full lg:pl-64">
            {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
