#!/usr/bin/env node

/**
 * Script para probar la configuración de Cloudinary
 */

console.log('🔍 Verificando configuración de Cloudinary...\n');

// Verificar variables de entorno
const requiredEnvVars = [
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY', 
  'CLOUDINARY_API_SECRET'
];

let allEnvVarsPresent = true;

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}: Configurado`);
  } else {
    console.log(`❌ ${envVar}: Faltante`);
    allEnvVarsPresent = false;
  }
});

if (allEnvVarsPresent) {
  console.log('\n🎉 Todas las variables de entorno están configuradas');
  console.log('\n📝 Próximos pasos:');
  console.log('1. Reinicia el servidor de desarrollo');
  console.log('2. Prueba subir una imagen en /admin/add-news');
  console.log('3. Verifica que la imagen aparezca en Cloudinary');
} else {
  console.log('\n❌ Faltan variables de entorno');
  console.log('🔧 Revisa tu archivo .env.local');
}

console.log('\n🔗 API Route creada: /api/upload');
console.log('📁 Función actualizada: uploadToCloudinary');