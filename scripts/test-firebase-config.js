#!/usr/bin/env node

/**
 * Script para probar la configuración básica de Firebase
 */

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getFirestore, connectFirestoreEmulator } = require('firebase/firestore');

console.log('🔧 Probando configuración de Firebase...\n');

// Mostrar variables de entorno
console.log('📋 Variables de entorno:');
console.log('API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Definida' : '❌ No definida');
console.log('AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '❌ No definida');
console.log('PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '❌ No definida');
console.log('STORAGE_BUCKET:', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '❌ No definida');
console.log('MESSAGING_SENDER_ID:', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '❌ No definida');
console.log('APP_ID:', process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '❌ No definida');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log('\n🔥 Configuración Firebase:');
console.log(JSON.stringify(firebaseConfig, null, 2));

try {
  console.log('\n🚀 Inicializando Firebase...');
  const app = initializeApp(firebaseConfig);
  console.log('✅ Firebase inicializado correctamente');
  
  console.log('\n📊 Inicializando Firestore...');
  const db = getFirestore(app);
  console.log('✅ Firestore inicializado correctamente');
  
  console.log('\n🎉 Configuración de Firebase es válida!');
  
} catch (error) {
  console.error('\n❌ Error en la configuración:', error.message);
  console.error('Stack:', error.stack);
}