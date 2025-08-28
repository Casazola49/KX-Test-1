#!/usr/bin/env node

/**
 * Script para verificar si hay imágenes en la galería de Firebase
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

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

async function checkGallery() {
  console.log('🖼️ Verificando galería en Firebase...\n');

  try {
    // Verificar todas las imágenes
    const allGallerySnapshot = await getDocs(collection(db, 'gallery'));
    console.log(`📊 Total de elementos en galería: ${allGallerySnapshot.size}`);
    
    // Verificar solo imágenes
    const imageQuery = query(collection(db, 'gallery'), where('type', '==', 'image'));
    const imageSnapshot = await getDocs(imageQuery);
    console.log(`🖼️ Imágenes encontradas: ${imageSnapshot.size}`);
    
    if (imageSnapshot.size > 0) {
      console.log('\n📋 Primeras 3 imágenes:');
      imageSnapshot.docs.slice(0, 3).forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${data.title || 'Sin título'}`);
        console.log(`   ID: ${doc.id}`);
        console.log(`   URL: ${data.src?.substring(0, 60)}...`);
        console.log('');
      });
    } else {
      console.log('\n❌ No se encontraron imágenes en la galería');
      console.log('💡 Necesitas agregar imágenes desde el panel de administración');
    }
    
    // Verificar si hay otros tipos
    if (allGallerySnapshot.size > imageSnapshot.size) {
      console.log(`📹 Otros elementos (videos, etc.): ${allGallerySnapshot.size - imageSnapshot.size}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkGallery().catch(console.error);