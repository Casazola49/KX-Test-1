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

async function checkEventsPodiums() {
  try {
    console.log('🏁 Verificando eventos...');
    
    const eventsSnapshot = await getDocs(collection(db, 'events'));
    console.log(`Eventos encontrados: ${eventsSnapshot.size}`);
    
    if (eventsSnapshot.size > 0) {
      const firstEvent = eventsSnapshot.docs[0];
      const eventData = { id: firstEvent.id, ...firstEvent.data() };
      console.log(`\nPrimer evento: ${eventData.name} (${eventData.id})`);
      
      // Verificar podiums para este evento
      console.log('\n🏆 Verificando podiums...');
      const podiumsSnapshot = await getDocs(
        query(collection(db, 'podiums'), where('event_id', '==', eventData.id))
      );
      console.log(`Podiums para este evento: ${podiumsSnapshot.size}`);
      
      podiumsSnapshot.forEach(doc => {
        const podiumData = doc.data();
        console.log(`- Podium: ${podiumData.podium_type} (Category ID: ${podiumData.category_id})`);
      });
      
      // Verificar resultados de podiums
      if (podiumsSnapshot.size > 0) {
        const firstPodium = podiumsSnapshot.docs[0];
        console.log(`\n🥇 Verificando resultados del primer podium...`);
        const resultsSnapshot = await getDocs(
          query(collection(db, 'podium_results'), where('podium_id', '==', firstPodium.id))
        );
        console.log(`Resultados encontrados: ${resultsSnapshot.size}`);
        
        resultsSnapshot.forEach(doc => {
          const resultData = doc.data();
          console.log(`- Posición ${resultData.position}: Pilot ID ${resultData.pilot_id}`);
        });
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkEventsPodiums();