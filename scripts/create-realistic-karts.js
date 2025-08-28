/**
 * Script para crear karts realistas basados en las categorías de karting
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

async function createRealisticKarts() {
  try {
    console.log('🏎️ Creando karts realistas basados en categorías de karting...');

    // Limpiar karts existentes
    const existingKarts = await db.collection('karts').get();
    if (!existingKarts.empty) {
      console.log(`🧹 Eliminando ${existingKarts.size} karts existentes...`);
      const batch = db.batch();
      existingKarts.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    // Karts realistas basados en categorías reales de karting
    const realisticKarts = [
      {
        name: 'Baby Kart',
        category: 'Baby Kart',
        description: 'Kart para niños de 5-8 años. Motor de 60cc, velocidad máxima 40 km/h. Ideal para iniciarse en el karting.',
        model_url: '/kart/MarioKart.glb'
      },
      {
        name: 'Mini 60cc',
        category: 'Mini 60',
        description: 'Categoría infantil para pilotos de 8-12 años. Motor Comer 60cc, chasis específico para menores.',
        model_url: '/kart/MarioKart.glb'
      },
      {
        name: 'Infantil 6.5 HP',
        category: 'Infantil 6.5',
        description: 'Para pilotos de 10-14 años. Motor Honda GX200 6.5 HP, excelente para aprender técnicas avanzadas.',
        model_url: '/kart/MarioKart.glb'
      },
      {
        name: '100cc Junior',
        category: '100cc Junior',
        description: 'Categoría junior con motor Yamaha KT100. Para pilotos de 12-16 años con experiencia intermedia.',
        model_url: '/kart/MarioKart.glb'
      },
      {
        name: 'F200 Estándar',
        category: 'F200 Estándar',
        description: 'Categoría nacional con motor Briggs & Stratton 206. Ideal para pilotos amateur y semi-profesionales.',
        model_url: '/kart/MarioKart.glb'
      },
      {
        name: 'F200 Super',
        category: 'F200 Super',
        description: 'Versión mejorada del F200 con modificaciones permitidas. Mayor potencia y velocidad.',
        model_url: '/kart/MarioKart.glb'
      },
      {
        name: '125cc Profesional',
        category: '125cc Profesional',
        description: 'Categoría profesional con motor Rotax Max o IAME X30. Para pilotos experimentados y competencia de élite.',
        model_url: '/kart/MarioKart.glb'
      },
      {
        name: 'Shifter Kart',
        category: 'Shifter',
        description: 'Kart con caja de cambios y motor de 125cc. La categoría más rápida del karting nacional.',
        model_url: '/kart/MarioKart.glb'
      }
    ];

    console.log(`📝 Creando ${realisticKarts.length} karts realistas...`);
    let createdCount = 0;

    for (const kart of realisticKarts) {
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

    console.log(`\n🎉 ¡${createdCount} karts realistas creados exitosamente!`);
    console.log('\n📋 Categorías disponibles:');
    realisticKarts.forEach((kart, index) => {
      console.log(`  ${index + 1}. ${kart.category} - ${kart.name}`);
    });

    console.log('\n💡 Nota: Estos karts usan el modelo MarioKart.glb como placeholder.');
    console.log('   Puedes subir modelos GLB reales desde el panel de administración.');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar creación
createRealisticKarts()
  .then(() => {
    console.log('\n🏁 Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });