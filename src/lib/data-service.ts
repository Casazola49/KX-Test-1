// Servicio unificado de datos - Reemplaza las llamadas a Supabase
import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { COLLECTIONS } from './firebase-collections';
import type { 
  Pilot, 
  NewsArticle, 
  TrackInfo, 
  RaceEvent, 
  GalleryItem 
} from './firebase-collections';

// Utilidad para convertir timestamps de Firestore recursivamente
function convertTimestamps(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  // Si es un array, procesar cada elemento
  if (Array.isArray(data)) {
    return data.map(item => convertTimestamps(item));
  }
  
  // Crear una copia del objeto
  const converted = { ...data };
  
  // Convertir timestamps conocidos
  if (converted.createdAt?.toDate) converted.createdAt = converted.createdAt.toDate().toISOString();
  if (converted.updatedAt?.toDate) converted.updatedAt = converted.updatedAt.toDate().toISOString();
  if (converted.date?.toDate) converted.date = converted.date.toDate().toISOString();
  if (converted.event_date?.toDate) converted.event_date = converted.event_date.toDate().toISOString();
  
  // Procesar recursivamente todas las propiedades del objeto
  for (const key in converted) {
    if (converted.hasOwnProperty(key) && converted[key] && typeof converted[key] === 'object') {
      // Si la propiedad tiene un método toDate, convertirla
      if (converted[key].toDate && typeof converted[key].toDate === 'function') {
        converted[key] = converted[key].toDate().toISOString();
      } else if (Array.isArray(converted[key])) {
        // Procesar arrays recursivamente
        converted[key] = converted[key].map(item => convertTimestamps(item));
      } else {
        // Procesar recursivamente objetos anidados
        converted[key] = convertTimestamps(converted[key]);
      }
    }
  }
  
  return converted;
}

// PILOTOS
export async function getAllPilots(): Promise<Pilot[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.PILOTS), orderBy('number'))
  );
  const pilots = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
  
  // Los pilotos ya tienen el campo 'category' con el nombre, no necesitamos buscar por category_id
  return pilots;
}

export async function getPilotBySlug(slug: string): Promise<Pilot | null> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.PILOTS), where('slug', '==', slug), limit(1))
  );
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  const pilot = convertTimestamps({ id: doc.id, ...doc.data() });
  
  // Los pilotos ya tienen el campo 'category' con el nombre
  return pilot;
}

export async function getPilotsByCategory(category: string): Promise<Pilot[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.PILOTS), 
      where('category', '==', category),
      orderBy('number')
    )
  );
  
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
}

// NOTICIAS
export async function getAllNews(): Promise<NewsArticle[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.NEWS), orderBy('createdAt', 'desc'))
  );
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
}

export async function getMainNews(): Promise<NewsArticle[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.NEWS), 
      where('isMain', '==', true),
      orderBy('createdAt', 'desc'),
      limit(3)
    )
  );
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.NEWS), where('slug', '==', slug), limit(1))
  );
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return convertTimestamps({ id: doc.id, ...doc.data() });
}

export async function getNewsByCategory(category: string): Promise<NewsArticle[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.NEWS), 
      where('category', '==', category),
      orderBy('date', 'desc')
    )
  );
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
}

// PISTAS
export async function getAllTracks(): Promise<TrackInfo[]> {
  const snapshot = await getDocs(collection(db, COLLECTIONS.TRACKS));
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
}

export async function getTrackByName(name: string): Promise<TrackInfo | null> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.TRACKS), where('name', '==', name), limit(1))
  );
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return convertTimestamps({ id: doc.id, ...doc.data() });
}

// EVENTOS DE CARRERA
export async function getAllRaceEvents(): Promise<RaceEvent[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.RACE_EVENTS), orderBy('round'))
  );
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
}

export async function getUpcomingRaces(): Promise<RaceEvent[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.RACE_EVENTS), 
      where('isUpcoming', '==', true),
      orderBy('date')
    )
  );
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
}

export async function getPastRaces(): Promise<RaceEvent[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.RACE_EVENTS), 
      where('isPast', '==', true),
      orderBy('date', 'desc')
    )
  );
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
}

// GALERÍA
export async function getAllGalleryItems(): Promise<GalleryItem[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTIONS.GALLERY), orderBy('createdAt', 'desc'))
  );
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
}

export async function getGalleryByCategory(category: string): Promise<GalleryItem[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.GALLERY), 
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    )
  );
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
}

export async function getGalleryByType(type: 'image' | 'video'): Promise<GalleryItem[]> {
  // Obtener todos los elementos y filtrar en el cliente para evitar problemas de índices
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTIONS.GALLERY), 
      where('type', '==', type)
      // Removemos orderBy temporalmente hasta crear el índice compuesto
    )
  );
  
  const items = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
  
  // Ordenar en el cliente por createdAt descendente
  return items.sort((a, b) => {
    const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
    const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });
}

export async function getGalleryItemById(id: string): Promise<GalleryItem | null> {
  const docRef = doc(db, COLLECTIONS.GALLERY, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return convertTimestamps({ id: docSnap.id, ...docSnap.data() });
  }
  return null;
}

// OPERACIONES DE ESCRITURA (para admin)
export async function createPilot(pilotData: Omit<Pilot, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.PILOTS), {
      ...pilotData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error creating pilot:', error);
    return { success: false, error: error.message };
  }
}

export async function updatePilot(id: string, pilotData: Partial<Pilot>) {
  try {
    const docRef = doc(db, COLLECTIONS.PILOTS, id);
    await updateDoc(docRef, {
      ...pilotData,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating pilot:', error);
    return { success: false, error: error.message };
  }
}

export async function deletePilot(id: string) {
  try {
    const docRef = doc(db, COLLECTIONS.PILOTS, id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting pilot:', error);
    return { success: false, error: error.message };
  }
}

export async function getPilotById(id: string): Promise<Pilot | null> {
  try {
    const docRef = doc(db, COLLECTIONS.PILOTS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertTimestamps({ id: docSnap.id, ...docSnap.data() });
    }
    return null;
  } catch (error) {
    console.error('Error getting pilot by ID:', error);
    return null;
  }
}

// OPERACIONES DE MECÁNICOS
export async function createMechanic(mechanicData: any) {
  const docRef = await addDoc(collection(db, COLLECTIONS.MECHANICS), {
    ...mechanicData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
}

export async function updateMechanic(id: string, mechanicData: any) {
  const docRef = doc(db, COLLECTIONS.MECHANICS, id);
  await updateDoc(docRef, {
    ...mechanicData,
    updatedAt: Timestamp.now()
  });
}

export async function deleteMechanic(id: string) {
  const docRef = doc(db, COLLECTIONS.MECHANICS, id);
  await deleteDoc(docRef);
}

// OPERACIONES DE PISTAS
export async function createTrack(trackData: any) {
  const docRef = await addDoc(collection(db, COLLECTIONS.TRACKS), {
    ...trackData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
}

export async function updateTrack(id: string, trackData: any) {
  const docRef = doc(db, COLLECTIONS.TRACKS, id);
  await updateDoc(docRef, {
    ...trackData,
    updatedAt: Timestamp.now()
  });
}

export async function deleteTrack(id: string) {
  const docRef = doc(db, COLLECTIONS.TRACKS, id);
  await deleteDoc(docRef);
}

// Funciones similares para otras entidades...
// Funciones de galería para admin
export async function createGalleryItem(galleryData: Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>) {
  const docRef = await addDoc(collection(db, COLLECTIONS.GALLERY), {
    ...galleryData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
}

export async function updateGalleryItem(id: string, galleryData: Partial<GalleryItem>) {
  const docRef = doc(db, COLLECTIONS.GALLERY, id);
  await updateDoc(docRef, {
    ...galleryData,
    updatedAt: Timestamp.now()
  });
}

export async function deleteGalleryItem(id: string) {
  const docRef = doc(db, COLLECTIONS.GALLERY, id);
  await deleteDoc(docRef);
}

// Funciones de Live Stream (versión simplificada eliminada - usar la versión completa al final)

export async function createChatMessage(messageData: { message: string; author: string }) {
  await addDoc(collection(db, 'live_chat_messages'), {
    ...messageData,
    createdAt: Timestamp.now()
  });
}

export async function getChatMessages() {
  const snapshot = await getDocs(
    query(
      collection(db, 'live_chat_messages'),
      orderBy('createdAt', 'asc'),
      limit(50)
    )
  );
  
  return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
}

export async function clearChatMessages() {
  const snapshot = await getDocs(collection(db, 'live_chat_messages'));
  
  const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
}

export async function createNews(newsData: any) {
  const docRef = await addDoc(collection(db, COLLECTIONS.NEWS), {
    ...newsData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
}

export async function updateNews(id: string, newsData: any) {
  const docRef = doc(db, COLLECTIONS.NEWS, id);
  await updateDoc(docRef, {
    ...newsData,
    updatedAt: Timestamp.now()
  });
}

export async function deleteNews(id: string) {
  const docRef = doc(db, COLLECTIONS.NEWS, id);
  await deleteDoc(docRef);
}

// CATEGORÍAS
export async function getAllCategories() {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
}

export async function getCategoryById(categoryId: string) {
  try {
    const docRef = doc(db, COLLECTIONS.CATEGORIES, categoryId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting category:', error);
    return null;
  }
}

// FUNCIÓN PARA OBTENER EVENTO CON PODIUMS COMPLETOS
export async function getEventWithPodiums(eventId: string) {
  try {
    // Obtener el evento (usar 'events' no 'raceevents')
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (!eventDoc.exists()) {
      return null;
    }

    const eventData = convertTimestamps({ id: eventDoc.id, ...eventDoc.data() });

    // Obtener podiums del evento
    const podiumsSnapshot = await getDocs(
      query(
        collection(db, 'podiums'), 
        where('event_id', '==', eventId)
      )
    );

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

      // Obtener resultados del podium
      const resultsSnapshot = await getDocs(
        query(
          collection(db, 'podium_results'),
          where('podium_id', '==', podiumDoc.id),
          orderBy('position')
        )
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

    // Obtener datos de la pista si existe track_id
    if (eventData.track_id) {
      const trackDoc = await getDoc(doc(db, 'tracks', eventData.track_id));
      if (trackDoc.exists()) {
        eventData.track = { id: trackDoc.id, ...trackDoc.data() };
      }
    }

    return {
      ...eventData,
      podiums
    };

  } catch (error) {
    console.error('Error fetching event with podiums:', error);
    return null;
  }
}

// FUNCIÓN PARA OBTENER EVENTOS DE LA TABLA 'events' (no 'raceevents')
export async function getAllEvents() {
  try {
    // Sin orderBy para evitar problemas de índices
    const snapshot = await getDocs(collection(db, 'events'));
    const events = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
    
    // Obtener datos de pistas y podiums para cada evento
    const eventsWithDetails = await Promise.all(
      events.map(async (event) => {
        // Obtener datos de la pista
        if (event.track_id) {
          try {
            const trackDoc = await getDoc(doc(db, 'tracks', event.track_id));
            if (trackDoc.exists()) {
              event.track = { id: trackDoc.id, ...trackDoc.data() };
            }
          } catch (error) {
            console.warn(`Error getting track for event ${event.id}:`, error);
          }
        }
        
        // Obtener podiums del evento
        try {
          const podiumsSnapshot = await getDocs(
            query(collection(db, 'podiums'), where('event_id', '==', event.id))
          );
          
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

            // Obtener resultados del podium
            const resultsSnapshot = await getDocs(
              query(
                collection(db, 'podium_results'),
                where('podium_id', '==', podiumDoc.id),
                orderBy('position')
              )
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
          
          event.podiums = podiums;
        } catch (error) {
          console.warn(`Error getting podiums for event ${event.id}:`, error);
          event.podiums = [];
        }
        
        return event;
      })
    );
    
    // Ordenar manualmente por fecha (más reciente primero)
    return eventsWithDetails.sort((a, b) => {
      const dateA = new Date(a.event_date || 0);
      const dateB = new Date(b.event_date || 0);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error getting events:', error);
    return [];
  }
}

// PISTAS (TRACKS)
export async function getTrackById(trackId: string) {
  try {
    const docRef = doc(db, COLLECTIONS.TRACKS, trackId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertTimestamps({ id: docSnap.id, ...docSnap.data() });
    }
    return null;
  } catch (error) {
    console.error('Error getting track by ID:', error);
    return null;
  }
}

export async function getEventsByTrackId(trackId: string) {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.EVENTS),
        where('track_id', '==', trackId)
      )
    );
    
    const events = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
    
    // Ordenar por fecha (más reciente primero)
    return events.sort((a, b) => {
      const dateA = new Date(a.event_date || 0);
      const dateB = new Date(b.event_date || 0);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Error getting events by track ID:', error);
    return [];
  }
}

// EVENTOS CON PODIUMS - FUNCIONES PARA ADMIN
export async function createEventWithPodiums(eventData: any, podiums: any[]) {
  try {
    // Crear el evento
    const eventRef = await addDoc(collection(db, COLLECTIONS.EVENTS), {
      ...eventData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    const eventId = eventRef.id;
    
    // Crear podiums si existen
    if (podiums && podiums.length > 0) {
      await createPodiumsForEvent(eventId, podiums);
    }
    
    return { success: true, eventId };
  } catch (error: any) {
    console.error('Error creating event with podiums:', error);
    return { success: false, error: error.message || 'Error desconocido al crear el evento' };
  }
}

export async function updateEventWithPodiums(eventId: string, eventData: any, podiums: any[]) {
  try {
    // Actualizar el evento
    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    await updateDoc(eventRef, {
      ...eventData,
      updatedAt: Timestamp.now()
    });
    
    // Eliminar podiums existentes
    await deletePodiumsForEvent(eventId);
    
    // Crear nuevos podiums
    if (podiums && podiums.length > 0) {
      await createPodiumsForEvent(eventId, podiums);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating event with podiums:', error);
    return { success: false, error: error.message || 'Error desconocido al actualizar el evento' };
  }
}

export async function deleteEventWithPodiums(eventId: string) {
  try {
    // Eliminar podiums y resultados
    await deletePodiumsForEvent(eventId);
    
    // Eliminar el evento
    const eventRef = doc(db, COLLECTIONS.EVENTS, eventId);
    await deleteDoc(eventRef);
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting event with podiums:', error);
    return { success: false, error: error.message || 'Error desconocido al eliminar el evento' };
  }
}

// Funciones auxiliares para podiums
async function createPodiumsForEvent(eventId: string, podiums: any[]) {
  for (const podiumData of podiums) {
    // Crear podium
    const podiumRef = await addDoc(collection(db, COLLECTIONS.PODIUMS), {
      event_id: eventId,
      category_id: podiumData.categoryId,
      podium_type: podiumData.podiumType,
      determination_method: podiumData.determinationMethod,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    
    // Crear resultados del podium
    if (podiumData.results && podiumData.results.length > 0) {
      for (const result of podiumData.results) {
        await addDoc(collection(db, COLLECTIONS.PODIUM_RESULTS), {
          podium_id: podiumRef.id,
          pilot_id: result.isGuest ? null : (result.pilotId || null),
          position: result.position,
          result_value: result.resultValue || null,
          guest_name: result.isGuest && result.guestName ? result.guestName : null,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
      }
    }
  }
}

async function deletePodiumsForEvent(eventId: string) {
  // Obtener todos los podiums del evento
  const podiumsSnapshot = await getDocs(
    query(collection(db, COLLECTIONS.PODIUMS), where('event_id', '==', eventId))
  );
  
  // Eliminar resultados de cada podium
  for (const podiumDoc of podiumsSnapshot.docs) {
    const resultsSnapshot = await getDocs(
      query(collection(db, COLLECTIONS.PODIUM_RESULTS), where('podium_id', '==', podiumDoc.id))
    );
    
    // Eliminar todos los resultados
    for (const resultDoc of resultsSnapshot.docs) {
      await deleteDoc(resultDoc.ref);
    }
    
    // Eliminar el podium
    await deleteDoc(podiumDoc.ref);
  }
}

// PRODUCTOS
export async function getAllProducts() {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.PRODUCTS),
        orderBy('createdAt', 'desc')
      )
    );
    return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('slug', '==', slug),
        limit(1)
      )
    );
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return convertTimestamps({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error getting product by slug:', error);
    return null;
  }
}

// MECÁNICOS
export async function getAllMechanics() {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.MECHANICS),
        orderBy('createdAt', 'desc')
      )
    );
    return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting mechanics:', error);
    return [];
  }
}

export async function getMechanicById(id: string) {
  try {
    const docRef = doc(db, COLLECTIONS.MECHANICS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertTimestamps({ id: docSnap.id, ...docSnap.data() });
    }
    return null;
  } catch (error) {
    console.error('Error getting mechanic by ID:', error);
    return null;
  }
}

// KARTS 3D
export async function getAllKarts() {
  try {
    const snapshot = await getDocs(
      query(collection(db, COLLECTIONS.KARTS), orderBy('created_at', 'desc'))
    );
    
    const karts = snapshot.docs.map(doc => {
      const data = doc.data();
      return convertTimestamps({
        id: doc.id,
        ...data
      });
    });
    
    return karts;
  } catch (error) {
    console.error('Error fetching karts:', error);
    return [];
  }
}

export async function getKartById(id: string) {
  try {
    const docRef = doc(db, COLLECTIONS.KARTS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertTimestamps({
        id: docSnap.id,
        ...docSnap.data()
      });
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching kart by ID:', error);
    return null;
  }
}

export async function createKart(kartData: any) {
  try {
    const docRef = doc(collection(db, COLLECTIONS.KARTS));
    const newKart = {
      ...kartData,
      id: docRef.id,
      created_at: Timestamp.now(),
      updated_at: Timestamp.now()
    };
    
    await docRef.set(newKart);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating kart:', error);
    return { success: false, error: error.message };
  }
}

export async function updateKart(id: string, kartData: any) {
  try {
    const docRef = doc(db, COLLECTIONS.KARTS, id);
    const updatedKart = {
      ...kartData,
      updated_at: Timestamp.now()
    };
    
    await updateDoc(docRef, updatedKart);
    return { success: true };
  } catch (error) {
    console.error('Error updating kart:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteKart(id: string) {
  try {
    const docRef = doc(db, COLLECTIONS.KARTS, id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting kart:', error);
    return { success: false, error: error.message };
  }
}

// LIVE STREAM CONFIGURATION
export async function getLiveStreamConfig() {
  try {
    const docRef = doc(db, COLLECTIONS.LIVE_STREAMS, 'main-stream');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertTimestamps({
        id: docSnap.id,
        ...docSnap.data()
      });
    }
    
    // Retornar configuración por defecto si no existe
    return {
      id: 'main-stream',
      is_live: false,
      stream_title: 'Próxima Carrera',
      iframe_url: null
    };
  } catch (error) {
    console.error('Error fetching live stream config:', error);
    return {
      id: 'main-stream',
      is_live: false,
      stream_title: 'Próxima Carrera',
      iframe_url: null
    };
  }
}

export async function updateLiveStreamConfig(configData: any) {
  try {
    const docRef = doc(db, COLLECTIONS.LIVE_STREAMS, 'main-stream');
    const updatedConfig = {
      ...configData,
      updated_at: Timestamp.now()
    };
    
    await updateDoc(docRef, updatedConfig);
    return { success: true };
  } catch (error) {
    console.error('Error updating live stream config:', error);
    return { success: false, error: error.message };
  }
}



// PRODUCTOS - Funciones para productos
export async function createProduct(productData: any) {
  try {
    // Filtrar valores undefined para Firebase
    const cleanData = Object.fromEntries(
      Object.entries(productData).filter(([_, value]) => value !== undefined)
    );
    
    const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTS), {
      ...cleanData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating product:', error);
    return { success: false, error: error.message };
  }
}

export async function updateProduct(id: string, productData: any) {
  try {
    // Filtrar valores undefined para Firebase
    const cleanData = Object.fromEntries(
      Object.entries(productData).filter(([_, value]) => value !== undefined)
    );
    
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
    await updateDoc(docRef, {
      ...cleanData,
      updatedAt: Timestamp.now()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteProduct(id: string) {
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: error.message };
  }
}

// PRODUCTOS - Funciones adicionales
export async function getProductsByCategory(category: string) {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('category', '==', category),
        orderBy('createdAt', 'desc')
      )
    );
    return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting products by category:', error);
    return [];
  }
}

export async function getProductsByDepartment(department: string) {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('department', '==', department),
        orderBy('createdAt', 'desc')
      )
    );
    return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting products by department:', error);
    return [];
  }
}

export async function getFeaturedProducts() {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('is_featured', '==', true),
        orderBy('createdAt', 'desc')
      )
    );
    return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting featured products:', error);
    return [];
  }
}

export async function getProductsByBrand(brand: string) {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.PRODUCTS),
        where('brand', '==', brand),
        orderBy('createdAt', 'desc')
      )
    );
    return snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error getting products by brand:', error);
    return [];
  }
}

export async function searchProducts(searchTerm: string) {
  try {
    // Firebase no tiene búsqueda de texto completo nativa, 
    // así que obtenemos todos los productos y filtramos en el cliente
    const snapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    const allProducts = snapshot.docs.map(doc => convertTimestamps({ id: doc.id, ...doc.data() }));
    
    const searchLower = searchTerm.toLowerCase();
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      product.brand.toLowerCase().includes(searchLower) ||
      product.category.toLowerCase().includes(searchLower) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchLower)))
    );
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

export async function getProductCategories() {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Crear un mapa de categorías con conteo de productos
    const categoryMap = new Map();
    
    products.forEach(product => {
      if (!categoryMap.has(product.category)) {
        categoryMap.set(product.category, {
          name: product.category,
          count: 0,
          subcategories: new Set()
        });
      }
      
      const category = categoryMap.get(product.category);
      category.count++;
      
      if (product.subcategory) {
        category.subcategories.add(product.subcategory);
      }
    });
    
    // Convertir a array y formatear subcategorías
    return Array.from(categoryMap.entries()).map(([name, data]) => ({
      name,
      count: data.count,
      subcategories: Array.from(data.subcategories)
    }));
  } catch (error) {
    console.error('Error getting product categories:', error);
    return [];
  }
}

export async function getProductById(id: string) {
  try {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertTimestamps({ id: docSnap.id, ...docSnap.data() });
    }
    return null;
  } catch (error) {
    console.error('Error getting product by ID:', error);
    return null;
  }
}

