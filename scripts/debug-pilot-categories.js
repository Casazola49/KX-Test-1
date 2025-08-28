const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

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

// Función convertTimestamps simplificada
function convertTimestamps(data) {
  if (!data || typeof data !== 'object') return data;
  
  if (Array.isArray(data)) {
    return data.map(item => convertTimestamps(item));
  }
  
  const converted = { ...data };
  
  if (converted.createdAt?.toDate) converted.createdAt = converted.createdAt.toDate().toISOString();
  if (converted.updatedAt?.toDate) converted.updatedAt = converted.updatedAt.toDate().toISOString();
  if (converted.date?.toDate) converted.date = converted.date.toDate().toISOString();
  if (converted.event_date?.toDate) converted.event_date = converted.event_date.toDate().toISOString();
  
  for (const key in converted) {
    if (converted.hasOwnProperty(key) && converted[key] && typeof converted[key] === 'object') {
      if (converted[key].toDate && typeof converted[key].toDate === 'function') {
        converted[key] = converted[key].toDate().toISOString();
      } else {
        converted[key] = convertTimestamps(converted[key]);
      }
    }
  }
  
  return converted;
}

async function debugPilotCategories() {
  try {
    console.log('🔍 Debugging pilot categories...\n');
    
    // Obtener pilotos como lo hace getAllPilots()
    const snapshot = await getDocs(
      query(collection(db, 'pilots'), orderBy('number'))
    );
    const pilots = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
    
    console.log(`📊 Total pilotos: ${pilots.length}\n`);
    
    // Verificar las primeras 5 pilotos
    console.log('🏁 Primeros 5 pilotos:');
    pilots.slice(0, 5).forEach((pilot, index) => {
      console.log(`${index + 1}. ${pilot.firstName} ${pilot.lastName}`);
      console.log(`   - category: "${pilot.category}"`);
      console.log(`   - category_id: "${pilot.category_id}"`);
      console.log(`   - Tipo category: ${typeof pilot.category}`);
      console.log(`   - Tipo category_id: ${typeof pilot.category_id}`);
      console.log('');
    });
    
    // Obtener categorías únicas de los pilotos
    const pilotCategories = [...new Set(pilots.map(p => p.category))].filter(Boolean);
    console.log('📋 Categorías encontradas en pilotos:');
    pilotCategories.forEach(cat => {
      console.log(`  - "${cat}" (tipo: ${typeof cat})`);
    });
    
    // Obtener categorías de la base de datos
    console.log('\n🗂️ Categorías en la base de datos:');
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    categories.forEach(cat => {
      console.log(`  - "${cat.name}" (ID: ${cat.id})`);
    });
    
    // Verificar si hay pilotos con category_id pero sin category
    console.log('\n⚠️ Pilotos con problemas de categoría:');
    const problematicPilots = pilots.filter(p => 
      (p.category_id && !p.category) || 
      (p.category && p.category.length > 30) // IDs son largos
    );
    
    if (problematicPilots.length > 0) {
      problematicPilots.forEach(pilot => {
        console.log(`  - ${pilot.firstName} ${pilot.lastName}: category="${pilot.category}", category_id="${pilot.category_id}"`);
      });
    } else {
      console.log('  ✅ No se encontraron pilotos con problemas de categoría');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugPilotCategories();