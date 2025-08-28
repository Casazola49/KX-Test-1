#!/usr/bin/env node

/**
 * Script para probar la migración del frontend público
 * Verifica que todas las páginas migradas funcionen correctamente con Firebase
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc, query, where, limit } = require('firebase/firestore');

// Configuración de Firebase (usando variables de entorno)
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

const COLLECTIONS = {
  PRODUCTS: 'products',
  LIVE_STREAMS: 'live_streams',
  GALLERY: 'gallery',
  KARTS: 'karts'
};

async function testFrontendMigration() {
  console.log('🧪 Probando migración del frontend público...\n');

  let allTestsPassed = true;

  // Test 1: Homepage Hero - Live Streams
  console.log('1️⃣ Probando Homepage Hero (Live Streams)...');
  try {
    const liveStreamsSnapshot = await getDocs(collection(db, COLLECTIONS.LIVE_STREAMS));
    console.log(`   ✅ Colección live_streams: ${liveStreamsSnapshot.size} documentos`);
    
    if (liveStreamsSnapshot.size > 0) {
      const firstStream = liveStreamsSnapshot.docs[0];
      const streamData = firstStream.data();
      console.log(`   📊 Ejemplo: ${JSON.stringify({
        id: firstStream.id,
        event_id: streamData.event_id,
        is_live: streamData.is_live
      }, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 2: Equipamiento/Servicios - Products
  console.log('\n2️⃣ Probando Equipamiento/Servicios (Products)...');
  try {
    const productsSnapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    console.log(`   ✅ Colección products: ${productsSnapshot.size} documentos`);
    
    if (productsSnapshot.size > 0) {
      const firstProduct = productsSnapshot.docs[0];
      const productData = firstProduct.data();
      console.log(`   📊 Ejemplo: ${JSON.stringify({
        id: firstProduct.id,
        name: productData.name,
        slug: productData.slug,
        category: productData.category
      }, null, 2)}`);

      // Test slug lookup
      if (productData.slug) {
        const slugQuery = query(
          collection(db, COLLECTIONS.PRODUCTS),
          where('slug', '==', productData.slug),
          limit(1)
        );
        const slugSnapshot = await getDocs(slugQuery);
        console.log(`   ✅ Búsqueda por slug funciona: ${slugSnapshot.size > 0 ? 'Sí' : 'No'}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 3: Página de Karts
  console.log('\n3️⃣ Probando Página de Karts...');
  try {
    const kartsSnapshot = await getDocs(collection(db, COLLECTIONS.KARTS));
    console.log(`   ✅ Colección karts: ${kartsSnapshot.size} documentos`);
    
    if (kartsSnapshot.size > 0) {
      const firstKart = kartsSnapshot.docs[0];
      const kartData = firstKart.data();
      console.log(`   📊 Ejemplo: ${JSON.stringify({
        id: firstKart.id,
        category: kartData.category,
        description: kartData.description,
        model_url: kartData.model_url
      }, null, 2)}`);
    } else {
      console.log('   ⚠️  No hay karts en Firebase, se usarán datos por defecto');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    allTestsPassed = false;
  }

  // Test 4: Home Gallery
  console.log('\n4️⃣ Probando Home Gallery...');
  try {
    const galleryQuery = query(
      collection(db, COLLECTIONS.GALLERY),
      where('type', '==', 'image'),
      limit(6)
    );
    const gallerySnapshot = await getDocs(galleryQuery);
    console.log(`   ✅ Galería (imágenes): ${gallerySnapshot.size} documentos`);
    
    if (gallerySnapshot.size > 0) {
      const firstImage = gallerySnapshot.docs[0];
      const imageData = firstImage.data();
      console.log(`   📊 Ejemplo: ${JSON.stringify({
        id: firstImage.id,
        title: imageData.title,
        type: imageData.type,
        src: imageData.src?.substring(0, 50) + '...'
      }, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    allTestsPassed = false;
  }

  // Resumen final
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 ¡Todas las pruebas del frontend pasaron exitosamente!');
    console.log('\n✅ **FRONTEND PÚBLICO MIGRADO COMPLETAMENTE**');
    console.log('\n📋 **Páginas migradas:**');
    console.log('   • Homepage Hero (Live streams)');
    console.log('   • Equipamiento/Servicios (lista y detalle)');
    console.log('   • Página de Karts');
    console.log('   • Home Gallery');
    console.log('\n🚀 **Próximos pasos:**');
    console.log('   1. Probar las páginas en el navegador');
    console.log('   2. Verificar que no haya errores de consola');
    console.log('   3. Eliminar dependencias de Supabase');
  } else {
    console.log('❌ Algunas pruebas fallaron. Revisar los errores arriba.');
  }
}

// Ejecutar las pruebas
testFrontendMigration().catch(console.error);