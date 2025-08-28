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

// Función convertTimestamps simplificada
function convertTimestamps(data) {
  if (data.createdAt?.toDate) data.createdAt = data.createdAt.toDate();
  if (data.updatedAt?.toDate) data.updatedAt = data.updatedAt.toDate();
  if (data.date?.toDate) data.date = data.date.toDate();
  return data;
}

async function testGetAllEvents() {
  try {
    console.log('🏁 Probando getAllEvents...\n');
    
    // Sin orderBy para evitar problemas de índices
    const snapshot = await getDocs(collection(db, 'events'));
    const events = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
    
    console.log(`Eventos encontrados: ${events.length}`);
    
    // Obtener datos de pistas y podiums para cada evento
    const eventsWithDetails = await Promise.all(
      events.slice(0, 2).map(async (event) => { // Solo los primeros 2 para prueba
        console.log(`\nProcesando evento: ${event.name} (${event.id})`);
        
        // Obtener datos de la pista
        if (event.track_id) {
          try {
            const trackDoc = await getDoc(doc(db, 'tracks', event.track_id));
            if (trackDoc.exists()) {
              event.track = { id: trackDoc.id, ...trackDoc.data() };
              console.log(`  ✅ Pista: ${event.track.name}`);
            }
          } catch (error) {
            console.warn(`  ⚠️ Error getting track for event ${event.id}:`, error.message);
          }
        }
        
        // Obtener podiums del evento
        try {
          const podiumsSnapshot = await getDocs(
            query(collection(db, 'podiums'), where('event_id', '==', event.id))
          );
          
          console.log(`  📊 Podiums encontrados: ${podiumsSnapshot.size}`);
          
          const podiums = [];
          for (const podiumDoc of podiumsSnapshot.docs) {
            const podiumData = { id: podiumDoc.id, ...podiumDoc.data() };
            console.log(`    - Podium: ${podiumData.podium_type} (Category: ${podiumData.category_id})`);
            
            // Obtener categoría
            if (podiumData.category_id) {
              const categoryDoc = await getDoc(doc(db, 'categories', podiumData.category_id));
              if (categoryDoc.exists()) {
                podiumData.category = { id: categoryDoc.id, ...categoryDoc.data() };
                console.log(`      ✅ Categoría: ${podiumData.category.name}`);
              }
            }

            // Obtener resultados del podium (solo contar)
            const resultsSnapshot = await getDocs(
              query(
                collection(db, 'podium_results'),
                where('podium_id', '==', podiumDoc.id)
              )
            );
            
            console.log(`      📈 Resultados: ${resultsSnapshot.size}`);
            podiumData.results = resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            podiums.push(podiumData);
          }
          
          event.podiums = podiums;
        } catch (error) {
          console.warn(`  ⚠️ Error getting podiums for event ${event.id}:`, error.message);
          event.podiums = [];
        }
        
        return event;
      })
    );
    
    console.log('\n📋 Resumen:');
    eventsWithDetails.forEach(event => {
      console.log(`- ${event.name}: ${event.podiums?.length || 0} podiums`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testGetAllEvents();