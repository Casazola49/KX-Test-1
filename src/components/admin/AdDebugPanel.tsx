'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { getAdvertisementsBySection } from '@/lib/advertisements-client';
import { Advertisement } from '@/lib/types';

interface AdDebugPanelProps {
  section: string;
}

export default function AdDebugPanel({ section }: AdDebugPanelProps) {
  const [horizontalAds, setHorizontalAds] = useState<Advertisement[]>([]);
  const [popupAds, setPopupAds] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadAds = async () => {
    setLoading(true);
    try {
      const [horizontal, popup] = await Promise.all([
        getAdvertisementsBySection(section, 'horizontal'),
        getAdvertisementsBySection(section, 'popup')
      ]);
      
      setHorizontalAds(horizontal);
      setPopupAds(popup);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading ads for debug:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, [section]);

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm">Debug: Anuncios para "{section}"</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAds}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <div>
          <strong>Banners Horizontales:</strong> {horizontalAds.length} encontrados
          {horizontalAds.map(ad => (
            <div key={ad.id} className="ml-4 text-xs text-muted-foreground">
              • {ad.name} ({ad.is_active ? 'Activo' : 'Inactivo'})
            </div>
          ))}
        </div>
        
        <div>
          <strong>Pop-ups:</strong> {popupAds.length} encontrados
          {popupAds.map(ad => (
            <div key={ad.id} className="ml-4 text-xs text-muted-foreground">
              • {ad.name} ({ad.is_active ? 'Activo' : 'Inactivo'})
            </div>
          ))}
        </div>
        
        {lastUpdate && (
          <div className="text-xs text-muted-foreground">
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}