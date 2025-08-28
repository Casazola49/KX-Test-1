#!/usr/bin/env node

/**
 * Script para probar la galería en la página de inicio
 */

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

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

async function testHomeGallery() {
  console.log('🏠 Probando galería para la página de inicio...\n');

  try {
    // Simular lo que hace HomeGalleryClient
    console.log('📡 Obteniendo imágenes tipo "image"...');
    
    const imageQuery = query(
      collection(db, 'gallery'), 
      where('type', '==', 'image')
    );
    const imageSnapshot = await getDocs(imageQuery);
    
    console.log(`🖼️ Total de imágenes encontradas: ${imageSnapshot.size}`);
    
    if (imageSnapshot.size > 0) {
      // Simular tomar solo las primeras 6 como hace el componente
      const limitedImages = imageSnapshot.docs.slice(0, 6);
      
      console.log(`📋 Mostrando las primeras 6 imágenes para la página de inicio:`);
      
      limitedImages.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${data.title || 'Sin título'}`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   URL: ${data.src?.substring(0, 50)}...`);
        console.log(`   Descripción: ${data.description?.substring(0, 50) || 'Sin descripción'}...`);
        console.log('');
      });
      
      console.log('✅ La galería de la página de inicio debería funcionar correctamente!');
      console.log('💡 Verifica la página de inicio en el navegador.');
      
    } else {
      console.log('❌ No se encontraron imágenes para mostrar en la página de inicio');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testHomeGallery().catch(console.error);