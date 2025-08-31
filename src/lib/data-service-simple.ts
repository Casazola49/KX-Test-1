// Versión simplificada sin índices complejos
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where
} from 'firebase/firestore';

// Función simplificada que no requiere índices
export async function getEventWithPodiumsSimple(eventId: string) {
  try {
    console.log('🔍 Getting event:', eventId);
    
    // 1. Obtener el evento
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (!eventDoc.exists()) {
      console.log('❌ Event not found');
      return null;
    }

    const eventData = { id: eventDoc.id, ...eventDoc.data() };
    console.log('✅ Event found:', eventData.name);

    // 2. Obtener todos los podiums (sin orderBy para evitar índices)
    const podiumsSnapshot = await getDocs(
      query(collection(db, 'podiums'), where('event_id', '==', eventId))
    );

    console.log(`🏆 Found ${podiumsSnapshot.size} podiums`);

    const podiums = [];
    for (const podiumDoc of podiumsSnapshot.docs) {
      const podiumData = { id: podiumDoc.id, ...podiumDoc.data() };
      
      // 3. Obtener categoría si existe
      if (podiumData.category_id) {
        try {
          const categoryDoc = await getDoc(doc(db, 'categories', podiumData.category_id));
          if (categoryDoc.exists()) {
            podiumData.category = categoryDoc.data();
          }
        } catch (error) {
          console.warn('Error getting category:', error);
        }
      }

      // 4. Obtener resultados (sin orderBy)
      const resultsSnapshot = await getDocs(
        query(collection(db, 'podium_results'), where('podium_id', '==', podiumDoc.id))
      );

      const results = [];
      for (const resultDoc of resultsSnapshot.docs) {
        const resultData = { id: resultDoc.id, ...resultDoc.data() };
        
        // 5. Obtener piloto si existe
        if (resultData.pilot_id) {
          try {
            const pilotDoc = await getDoc(doc(db, 'pilots', resultData.pilot_id));
            if (pilotDoc.exists()) {
              resultData.pilot = { id: pilotDoc.id, ...pilotDoc.data() };
            }
          } catch (error) {
            console.warn('Error getting pilot:', error);
          }
        }
        
        results.push(resultData);
      }

      // Ordenar resultados por posición manualmente
      results.sort((a, b) => (a.position || 0) - (b.position || 0));
      podiumData.results = results;
      podiums.push(podiumData);
    }

    // 6. Obtener track si existe
    if (eventData.track_id) {
      try {
        const trackDoc = await getDoc(doc(db, 'tracks', eventData.track_id));
        if (trackDoc.exists()) {
          eventData.track = { id: trackDoc.id, ...trackDoc.data() };
        }
      } catch (error) {
        console.warn('Error getting track:', error);
      }
    }

    console.log(`✅ Returning event with ${podiums.length} podiums`);
    return {
      ...eventData,
      podiums
    };

  } catch (error) {
    console.error('❌ Error in getEventWithPodiumsSimple:', error);
    return null;
  }
}