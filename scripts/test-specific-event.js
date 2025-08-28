// Script para probar un evento específico con podiums
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where, doc, getDoc } = require('firebase/firestore');

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

async function testSpecificEvent() {
  try {
    console.log('🔍 Buscando eventos con podiums...\n');

    // 1. Obtener todos los eventos
    const eventsSnapshot = await getDocs(collection(db, 'events'));
    console.log(`📅 Total de eventos: ${eventsSnapshot.size}`);

    // 2. Obtener todos los podiums
    const podiumsSnapshot = await getDocs(collection(db, 'podiums'));
    console.log(`🏆 Total de podiums: ${podiumsSnapshot.size}`);

    if (podiumsSnapshot.size > 0) {
      // 3. Encontrar un evento que tenga podiums
      const firstPodium = podiumsSnapshot.docs[0];
      const podiumData = { id: firstPodium.id, ...firstPodium.data() };
      const eventId = podiumData.event_id;
      
      console.log(`\n🎯 Probando evento ID: ${eventId}`);
      console.log(`🏆 Podium ID: ${podiumData.id}`);
      console.log(`📂 Tipo de podium: ${podiumData.podium_type}`);

      // 4. Obtener el evento completo
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      if (eventDoc.exists()) {
        const eventData = { id: eventDoc.id, ...eventDoc.data() };
        console.log(`📋 Evento: "${eventData.name}"`);
        console.log(`📅 Fecha: ${eventData.event_date}`);

        // 5. Obtener todos los podiums de este evento
        const eventPodiumsSnapshot = await getDocs(
          query(collection(db, 'podiums'), where('event_id', '==', eventId))
        );
        console.log(`🏆 Podiums para este evento: ${eventPodiumsSnapshot.size}`);

        // 6. Probar la función getEventWithPodiums
        console.log('\n🔧 Probando función getEventWithPodiums...');
        const result = await getEventWithPodiums(eventId);
        
        if (result) {
          console.log(`✅ Función exitosa`);
          console.log(`📋 Evento: ${result.name}`);
          console.log(`🏆 Podiums retornados: ${result.podiums ? result.podiums.length : 0}`);
          console.log(`📊 Podiums es array: ${Array.isArray(result.podiums)}`);
          
          if (result.podiums && result.podiums.length > 0) {
            const firstPodium = result.podiums[0];
            console.log(`🥇 Primer podium: ${firstPodium.podium_type}`);
            console.log(`📂 Categoría: ${firstPodium.category ? firstPodium.category.name : 'Sin categoría'}`);
            console.log(`🏁 Resultados: ${firstPodium.results ? firstPodium.results.length : 0}`);
          }
        } else {
          console.log('❌ Función retornó null');
        }

        console.log(`\n🌐 URL para probar: http://localhost:9008/calendario/${eventId}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Función getEventWithPodiums (copiada de data-service.ts)
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

testSpecificEvent();