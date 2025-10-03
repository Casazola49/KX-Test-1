/**
 * Script para actualizar las URLs de los karts en Firebase
 * Cambia las URLs de Supabase por rutas locales
 * Ejecutar con: npx tsx scripts/update-karts-urls.ts
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

// Mapeo de categorías a archivos locales
const CATEGORY_TO_FILE: Record<string, string> = {
  'F200 Super': '/kart/F200 super.glb',
  'F200 SUPER': '/kart/F200 super.glb',
  'F200 Standard': '/kart/F200 Standard.glb',
  'F200 STANDARD': '/kart/F200 Standard.glb',
  '125cc Profesional': '/kart/125 cc profesional.glb',
  '125 CC PROFESIONAL': '/kart/125 cc profesional.glb',
  '100cc Junior': '/kart/100 cc junior.glb',
  '100 CC JUNIOR': '/kart/100 cc junior.glb',
  'Mini 60': '/kart/mini 60.glb',
  'MINI 60': '/kart/mini 60.glb',
  'Infantil 6.5': '/kart/infantil 6.5.glb',
  'INFANTIL 6.5': '/kart/infantil 6.5.glb',
  'Baby Kart': '/kart/baby kart.glb',
  'BABY KART': '/kart/baby kart.glb',
};

async function updateKartsUrls() {
  try {
    console.log('🔄 Actualizando URLs de karts en Firebase...\n');
    
    const kartsSnapshot = await db.collection('karts').get();
    
    if (kartsSnapshot.empty) {
      console.log('❌ No hay karts en Firebase');
      console.log('💡 Necesitas crear los karts desde /admin/karts/add');
      return;
    }
    
    console.log(`📊 Se encontraron ${kartsSnapshot.size} karts\n`);
    
    let updated = 0;
    let skipped = 0;
    
    for (const doc of kartsSnapshot.docs) {
      const data = doc.data();
      const category = data.category;
      const currentUrl = data.model_url;
      
      console.log('-----------------------------------');
      console.log(`ID: ${doc.id}`);
      console.log(`Categoría: ${category}`);
      console.log(`URL actual: ${currentUrl}`);
      
      // Buscar la URL local correspondiente
      const localUrl = CATEGORY_TO_FILE[category];
      
      if (!localUrl) {
        console.log(`⚠️  No se encontró mapeo para la categoría: ${category}`);
        console.log(`💡 Agrega el mapeo en el script o usa una categoría válida`);
        skipped++;
        continue;
      }
      
      // Verificar si ya tiene la URL local
      if (currentUrl === localUrl) {
        console.log(`✅ Ya tiene la URL local correcta`);
        skipped++;
        continue;
      }
      
      // Actualizar la URL
      await doc.ref.update({
        model_url: localUrl,
        updated_at: new Date(),
      });
      
      console.log(`✅ Actualizado a: ${localUrl}`);
      updated++;
    }
    
    console.log('\n-----------------------------------');
    console.log('📋 Resumen:');
    console.log(`✅ Actualizados: ${updated}`);
    console.log(`⏭️  Sin cambios: ${skipped}`);
    console.log(`📊 Total: ${kartsSnapshot.size}`);
    
    if (updated > 0) {
      console.log('\n🎉 ¡URLs actualizadas exitosamente!');
      console.log('🚀 Ahora puedes ver los karts en /kart');
    }
    
  } catch (error) {
    console.error('❌ Error actualizando URLs:', error);
  }
}

updateKartsUrls();
