/**
 * Script para verificar los datos de karts en Firebase
 * Ejecutar con: npx tsx scripts/check-karts-data.ts
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

async function checkKartsData() {
  try {
    console.log('🔍 Verificando datos de karts en Firebase...\n');
    
    const kartsSnapshot = await db.collection('karts').get();
    
    if (kartsSnapshot.empty) {
      console.log('❌ No hay datos de karts en Firebase');
      console.log('📝 Necesitas agregar karts desde el panel de administración en /admin/karts');
      return;
    }
    
    console.log(`✅ Se encontraron ${kartsSnapshot.size} karts en Firebase\n`);
    
    kartsSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('-----------------------------------');
      console.log(`ID: ${doc.id}`);
      console.log(`Nombre: ${data.name}`);
      console.log(`Categoría: ${data.category}`);
      console.log(`Descripción: ${data.description || 'N/A'}`);
      console.log(`URL del modelo: ${data.model_url}`);
      
      // Verificar si la URL es de Supabase (ya no funciona)
      if (data.model_url && data.model_url.includes('supabase.co')) {
        console.log('⚠️  PROBLEMA: Esta URL es de Supabase y ya no funciona');
        console.log('💡 Solución: Edita este kart en /admin/karts y sube el modelo nuevamente');
      } else if (data.model_url && data.model_url.includes('cloudinary.com')) {
        console.log('✅ URL de Cloudinary - debería funcionar');
      } else if (data.model_url && data.model_url.startsWith('/')) {
        console.log('✅ URL local - debería funcionar');
      }
      
      console.log('');
    });
    
    console.log('-----------------------------------');
    console.log('\n📋 Resumen:');
    console.log(`Total de karts: ${kartsSnapshot.size}`);
    
    const supabaseUrls = kartsSnapshot.docs.filter(doc => 
      doc.data().model_url?.includes('supabase.co')
    ).length;
    
    if (supabaseUrls > 0) {
      console.log(`⚠️  ${supabaseUrls} karts tienen URLs de Supabase que necesitan ser actualizadas`);
      console.log('💡 Ve a /admin/karts y edita cada kart para subir el modelo nuevamente');
    } else {
      console.log('✅ Todos los karts tienen URLs válidas');
    }
    
  } catch (error) {
    console.error('❌ Error al verificar datos:', error);
  }
}

checkKartsData();
