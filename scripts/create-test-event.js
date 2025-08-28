// Script para crear un evento de prueba con podiums
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');

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

async function createTestEvent() {
  try {
    console.log('🏁 Creando evento de prueba...');

    // 1. Crear categoría de prueba
    const categoryId = 'test-category-1';
    await setDoc(doc(db, 'categories', categoryId), {
      name: 'Profesional',
      description: 'Categoría profesional de prueba',
      createdAt: new Date()
    });
    console.log('✅ Categoría creada');

    // 2. Crear pilotos de prueba
    const pilots = [
      {
        id: 'pilot-1',
        firstName: 'Juan',
        lastName: 'Pérez',
        number: 1,
        teamName: 'Team Red',
        teamColor: '#FF0000',
        teamAccentColor: '#FF6666',
        nationality: 'ES',
        slug: 'juan-perez'
      },
      {
        id: 'pilot-2', 
        firstName: 'María',
        lastName: 'García',
        number: 2,
        teamName: 'Team Blue',
        teamColor: '#0000FF',
        teamAccentColor: '#6666FF',
        nationality: 'ES',
        slug: 'maria-garcia'
      },
      {
        id: 'pilot-3',
        firstName: 'Carlos',
        lastName: 'López',
        number: 3,
        teamName: 'Team Green',
        teamColor: '#00FF00',
        teamAccentColor: '#66FF66',
        nationality: 'ES',
        slug: 'carlos-lopez'
      }
    ];

    for (const pilot of pilots) {
      await setDoc(doc(db, 'pilots', pilot.id), {
        ...pilot,
        createdAt: new Date()
      });
    }
    console.log('✅ Pilotos creados');

    // 3. Crear pista de prueba
    const trackId = 'test-track-1';
    await setDoc(doc(db, 'tracks', trackId), {
      name: 'Circuito de Prueba',
      location: 'Madrid, España',
      description: 'Pista de prueba para eventos',
      createdAt: new Date()
    });
    console.log('✅ Pista creada');

    // 4. Crear evento de prueba
    const eventId = 'test-event-1';
    await setDoc(doc(db, 'raceevents', eventId), {
      name: 'Gran Premio de Prueba',
      date: new Date('2024-12-15'),
      track_id: trackId,
      description: 'Evento de prueba para verificar la funcionalidad',
      promoImageUrl: 'https://placehold.co/800x400/FF0000/FFFFFF?text=Gran+Premio+Prueba',
      galleryImageUrls: [
        'https://placehold.co/600x400/0000FF/FFFFFF?text=Imagen+1',
        'https://placehold.co/600x400/00FF00/FFFFFF?text=Imagen+2'
      ],
      createdAt: new Date()
    });
    console.log('✅ Evento creado');

    // 5. Crear podium de prueba
    const podiumId = 'test-podium-1';
    await setDoc(doc(db, 'podiums', podiumId), {
      event_id: eventId,
      category_id: categoryId,
      podium_type: 'PODIO_OFICIAL_DEFINITIVO',
      determination_method: 'TIEMPO',
      createdAt: new Date()
    });
    console.log('✅ Podium creado');

    // 6. Crear resultados del podium
    const results = [
      { position: 1, pilot_id: 'pilot-1', time: '1:23.456', points: 25 },
      { position: 2, pilot_id: 'pilot-2', time: '1:24.123', points: 18 },
      { position: 3, pilot_id: 'pilot-3', time: '1:25.789', points: 15 }
    ];

    for (const result of results) {
      await addDoc(collection(db, 'podium_results'), {
        ...result,
        podium_id: podiumId,
        createdAt: new Date()
      });
    }
    console.log('✅ Resultados del podium creados');

    console.log('\n🎉 ¡Evento de prueba creado exitosamente!');
    console.log(`📋 ID del evento: ${eventId}`);
    console.log(`🔗 URL para probar: http://localhost:9008/calendario/${eventId}`);

  } catch (error) {
    console.error('❌ Error creando evento de prueba:', error);
  }
}

createTestEvent();