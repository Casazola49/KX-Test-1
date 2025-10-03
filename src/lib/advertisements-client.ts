'use client';

import { Advertisement } from '@/lib/types';
import { getFallbackAdvertisements } from '@/lib/advertisements-fallback';

export async function getAdvertisementsBySection(section: string, type?: 'horizontal' | 'popup'): Promise<Advertisement[]> {
  try {
    const params = new URLSearchParams();
    params.append('section', section);
    if (type) {
      params.append('type', type);
    }
    // Agregar timestamp para evitar cache
    params.append('_t', Date.now().toString());
    
    const response = await fetch(`/api/advertisements?${params.toString()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
      // Agregar timeout más corto
      signal: AbortSignal.timeout(5000)
    });
    
    if (!response.ok) {
      console.warn(`API Error: ${response.status}, usando fallback`);
      return getFallbackAdvertisements(section, type);
    }
    
    const data = await response.json();
    
    // Si la API devuelve error pero con status 200, usar fallback
    if (!data.success || !data.advertisements) {
      console.warn('API returned error, usando fallback:', data.error);
      return getFallbackAdvertisements(section, type);
    }
    
    return data.advertisements || [];
  } catch (error) {
    console.warn('Error fetching advertisements, usando fallback:', error);
    // En caso de error, usar anuncios de fallback
    return getFallbackAdvertisements(section, type);
  }
}