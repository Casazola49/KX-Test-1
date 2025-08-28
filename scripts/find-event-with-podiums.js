const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, doc, getDoc } = require('firebase/firestore');
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

async function findEventWithPodiums() {
  try {
    console.log('🔍 Buscando el evento con podiums...\n');
    
    const eventId = '4442350b-4cb5-4af5-878b-cac38f84835d';
    
    // Buscar el evento específico
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    
    if (eventDoc.exists()) {
      const eventData = { id: eventDoc.id, ...eventDoc.data() };
      console.log(`✅ Evento encontrado: ${eventData.name}`);
      console.log(`   Fecha: ${eventData.event_date}`);
      console.log(`   Track ID: ${eventData.track_id}`);
      
      // Verificar podiums
      const podiumsSnapshot = await getDocs(
        query(collection(db, 'podiums'), where('event_id', '==', eventId))
      );
      
      console.log(`\n🏆 Podiums: ${podiumsSnapshot.size}`);
      
      podiumsSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`  - ${data.podium_type} (Category: ${data.category_id})`);
      });
      
    } else {
      console.log('❌ Evento no encontrado');
    }
    
    // Verificar todos los eventos para ver cuáles existen
    console.log('\n📋 Todos los eventos:');
    const eventsSnapshot = await getDocs(collection(db, 'events'));
    eventsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  - ${data.name} (${doc.id})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

findEventWithPodiums();