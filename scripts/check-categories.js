const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');
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

async function checkCategories() {
  try {
    console.log('🔍 Verificando categorías en Firebase...\n');
    
    // Obtener todas las categorías
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    console.log(`📊 Total de categorías: ${categoriesSnapshot.size}`);
    
    const categories = [];
    categoriesSnapshot.forEach(doc => {
      const data = { id: doc.id, ...doc.data() };
      categories.push(data);
      console.log(`  - ${data.name} (ID: ${data.id})`);
    });
    
    console.log('\n🏁 Verificando pilotos y sus categorías...\n');
    
    // Obtener todos los pilotos
    const pilotsSnapshot = await getDocs(collection(db, 'pilots'));
    console.log(`👨‍🏁 Total de pilotos: ${pilotsSnapshot.size}`);
    
    const pilotCategories = new Set();
    
    for (const pilotDoc of pilotsSnapshot.docs) {
      const pilotData = { id: pilotDoc.id, ...pilotDoc.data() };
      
      console.log(`\n👤 Piloto: ${pilotData.firstName} ${pilotData.lastName}`);
      console.log(`   - category: ${pilotData.category || 'No definida'}`);
      console.log(`   - category_id: ${pilotData.category_id || 'No definida'}`);
      
      if (pilotData.category_id) {
        // Verificar si la categoría existe
        const categoryDoc = await getDoc(doc(db, 'categories', pilotData.category_id));
        if (categoryDoc.exists()) {
          const categoryData = categoryDoc.data();
          console.log(`   - Categoría encontrada: ${categoryData.name}`);
          pilotCategories.add(categoryData.name);
        } else {
          console.log(`   - ⚠️  Categoría no encontrada para ID: ${pilotData.category_id}`);
        }
      }
      
      if (pilotData.category) {
        pilotCategories.add(pilotData.category);
      }
    }
    
    console.log('\n📋 Resumen de categorías encontradas en pilotos:');
    Array.from(pilotCategories).sort().forEach(cat => {
      console.log(`  - ${cat}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkCategories();