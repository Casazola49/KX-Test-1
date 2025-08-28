/**
 * Script para crear karts de ejemplo en Firebase
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

async function createExampleKarts() {
  try {
    console.log('🚀 Creando karts de ejemplo...');

    // Verificar si ya existen karts
    const existingKarts = await db.collection('karts').get();
    if (!existingKarts.empty) {
      console.log(`⚠️ Ya existen ${existingKarts.size} karts en Firebase`);
      console.log('Karts existentes:');
      existingKarts.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.name} (${data.category})`);
      });
      return;
    }

    const exampleKarts = [
      {
        name: 'Kart Estándar',
        category: 'Estándar',
        description: 'Kart básico para principiantes y competencia amateur. Ideal para aprender las técnicas básicas del karting.',
        model_url: '/kart/MarioKart.glb'
      },
      {
        name: 'Kart Profesional',
        category: 'Profesional', 
        description: 'Kart avanzado para competencia profesional con características mejoradas de rendimiento.',
        model_url: '/kart/MarioKart.glb'
      },
      {
        name: 'Kart Junior',
        category: 'Junior',
        description: 'Kart diseñado especialmente para pilotos jóvenes con medidas de seguridad adicionales.',
        model_url: '/kart/MarioKart.glb'
      },
      {
        name: 'Kart Super',
        category: 'Super',
        description: 'Kart de alta performance para competencias de élite con tecnología de punta.',
        model_url: '/kart/MarioKart.glb'
      }
    ];

    console.log('📝 Creando karts de ejemplo...');
    let createdCount = 0;

    for (const kart of exampleKarts) {
      try {
        const docRef = db.collection('karts').doc();
        await docRef.set({
          ...kart,
          id: docRef.id,
          created_at: admin.firestore.FieldValue.serverTimestamp(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Kart creado: ${kart.name} (${kart.category})`);
        createdCount++;
      } catch (error) {
        console.error(`❌ Error creando kart ${kart.name}:`, error);
      }
    }

    console.log(`\n🎉 ¡${createdCount} karts creados exitosamente!`);

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar creación
createExampleKarts()
  .then(() => {
    console.log('🏁 Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });