// Servicio de datos optimizado para la página de inicio
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  where
} from 'firebase/firestore';
import { COLLECTIONS } from './firebase-collections';

// Utilidad para convertir timestamps de Firestore
function convertTimestamps(data: any): any {
  if (!data || typeof data !== 'object') return data;
  
  if (Array.isArray(data)) {
    return data.map(item => convertTimestamps(item));
  }
  
  const converted = { ...data };
  
  // Convertir timestamps conocidos
  if (converted.createdAt?.toDate) converted.createdAt = converted.createdAt.toDate().toISOString();
  if (converted.updatedAt?.toDate) converted.updatedAt = converted.updatedAt.toDate().toISOString();
  if (converted.date?.toDate) converted.date = converted.date.toDate().toISOString();
  if (converted.event_date?.toDate) converted.event_date = converted.event_date.toDate().toISOString();
  
  for (const key in converted) {
    if (converted.hasOwnProperty(key) && converted[key] && typeof converted[key] === 'object') {
      if (converted[key].toDate && typeof converted[key].toDate === 'function') {
        converted[key] = converted[key].toDate().toISOString();
      } else if (Array.isArray(converted[key])) {
        converted[key] = converted[key].map(item => convertTimestamps(item));
      } else {
        converted[key] = convertTimestamps(converted[key]);
      }
    }
  }
  
  return converted;
}

// Obtener eventos optimizado (solo campos necesarios)
export async function getOptimizedEvents() {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.EVENTS), 
        orderBy('event_date', 'desc'),
        limit(10) // Limitar a 10 eventos más recientes
      )
    );
    
    return snapshot.docs.map(doc => convertTimestamps({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    return [];
  }
}

// Obtener noticias optimizado (solo campos necesarios)
export async function getOptimizedNews() {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.NEWS), 
        orderBy('createdAt', 'desc'),
        limit(6) // Solo 6 noticias para la página de inicio
      )
    );
    
    return snapshot.docs.map(doc => convertTimestamps({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    return [];
  }
}

// Obtener productos destacados optimizado
export async function getOptimizedFeaturedProducts() {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.PRODUCTS), 
        where('is_featured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(6) // Solo 6 productos destacados
      )
    );
    
    return snapshot.docs.map(doc => convertTimestamps({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    return [];
  }
}

// Obtener galería optimizada
export async function getOptimizedGallery() {
  try {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTIONS.GALLERY), 
        where('type', '==', 'image'),
        orderBy('createdAt', 'desc'),
        limit(6) // Solo 6 imágenes para la página de inicio
      )
    );
    
    return snapshot.docs.map(doc => convertTimestamps({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    return [];
  }
}

// Función combinada para cargar todos los datos de la página de inicio en paralelo
export async function getHomePageDataOptimized() {
  try {
    const [events, news, products, gallery] = await Promise.allSettled([
      getOptimizedEvents(),
      getOptimizedNews(),
      getOptimizedFeaturedProducts(),
      getOptimizedGallery()
    ]);

    return {
      events: events.status === 'fulfilled' ? events.value : [],
      news: news.status === 'fulfilled' ? news.value : [],
      products: products.status === 'fulfilled' ? products.value : [],
      gallery: gallery.status === 'fulfilled' ? gallery.value : []
    };
  } catch (error) {
    return {
      events: [],
      news: [],
      products: [],
      gallery: []
    };
  }
}