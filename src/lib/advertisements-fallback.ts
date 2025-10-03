// Sistema de fallback para anuncios cuando Firebase no está disponible

import { Advertisement } from '@/lib/types';

// Anuncios de ejemplo que se usan cuando Firebase no está disponible
// Basados en los anuncios configurados en el panel de admin
const fallbackAdvertisements: Advertisement[] = [
  {
    id: 'fallback-global-1',
    name: 'LA MAS SISTEMA FRENO - Global',
    section: 'global',
    type: 'horizontal',
    image_url: 'https://res.cloudinary.com/dggj5tnke/image/upload/v1737575247/publicidad/jxlpxs/xvj2f5s5j34j.png',
    link_url: 'https://www.facebook.com/lamassistemafreno',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'fallback-global-2',
    name: 'KARTIGO - Global',
    section: 'global',
    type: 'horizontal',
    image_url: 'https://res.cloudinary.com/dggj5tnke/image/upload/v1737575247/publicidad/jxlpxs/xvj2f5s5j34j.png',
    link_url: 'https://kartxperience.bo',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export function getFallbackAdvertisements(section: string, type?: 'horizontal' | 'popup'): Advertisement[] {
  // Intentar obtener anuncios de localStorage primero (modo emergencia)
  let allAds = [...fallbackAdvertisements];
  
  if (typeof window !== 'undefined') {
    try {
      const localAds = JSON.parse(localStorage.getItem('fallback-ads') || '[]');
      allAds = [...allAds, ...localAds];
    } catch (error) {
      console.warn('Error reading localStorage ads:', error);
    }
  }
  
  let filtered = allAds.filter(ad => 
    (ad.section === section || ad.section === 'global') && ad.is_active
  );
  
  if (type) {
    filtered = filtered.filter(ad => ad.type === type);
  }
  
  return filtered;
}

export function isFirebaseAvailable(): boolean {
  try {
    // Verificar si las variables de entorno están configuradas
    return !!(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    );
  } catch {
    return false;
  }
}