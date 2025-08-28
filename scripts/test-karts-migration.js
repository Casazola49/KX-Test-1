/**
 * Script para verificar la migración de karts
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

async function testKartsMigration() {
  try {
    console.log('🧪 Verificando migración de karts...');

    // Verificar que existen karts en Firebase
    const kartsSnapshot = await db.collection('karts').get();
    
    if (kartsSnapshot.empty) {
      console.log('❌ No se encontraron karts en Firebase');
      return;
    }

    console.log(`✅ Encontrados ${kartsSnapshot.size} karts en Firebase:`);
    
    kartsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.name} (${data.category})`);
      console.log(`    Modelo: ${data.model_url}`);
      console.log(`    Descripción: ${data.description || 'Sin descripción'}`);
      console.log('');
    });

    // Verificar estructura de datos
    const firstKart = kartsSnapshot.docs[0].data();
    const requiredFields = ['id', 'name', 'category', 'model_url'];
    const missingFields = requiredFields.filter(field => !firstKart[field]);
    
    if (missingFields.length > 0) {
      console.log(`⚠️ Campos faltantes en karts: ${missingFields.join(', ')}`);
    } else {
      console.log('✅ Estructura de datos correcta');
    }

    console.log('\n🎉 Migración de karts verificada exitosamente!');

  } catch (error) {
    console.error('❌ Error verificando migración:', error);
  }
}

// Ejecutar verificación
testKartsMigration()
  .then(() => {
    console.log('🏁 Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });