/**
 * Script para probar el servicio de datos de karts
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

async function testKartDataService() {
  try {
    console.log('🧪 Probando servicio de datos de karts...');

    // Simular lo que hace getAllKarts en data-service.ts
    const snapshot = await db.collection('karts')
      .orderBy('created_at', 'desc')
      .get();

    if (snapshot.empty) {
      console.log('❌ No se encontraron karts en Firebase');
      return;
    }

    console.log(`✅ Encontrados ${snapshot.size} karts en Firebase:`);
    
    const karts = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const kart = {
        id: doc.id,
        ...data,
        // Convertir timestamps si existen
        created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at,
        updated_at: data.updated_at?.toDate?.()?.toISOString() || data.updated_at
      };
      
      karts.push(kart);
      console.log(`  📋 ${kart.name} (${kart.category})`);
      console.log(`     🔗 Modelo: ${kart.model_url}`);
      console.log(`     📝 Descripción: ${kart.description?.substring(0, 50)}...`);
      console.log('');
    });

    // Simular el mapeo que hace la página de kart
    console.log('🔄 Simulando mapeo de categorías...');
    const categories = karts.map(kart => ({
      name: kart.category,
      description: kart.description || `Kart ${kart.category}`,
      modelUrl: kart.model_url,
      kartName: kart.name
    }));

    console.log('📊 Categorías que se mostrarían en la página:');
    categories.forEach((category, index) => {
      console.log(`  ${index + 1}. ${category.name} - ${category.kartName}`);
      console.log(`     🎯 URL: ${category.modelUrl}`);
    });

    // Verificar URLs de modelos
    console.log('\n🔍 Verificando URLs de modelos...');
    const uniqueUrls = [...new Set(karts.map(k => k.model_url))];
    uniqueUrls.forEach(url => {
      console.log(`  📁 ${url}`);
    });

    console.log('\n🎉 Test completado exitosamente!');

  } catch (error) {
    console.error('❌ Error en el test:', error);
  }
}

// Ejecutar test
testKartDataService()
  .then(() => {
    console.log('\n🏁 Test finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });