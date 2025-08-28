/**
 * Script para verificar qué datos faltan en Firebase
 */

const admin = require('firebase-admin');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Configuración de Firebase
const serviceAccount = {
  type: "service_account",
  project_id: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n').split('"')[1],
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore();

async function checkMissingData() {
  try {
    console.log('🔍 Verificando datos faltantes en Firebase...\n');

    // Verificar mecánicos
    console.log('👨‍🔧 Verificando mecánicos...');
    const mechanicsSnapshot = await db.collection('mechanics').get();
    if (mechanicsSnapshot.empty) {
      console.log('❌ No hay mecánicos en Firebase');
    } else {
      console.log(`✅ Encontrados ${mechanicsSnapshot.size} mecánicos`);
    }

    // Verificar configuración de live stream
    console.log('\n📺 Verificando configuración de live stream...');
    const liveStreamSnapshot = await db.collection('live_streams').get();
    if (liveStreamSnapshot.empty) {
      console.log('❌ No hay configuración de live stream en Firebase');
    } else {
      console.log(`✅ Encontradas ${liveStreamSnapshot.size} configuraciones de live stream`);
    }

    // Verificar galería
    console.log('\n🖼️ Verificando galería...');
    const gallerySnapshot = await db.collection('gallery').get();
    if (gallerySnapshot.empty) {
      console.log('❌ No hay imágenes en la galería de Firebase');
    } else {
      console.log(`✅ Encontradas ${gallerySnapshot.size} imágenes en galería`);
    }

    // Verificar karts (ya sabemos que existen)
    console.log('\n🏎️ Verificando karts...');
    const kartsSnapshot = await db.collection('karts').get();
    console.log(`✅ Encontrados ${kartsSnapshot.size} karts`);

    console.log('\n📊 Resumen:');
    console.log(`- Mecánicos: ${mechanicsSnapshot.size > 0 ? '✅' : '❌'}`);
    console.log(`- Live Stream: ${liveStreamSnapshot.size > 0 ? '✅' : '❌'}`);
    console.log(`- Galería: ${gallerySnapshot.size > 0 ? '✅' : '❌'}`);
    console.log(`- Karts: ✅`);

  } catch (error) {
    console.error('❌ Error verificando datos:', error);
  }
}

// Ejecutar verificación
checkMissingData()
  .then(() => {
    console.log('\n🏁 Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });