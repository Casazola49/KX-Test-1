// Script para probar que los podiums funcionan correctamente
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, doc, getDoc } = require('firebase/firestore');

// Configuración de Firebase
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

async function testPodiumsData() {
  try {
    console.log('🧪 Probando datos de podiums en Firebase...\n');

    // 1. Verificar eventos
    console.log('📅 Verificando eventos...');
    const eventsSnapshot = await getDocs(collection(db, 'events'));
    console.log(`   ✅ Encontrados ${eventsSnapshot.size} eventos`);
    
    if (eventsSnapshot.size > 0) {
      const firstEvent = eventsSnapshot.docs[0];
      const eventData = { id: firstEvent.id, ...firstEvent.data() };
      console.log(`   📋 Primer evento: "${eventData.name}" (ID: ${eventData.id})`);

      // 2. Verificar podiums para este evento
      console.log('\n🏆 Verificando podiums...');
      const podiumsSnapshot = await getDocs(
        query(collection(db, 'podiums'), where('event_id', '==', eventData.id))
      );
      console.log(`   ✅ Encontrados ${podiumsSnapshot.size} podiums para este evento`);

      if (podiumsSnapshot.size > 0) {
        const firstPodium = podiumsSnapshot.docs[0];
        const podiumData = { id: firstPodium.id, ...firstPodium.data() };
        console.log(`   🏆 Primer podium: ${podiumData.podium_type} (ID: ${podiumData.id})`);

        // 3. Verificar resultados del podium
        console.log('\n🥇 Verificando resultados del podium...');
        const resultsSnapshot = await getDocs(
          query(collection(db, 'podium_results'), where('podium_id', '==', podiumData.id))
        );
        console.log(`   ✅ Encontrados ${resultsSnapshot.size} resultados para este podium`);

        // 4. Verificar categoría
        if (podiumData.category_id) {
          console.log('\n📂 Verificando categoría...');
          const categoryDoc = await getDoc(doc(db, 'categories', podiumData.category_id));
          if (categoryDoc.exists()) {
            const categoryData = categoryDoc.data();
            console.log(`   ✅ Categoría: "${categoryData.name}"`);
          }
        }

        // 5. Probar la función getEventWithPodiums simulada
        console.log('\n🔧 Probando función getEventWithPodiums...');
        const eventWithPodiums = await getEventWithPodiums(eventData.id);
        if (eventWithPodiums && eventWithPodiums.podiums) {
          console.log(`   ✅ Función retorna ${eventWithPodiums.podiums.length} podiums`);
          console.log(`   📋 Podiums son array: ${Array.isArray(eventWithPodiums.podiums)}`);
        } else {
          console.log('   ❌ Función no retorna podiums válidos');
        }
      }
    }

    console.log('\n🎉 ¡Prueba completada exitosamente!');
    console.log('\n📋 Próximo paso: Probar en el navegador');
    console.log('   1. Ejecuta: npm run dev');
    console.log('   2. Ve a: http://localhost:9008/calendario');
    console.log('   3. Haz clic en cualquier evento para ver los podiums');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Función simulada de getEventWithPodiums
async function getEventWithPodiums(eventId) {
  try {
    // Obtener el evento
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (!eventDoc.exists()) {
      return null;
    }

    const eventData = { id: eventDoc.id, ...eventDoc.data() };

    // Obtener podiums del evento
    const podiumsSnapshot = await getDocs(
      query(collection(db, 'podiums'), where('event_id', '==', eventId))
    );

    const podiums = [];
    for (const podiumDoc of podiumsSnapshot.docs) {
      const podiumData = { id: podiumDoc.id, ...podiumDoc.data() };
      
      // Obtener categoría
      if (podiumData.category_id) {
        const categoryDoc = await getDoc(doc(db, 'categories', podiumData.category_id));
        if (categoryDoc.exists()) {
          podiumData.category = categoryDoc.data();
        }
      }

      // Obtener resultados del podium
      const resultsSnapshot = await getDocs(
        query(collection(db, 'podium_results'), where('podium_id', '==', podiumDoc.id))
      );

      const results = [];
      for (const resultDoc of resultsSnapshot.docs) {
        const resultData = { id: resultDoc.id, ...resultDoc.data() };
        
        // Obtener datos del piloto
        if (resultData.pilot_id) {
          const pilotDoc = await getDoc(doc(db, 'pilots', resultData.pilot_id));
          if (pilotDoc.exists()) {
            resultData.pilot = { id: pilotDoc.id, ...pilotDoc.data() };
          }
        }
        
        results.push(resultData);
      }

      podiumData.results = results;
      podiums.push(podiumData);
    }

    return {
      ...eventData,
      podiums
    };

  } catch (error) {
    console.error('Error en getEventWithPodiums:', error);
    return null;
  }
}

testPodiumsData();