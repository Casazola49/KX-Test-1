const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
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

async function fixPilotCategories() {
  try {
    console.log('🔧 Arreglando categorías de pilotos...\n');
    
    // Obtener todas las categorías primero
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const categoryMap = {};
    
    categoriesSnapshot.forEach(doc => {
      const data = doc.data();
      categoryMap[doc.id] = data.name;
    });
    
    console.log('📋 Mapa de categorías creado:');
    Object.entries(categoryMap).forEach(([id, name]) => {
      console.log(`  ${id} -> ${name}`);
    });
    
    // Obtener todos los pilotos
    const pilotsSnapshot = await getDocs(collection(db, 'pilots'));
    const pilotsToUpdate = [];
    
    pilotsSnapshot.forEach(doc => {
      const pilot = { id: doc.id, ...doc.data() };
      
      // Si el campo category contiene un ID (es largo y está en el mapa)
      if (pilot.category && pilot.category.length > 30 && categoryMap[pilot.category]) {
        pilotsToUpdate.push({
          id: pilot.id,
          name: `${pilot.firstName} ${pilot.lastName}`,
          currentCategory: pilot.category,
          newCategory: categoryMap[pilot.category]
        });
      }
    });
    
    console.log(`\n🔄 Pilotos a actualizar: ${pilotsToUpdate.length}`);
    
    if (pilotsToUpdate.length === 0) {
      console.log('✅ No hay pilotos que necesiten actualización');
      process.exit(0);
    }
    
    // Actualizar cada piloto
    for (const pilot of pilotsToUpdate) {
      console.log(`Actualizando ${pilot.name}: "${pilot.currentCategory}" -> "${pilot.newCategory}"`);
      
      try {
        await updateDoc(doc(db, 'pilots', pilot.id), {
          category: pilot.newCategory,
          category_id: pilot.currentCategory // Guardar el ID original por si acaso
        });
        console.log(`  ✅ Actualizado`);
      } catch (error) {
        console.log(`  ❌ Error: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Proceso completado!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixPilotCategories();