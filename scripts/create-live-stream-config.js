/**
 * Script para crear configuración de live stream en Firebase
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

async function createLiveStreamConfig() {
  try {
    console.log('📺 Creando configuración de live stream...');

    // Verificar si ya existe configuración
    const existingConfig = await db.collection('live_streams').get();
    if (!existingConfig.empty) {
      console.log('⚠️ Ya existe configuración de live stream');
      existingConfig.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.stream_title} (Live: ${data.is_live})`);
      });
      return;
    }

    // Crear configuración por defecto
    const defaultConfig = {
      id: 'main-stream',
      is_live: false,
      stream_title: 'Próxima Carrera',
      stream_description: 'Sigue toda la acción minuto a minuto',
      iframe_url: null,
      youtube_url: null,
      twitch_url: null,
      chat_enabled: true,
      viewer_count: 0,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = db.collection('live_streams').doc('main-stream');
    await docRef.set(defaultConfig);

    console.log('✅ Configuración de live stream creada exitosamente');
    console.log(`  - Título: ${defaultConfig.stream_title}`);
    console.log(`  - Estado: ${defaultConfig.is_live ? 'En vivo' : 'Offline'}`);
    console.log(`  - Chat: ${defaultConfig.chat_enabled ? 'Habilitado' : 'Deshabilitado'}`);

  } catch (error) {
    console.error('❌ Error creando configuración:', error);
  }
}

// Ejecutar creación
createLiveStreamConfig()
  .then(() => {
    console.log('🏁 Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });