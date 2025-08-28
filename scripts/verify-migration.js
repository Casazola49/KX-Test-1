// Script para verificar que la migración y el código estén funcionando correctamente
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function verifyMigration() {
  console.log('🔍 Verificando migración y código...\n');

  try {
    // 1. Verificar que Firebase esté configurado
    console.log('1. Verificando configuración de Firebase...');
    const firebaseVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'
    ];
    
    let firebaseOk = true;
    firebaseVars.forEach(varName => {
      if (!process.env[varName]) {
        console.log(`   ❌ Falta: ${varName}`);
        firebaseOk = false;
      }
    });
    
    if (firebaseOk) {
      console.log('   ✅ Variables de Firebase configuradas');
    }

    // 2. Verificar que Cloudinary esté configurado
    console.log('\n2. Verificando configuración de Cloudinary...');
    const cloudinaryVars = [
      'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
      'CLOUDINARY_API_KEY'
    ];
    
    let cloudinaryOk = true;
    cloudinaryVars.forEach(varName => {
      if (!process.env[varName]) {
        console.log(`   ❌ Falta: ${varName}`);
        cloudinaryOk = false;
      }
    });
    
    if (cloudinaryOk) {
      console.log('   ✅ Variables de Cloudinary configuradas');
    }

    // 3. Verificar archivos críticos
    console.log('\n3. Verificando archivos críticos...');
    const fs = require('fs');
    const criticalFiles = [
      'src/lib/firebase.ts',
      'src/lib/data-service.ts',
      'src/lib/firebase-collections.ts',
      'src/lib/cloudinary.ts',
      'src/components/shared/CloudinaryUpload.tsx'
    ];
    
    let filesOk = true;
    criticalFiles.forEach(filePath => {
      const fullPath = path.join(__dirname, '..', filePath);
      if (fs.existsSync(fullPath)) {
        console.log(`   ✅ ${filePath}`);
      } else {
        console.log(`   ❌ Falta: ${filePath}`);
        filesOk = false;
      }
    });

    // 4. Verificar sintaxis básica de archivos TypeScript
    console.log('\n4. Verificando sintaxis de archivos principales...');
    try {
      // Intentar importar los módulos principales
      const dataService = require('../src/lib/data-service.ts');
      console.log('   ✅ data-service.ts - sintaxis correcta');
    } catch (error) {
      console.log(`   ⚠️  data-service.ts - posible problema: ${error.message.split('\n')[0]}`);
    }

    // 5. Resumen
    console.log('\n📋 RESUMEN:');
    console.log('===========');
    console.log(`Firebase: ${firebaseOk ? '✅' : '❌'}`);
    console.log(`Cloudinary: ${cloudinaryOk ? '✅' : '❌'}`);
    console.log(`Archivos: ${filesOk ? '✅' : '❌'}`);

    if (firebaseOk && cloudinaryOk && filesOk) {
      console.log('\n🎉 ¡Todo parece estar configurado correctamente!');
      console.log('\n📋 Para probar la aplicación:');
      console.log('1. Ejecuta: npm run dev');
      console.log('2. Ve a: http://localhost:9008');
      console.log('3. Navega por las páginas principales:');
      console.log('   - Inicio (/)');
      console.log('   - Pilotos (/pilotos-equipos)');
      console.log('   - Noticias (/noticias)');
      console.log('   - Galería (/galeria)');
    } else {
      console.log('\n⚠️  Hay algunos problemas que resolver antes de probar');
    }

  } catch (error) {
    console.error('❌ Error durante la verificación:', error.message);
  }
}

if (require.main === module) {
  verifyMigration();
}

module.exports = { verifyMigration };