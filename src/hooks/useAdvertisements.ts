'use client';

import { useState, useEffect, useCallback } from 'react';
import { Advertisement } from '@/lib/types';
import { getAdvertisementsBySection } from '@/lib/advertisements-client';

export function useAdvertisements(section: string, type?: 'horizontal' | 'popup') {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadAd = useCallback(async () => {
    setLoading(true);
    try {
      // Primero buscar anuncios específicos de la sección
      let ads = await getAdvertisementsBySection(section, type);
      
      // Si no hay anuncios específicos, buscar anuncios globales
      if (ads.length === 0) {
        ads = await getAdvertisementsBySection('global', type);
      }
      
      // Seleccionar un anuncio aleatorio si hay varios
      if (ads.length > 0) {
        const randomAd = ads[Math.floor(Math.random() * ads.length)];
        setAd(randomAd);
      } else {
        setAd(null);
      }
    } catch (error) {
      console.error('Error loading ad:', error);
      setAd(null);
    } finally {
      setLoading(false);
    }
  }, [section, type, refreshKey]);

  const refresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    loadAd();
  }, [loadAd]);

  return { ad, loading, refresh };
}