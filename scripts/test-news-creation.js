const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, Timestamp } = require('firebase/firestore');
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

async function testNewsCreation() {
  try {
    console.log('📰 Probando creación de noticias...\n');
    
    // Verificar noticias existentes
    const existingNews = await getDocs(collection(db, 'news'));
    console.log(`📊 Noticias existentes: ${existingNews.size}`);
    
    // Crear una noticia de prueba
    const testNews = {
      title: 'Noticia de Prueba - Firebase',
      slug: 'noticia-prueba-firebase',
      summary: 'Esta es una noticia de prueba para verificar que Firebase funciona correctamente.',
      category: 'Pruebas',
      imageUrl: 'https://via.placeholder.com/800x400',
      galleryImageUrls: [],
      content: '<p>Esta es una noticia de prueba creada para verificar que el sistema de noticias funciona correctamente con Firebase.</p><p>Si puedes ver esta noticia, significa que la migración fue exitosa.</p>',
      isMain: false,
      date: new Date(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    
    console.log('📝 Creando noticia de prueba...');
    const docRef = await addDoc(collection(db, 'news'), testNews);
    console.log(`✅ Noticia creada con ID: ${docRef.id}`);
    
    // Verificar que se creó correctamente
    const updatedNews = await getDocs(collection(db, 'news'));
    console.log(`📊 Noticias después de crear: ${updatedNews.size}`);
    
    console.log('\n🎉 Prueba de noticias completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testNewsCreation();