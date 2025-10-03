import { db } from '@/lib/firebase-admin';
import { COLLECTIONS } from '@/lib/firebase-collections';

const sampleAdvertisements = [
  {
    name: 'KartXperience Banner Principal',
    section: 'global',
    type: 'horizontal',
    image_url: '/publicidad/publicidad.jpg',
    link_url: 'https://kartxperience.bo',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: 'KartXperience Pop-up Principal',
    section: 'global',
    type: 'popup',
    image_url: '/publicidad/publicidad vertical.png',
    link_url: 'https://kartxperience.bo',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: 'Banner Noticias',
    section: 'noticias',
    type: 'horizontal',
    image_url: '/publicidad/publicidad.jpg',
    link_url: 'https://kartxperience.bo/noticias',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    name: 'Pop-up Eventos',
    section: 'eventos',
    type: 'popup',
    image_url: '/publicidad/publicidad vertical.png',
    link_url: 'https://kartxperience.bo/eventos',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export async function seedAdvertisements() {
  try {
    console.log('🚀 Iniciando seeding de anuncios...');
    
    const batch = db.batch();
    
    for (const ad of sampleAdvertisements) {
      const docRef = db.collection(COLLECTIONS.ADVERTISEMENTS).doc();
      batch.set(docRef, ad);
    }
    
    await batch.commit();
    
    console.log(`✅ Se crearon ${sampleAdvertisements.length} anuncios de ejemplo`);
    
  } catch (error) {
    console.error('❌ Error al crear anuncios:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedAdvertisements()
    .then(() => {
      console.log('✅ Seeding completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en seeding:', error);
      process.exit(1);
    });
}