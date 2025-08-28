const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');
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

async function checkPodiumsDetail() {
  try {
    console.log('🏆 Verificando podiums en detalle...\n');
    
    const podiumsSnapshot = await getDocs(collection(db, 'podiums'));
    console.log(`Total podiums: ${podiumsSnapshot.size}\n`);
    
    const eventIds = new Set();
    
    podiumsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`Podium ID: ${doc.id}`);
      console.log(`  Event ID: ${data.event_id}`);
      console.log(`  Category ID: ${data.category_id}`);
      console.log(`  Type: ${data.podium_type}`);
      console.log(`  Method: ${data.determination_method}\n`);
      
      eventIds.add(data.event_id);
    });
    
    console.log(`Eventos con podiums: ${eventIds.size}`);
    console.log('Event IDs:', Array.from(eventIds));
    
    // Verificar si estos eventos existen
    console.log('\n🏁 Verificando si los eventos existen...');
    const eventsSnapshot = await getDocs(collection(db, 'events'));
    const existingEventIds = new Set();
    
    eventsSnapshot.forEach(doc => {
      existingEventIds.add(doc.id);
    });
    
    eventIds.forEach(eventId => {
      if (existingEventIds.has(eventId)) {
        console.log(`✅ Evento ${eventId} existe`);
      } else {
        console.log(`❌ Evento ${eventId} NO existe`);
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkPodiumsDetail();