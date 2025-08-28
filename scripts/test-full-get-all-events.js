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

async function testFullGetAllEvents() {
  try {
    console.log('🏁 Simulando getAllEvents completa...\n');
    
    // Sin orderBy para evitar problemas de índices
    const snapshot = await getDocs(collection(db, 'events'));
    const events = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
    
    console.log(`Total eventos: ${events.length}`);
    
    // Mostrar todos los eventos con sus fechas
    console.log('\n📅 Eventos por fecha:');
    events.forEach(event => {
      console.log(`- ${event.name}: ${event.event_date} (${event.id})`);
    });
    
    // Obtener datos de pistas y podiums para cada evento
    const eventsWithDetails = await Promise.all(
      events.map(async (event) => {
        console.log(`\n🔄 Procesando: ${event.name}`);
        
        // Obtener datos de la pista
        if (event.track_id) {
          try {
            const trackDoc = await getDoc(doc(db, 'tracks', event.track_id));
            if (trackDoc.exists()) {
              event.track = { id: trackDoc.id, ...trackDoc.data() };
            }
          } catch (error) {
            console.warn(`  ⚠️ Error getting track:`, error.message);
          }
        }
        
        // Obtener podiums del evento
        try {
          const podiumsSnapshot = await getDocs(
            query(collection(db, 'podiums'), where('event_id', '==', event.id))
          );
          
          console.log(`  📊 Podiums: ${podiumsSnapshot.size}`);
          
          const podiums = [];
          for (const podiumDoc of podiumsSnapshot.docs) {
            const podiumData = { id: podiumDoc.id, ...podiumDoc.data() };
            
            // Obtener categoría
            if (podiumData.category_id) {
              const categoryDoc = await getDoc(doc(db, 'categories', podiumData.category_id));
              if (categoryDoc.exists()) {
                podiumData.category = { id: categoryDoc.id, ...categoryDoc.data() };
              }
            }

            // Obtener resultados del podium (solo contar)
            const resultsSnapshot = await getDocs(
              query(
                collection(db, 'podium_results'),
                where('podium_id', '==', podiumDoc.id)
              )
            );

            podiumData.results = resultsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            podiums.push(podiumData);
          }
          
          event.podiums = podiums;
        } catch (error) {
          console.warn(`  ⚠️ Error getting podiums:`, error.message);
          event.podiums = [];
        }
        
        return event;
      })
    );
    
    // Ordenar manualmente por fecha (más reciente primero)
    const sortedEvents = eventsWithDetails.sort((a, b) => {
      const dateA = new Date(a.event_date || 0);
      const dateB = new Date(b.event_date || 0);
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log('\n📋 Eventos ordenados (más reciente primero):');
    sortedEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.name} (${event.event_date}) - ${event.podiums?.length || 0} podiums`);
    });
    
    // Verificar si el evento con podiums está en la lista
    const eventWithPodiums = sortedEvents.find(e => e.podiums && e.podiums.length > 0);
    if (eventWithPodiums) {
      console.log(`\n✅ Evento con podiums encontrado: ${eventWithPodiums.name}`);
      console.log(`   Posición en la lista: ${sortedEvents.indexOf(eventWithPodiums) + 1}`);
      console.log(`   Podiums: ${eventWithPodiums.podiums.length}`);
    } else {
      console.log('\n❌ No se encontró ningún evento con podiums');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testFullGetAllEvents();