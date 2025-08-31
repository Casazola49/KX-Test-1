// Seeding para Firebase - Reemplaza el seeding de Supabase
import { db } from './firebase';
import { collection, doc, writeBatch, deleteDoc, getDocs } from 'firebase/firestore';
import { COLLECTIONS } from './firebase-collections';
import { pilotData, newsData, trackData, raceEventsData, galleryData, qualifyingData, rankingsData, auspiciosData } from './mock-data-seeding';

export async function seedFirebaseDatabase() {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error("Seeding is only available in development environment.");
  }

  console.log('🚀 Iniciando seeding de Firebase...');

  // Orden de las colecciones para seeding
  const collectionsToSeed = [
    { name: COLLECTIONS.GALLERY, data: galleryData },
    { name: COLLECTIONS.PILOTS, data: pilotData.map(p => ({
      ...p,
      name: `${p.firstName} ${p.lastName}`.trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    })) },
    { name: COLLECTIONS.NEWS, data: newsData.map(n => ({
      ...n,
      date: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    })) },
    { name: COLLECTIONS.TRACKS, data: trackData.map(t => ({
      ...t,
      id: crypto.randomUUID(),
      country: 'bo',
      countryFlagUrl: '/flags/bo.svg',
      gallery_image_urls: [],
      createdAt: new Date(),
      updatedAt: new Date()
    })) },
    { name: COLLECTIONS.RACE_EVENTS, data: raceEventsData.map(r => ({
      ...r,
      id: crypto.randomUUID(),
      date: new Date(),
      isUpcoming: true,
      isPast: false,
      trackLayoutUrl: '',
      createdAt: new Date(),
      updatedAt: new Date()
    })) },
    { name: COLLECTIONS.QUALIFYING_RESULTS, data: qualifyingData },
    { name: COLLECTIONS.RANKINGS, data: rankingsData },
    { name: COLLECTIONS.AUSPICIOS, data: auspiciosData },
  ];

  try {
    // 1. Limpiar datos existentes
    console.log('🧹 Limpiando datos existentes...');
    for (const { name } of collectionsToSeed) {
      await clearCollection(name);
    }

    // 2. Insertar nuevos datos
    console.log('📝 Insertando nuevos datos...');
    for (const { name, data } of collectionsToSeed) {
      if (data && data.length > 0) {
        await seedCollection(name, data);
        console.log(`✅ ${name}: ${data.length} documentos insertados`);
      } else {
        console.log(`⚠️ ${name}: Sin datos para insertar`);
      }
    }

    console.log('🎉 Seeding completado exitosamente!');
    return { success: true, message: 'Database seeded successfully!' };

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    throw error;
  }
}

// Limpiar una colección
async function clearCollection(collectionName: string) {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);
  
  if (snapshot.empty) {
    console.log(`📭 ${collectionName} ya está vacía`);
    return;
  }

  const batch = writeBatch(db);
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`🗑️ ${collectionName}: ${snapshot.size} documentos eliminados`);
}

// Insertar datos en una colección
async function seedCollection(collectionName: string, data: any[]) {
  const collectionRef = collection(db, collectionName);
  
  // Firebase tiene límite de 500 operaciones por batch
  const batchSize = 500;
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = writeBatch(db);
    const batchData = data.slice(i, i + batchSize);
    
    batchData.forEach((item) => {
      const docRef = doc(collectionRef, item.id || crypto.randomUUID());
      batch.set(docRef, {
        ...item,
        createdAt: item.createdAt || new Date(),
        updatedAt: item.updatedAt || new Date()
      });
    });
    
    await batch.commit();
  }
}

// Verificar el estado de las colecciones
export async function verifyFirebaseCollections() {
  const results: { [key: string]: number } = {};
  
  for (const collectionName of Object.values(COLLECTIONS)) {
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      results[collectionName] = snapshot.size;
    } catch (error) {
      console.error(`Error verificando ${collectionName}:`, error);
      results[collectionName] = -1;
    }
  }
  
  return results;
}