const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
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

async function quickCheck() {
  try {
    console.log('Verificando categorías...');
    
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    console.log(`Categorías encontradas: ${categoriesSnapshot.size}`);
    
    categoriesSnapshot.forEach(doc => {
      console.log(`- ${doc.data().name} (${doc.id})`);
    });
    
    console.log('\nVerificando pilotos...');
    const pilotsSnapshot = await getDocs(collection(db, 'pilots'));
    console.log(`Pilotos encontrados: ${pilotsSnapshot.size}`);
    
    let pilotCount = 0;
    pilotsSnapshot.forEach(doc => {
      if (pilotCount < 3) { // Solo mostrar los primeros 3
        const data = doc.data();
        console.log(`- ${data.firstName} ${data.lastName}: category="${data.category}", category_id="${data.category_id}"`);
        pilotCount++;
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

quickCheck();