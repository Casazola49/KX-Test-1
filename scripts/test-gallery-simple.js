#!/usr/bin/env node

/**
 * Script simple para probar la galería usando el data-service
 */

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy } = require('firebase/firestore');

// Configuración de Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testGallery() {
  console.log('🖼️ Probando galería directamente con Firebase...\n');

  try {
    
    console.log('📡 Obteniendo imágenes de la galería...');
    
    // Probar query simple primero
    const allGallerySnapshot = await getDocs(collection(db, 'gallery'));
    console.log(`📊 Total elementos en galería: ${allGallerySnapshot.size}`);
    
    if (allGallerySnapshot.size > 0) {
      console.log('\n📋 Primeros 3 elementos:');
      allGallerySnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${data.title || 'Sin título'}`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   Tipo: ${data.type || 'No definido'}`);
        console.log(`   URL: ${data.src?.substring(0, 60) || 'No URL'}...`);
        console.log('');
      });
      
      // Ahora probar filtro por tipo (sin orderBy para evitar problemas de índice)
      console.log('🔍 Probando filtro por tipo "image"...');
      const imageQuery = query(
        collection(db, 'gallery'), 
        where('type', '==', 'image')
      );
      const imageSnapshot = await getDocs(imageQuery);
      console.log(`🖼️ Imágenes filtradas: ${imageSnapshot.size}`);
      
      console.log('🎉 La galería funciona correctamente!');
    } else {
      console.log('❌ No se encontraron elementos en la galería');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testGallery().catch(console.error);