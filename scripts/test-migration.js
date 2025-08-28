// Script simple para probar la migración y configuración
const path = require('path');

// Cargar variables de entorno desde .env.local
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

console.log('🧪 Probando configuración de Firebase + Cloudinary...\n');

// 1. Verificar variables de entorno
console.log('1. Verificando variables de entorno...');

// Mostrar las variables que encontramos
console.log('Variables encontradas:');
console.log(`- NEXT_PUBLIC_FIREBASE_API_KEY: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Configurada' : '❌ Faltante'}`);
console.log(`- NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Configurada' : '❌ Faltante'}`);
console.log(`- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: ${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✅ Configurada' : '❌ Faltante'}`);
console.log(`- CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? '✅ Configurada' : '❌ Faltante'}`);

const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID', 
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY'
];

let missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.log('\n❌ Variables de entorno faltantes:');
  missingVars.forEach(varName => console.log(`   - ${varName}`));
  console.log('\n📝 Revisa tu archivo .env.local');
  process.exit(1);
}

console.log('\n✅ Todas las variables de entorno están configuradas');

// 2. Verificar dependencias básicas
console.log('\n2. Verificando dependencias...');
try {
  require('firebase/app');
  console.log('✅ Firebase instalado');
} catch (error) {
  console.log('❌ Firebase no instalado');
}

try {
  require('cloudinary');
  console.log('✅ Cloudinary instalado');
} catch (error) {
  console.log('❌ Cloudinary no instalado');
}

console.log('\n🎉 ¡Configuración básica completada!');
console.log('\n📋 Próximos pasos:');
console.log('1. Ejecutar: npm run dev');
console.log('2. Visitar: http://localhost:9008/api/seed-firebase');
console.log('3. Verificar datos en Firebase Console');

console.log('\n🔗 Enlaces útiles:');
if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  console.log(`- Firebase Console: https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);
}
if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
  console.log(`- Cloudinary Dashboard: https://cloudinary.com/console/c/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}`);
}