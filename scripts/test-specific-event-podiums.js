const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, orderBy, doc, getDoc } = require('firebase/firestore');
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

async function testSpecificEventPodiums() {
  try {
    const eventId = '4442350b-4cb5-4af5-878b-cac38f84835d';
    
    console.log('🏁 Probando evento específico con podiums...\n');
    
    // Obtener el evento
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    const event = { id: eventDoc.id, ...eventDoc.data() };
    
    console.log(`Evento: ${event.name}`);
    
    // Obtener podiums del evento
    const podiumsSnapshot = await getDocs(
      query(collection(db, 'podiums'), where('event_id', '==', eventId))
    );
    
    console.log(`\n🏆 Podiums encontrados: ${podiumsSnapshot.size}`);
    
    const podiums = [];
    for (const podiumDoc of podiumsSnapshot.docs) {
      const podiumData = { id: podiumDoc.id, ...podiumDoc.data() };
      
      console.log(`\n📊 Podium: ${podiumData.podium_type}`);
      console.log(`   Category ID: ${podiumData.category_id}`);
      
      // Obtener categoría
      if (podiumData.category_id) {
        const categoryDoc = await getDoc(doc(db, 'categories', podiumData.category_id));
        if (categoryDoc.exists()) {
          podiumData.category = { id: categoryDoc.id, ...categoryDoc.data() };
          console.log(`   ✅ Categoría: ${podiumData.category.name}`);
        }
      }

      // Obtener resultados del podium
      const resultsSnapshot = await getDocs(
        query(
          collection(db, 'podium_results'),
          where('podium_id', '==', podiumDoc.id),
          orderBy('position')
        )
      );

      console.log(`   📈 Resultados: ${resultsSnapshot.size}`);
      
      const results = [];
      for (const resultDoc of resultsSnapshot.docs) {
        const resultData = { id: resultDoc.id, ...resultDoc.data() };
        
        console.log(`     Posición ${resultData.position}: Pilot ID ${resultData.pilot_id}`);
        
        // Obtener datos del piloto
        if (resultData.pilot_id) {
          const pilotDoc = await getDoc(doc(db, 'pilots', resultData.pilot_id));
          if (pilotDoc.exists()) {
            resultData.pilot = { id: pilotDoc.id, ...pilotDoc.data() };
            console.log(`       ✅ Piloto: ${resultData.pilot.firstName} ${resultData.pilot.lastName}`);
          }
        }
        
        results.push(resultData);
      }

      podiumData.results = results;
      podiums.push(podiumData);
    }
    
    event.podiums = podiums;
    
    console.log(`\n📋 Resumen final:`);
    console.log(`Evento: ${event.name}`);
    console.log(`Podiums: ${event.podiums.length}`);
    event.podiums.forEach(podium => {
      console.log(`  - ${podium.category?.name || 'Sin categoría'}: ${podium.results.length} resultados`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testSpecificEventPodiums();