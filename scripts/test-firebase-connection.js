// Script simple para probar conexión a Firebase
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

console.log('🔍 Verificando variables de Firebase...');
console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Configurada' : '❌ Faltante');
console.log('Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Configurada' : '❌ Faltante');
console.log('Auth Domain:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Configurada' : '❌ Faltante');

if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  console.log('❌ Faltan variables de Firebase');
  process.exit(1);
}

const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('\n🚀 Inicializando Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testConnection() {
  try {
    console.log('📡 Probando conexión a Firestore...');
    
    // Probar obtener una colección simple
    const snapshot = await getDocs(collection(db, 'events'));
    console.log(`✅ Conexión exitosa! Encontrados ${snapshot.size} eventos`);
    
    if (snapshot.size > 0) {
      const firstDoc = snapshot.docs[0];
      console.log(`📋 Primer evento: ${firstDoc.data().name || 'Sin nombre'}`);
    }
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.log('\n🔧 Posibles soluciones:');
    console.log('1. Verificar que las variables de entorno estén correctas');
    console.log('2. Verificar que el proyecto de Firebase esté activo');
    console.log('3. Verificar conexión a internet');
  }
}

testConnection();