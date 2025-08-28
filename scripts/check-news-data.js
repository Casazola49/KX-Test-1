#!/usr/bin/env node

/**
 * Script para verificar los datos de noticias en Firebase
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Configurar Firebase Admin
const serviceAccount = {
  type: "service_account",
  project_id: "kx2025-5cf91",
  private_key_id: "fbsvc123",
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: "123456789",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
};

try {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: 'kx2025-5cf91'
  });
} catch (error) {
  // App ya inicializada
}

async function checkNewsData() {
  const db = getFirestore();
  console.log('🔍 Verificando datos de noticias en Firebase...\n');

  try {
    const newsSnapshot = await db.collection('news').orderBy('createdAt', 'desc').limit(5).get();
    
    if (newsSnapshot.empty) {
      console.log('❌ No se encontraron noticias en Firebase');
      return;
    }

    console.log(`✅ Encontradas ${newsSnapshot.size} noticias:\n`);

    newsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ID: ${doc.id}`);
      console.log(`   Título: ${data.title}`);
      console.log(`   Slug: ${data.slug}`);
      console.log(`   Categoría: ${data.category}`);
      console.log(`   Fecha: ${data.createdAt?.toDate?.() || data.createdAt}`);
      console.log(`   Imagen: ${data.imageUrl ? '✅ Sí' : '❌ No'}`);
      console.log(`   isMain: ${data.isMain}`);
      console.log('');
    });

    // Buscar específicamente la noticia "prueba noticia 33"
    const testNewsQuery = await db.collection('news')
      .where('title', '==', 'prueba noticia 33')
      .get();

    if (!testNewsQuery.empty) {
      console.log('🎯 Noticia "prueba noticia 33" encontrada:');
      const testDoc = testNewsQuery.docs[0];
      console.log('   ID:', testDoc.id);
      console.log('   Datos:', JSON.stringify(testDoc.data(), null, 2));
    } else {
      console.log('❌ No se encontró la noticia "prueba noticia 33"');
    }

  } catch (error) {
    console.error('❌ Error al verificar noticias:', error);
  }
}

checkNewsData();