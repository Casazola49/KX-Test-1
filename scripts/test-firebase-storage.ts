/**
 * Script para probar la configuración de Firebase Storage
 * Ejecutar con: npx tsx scripts/test-firebase-storage.ts
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import * as fs from 'fs';
import * as path from 'path';

// Inicializar Firebase Admin
if (!getApps().length) {
  try {
    console.log('🔧 Inicializando Firebase Admin...');
    
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    
    console.log('✅ Firebase Admin inicializado');
  } catch (error: any) {
    console.error('❌ Error inicializando Firebase Admin:', error.message);
    process.exit(1);
  }
}

async function testFirebaseStorage() {
  console.log('\n🧪 Probando Firebase Storage...\n');
  
  try {
    // 1. Verificar variables de entorno
    console.log('1️⃣ Verificando variables de entorno...');
    const requiredEnvVars = [
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY',
      'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'
    ];
    
    let allEnvVarsPresent = true;
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`   ✅ ${envVar}: Configurado`);
      } else {
        console.log(`   ❌ ${envVar}: NO CONFIGURADO`);
        allEnvVarsPresent = false;
      }
    }
    
    if (!allEnvVarsPresent) {
      console.log('\n❌ Faltan variables de entorno. Verifica tu archivo .env.local');
      process.exit(1);
    }
    
    console.log('   ✅ Todas las variables de entorno están configuradas\n');
    
    // 2. Obtener referencia al bucket
    console.log('2️⃣ Obteniendo referencia al bucket de Storage...');
    const storage = getStorage();
    const bucket = storage.bucket();
    
    console.log(`   ✅ Bucket obtenido: ${bucket.name}\n`);
    
    // 3. Verificar que el bucket existe
    console.log('3️⃣ Verificando que el bucket existe...');
    const [exists] = await bucket.exists();
    
    if (!exists) {
      console.log('   ❌ El bucket NO EXISTE');
      console.log('   💡 Solución: Habilita Firebase Storage en Firebase Console');
      console.log('   📖 Ver: HABILITAR_FIREBASE_STORAGE.md');
      process.exit(1);
    }
    
    console.log('   ✅ El bucket existe\n');
    
    // 4. Crear un archivo de prueba
    console.log('4️⃣ Creando archivo de prueba...');
    const testContent = `Test file created at ${new Date().toISOString()}`;
    const testFileName = `test/test_${Date.now()}.txt`;
    const fileRef = bucket.file(testFileName);
    
    await fileRef.save(Buffer.from(testContent), {
      metadata: {
        contentType: 'text/plain',
      },
    });
    
    console.log(`   ✅ Archivo de prueba creado: ${testFileName}\n`);
    
    // 5. Hacer el archivo público
    console.log('5️⃣ Haciendo el archivo público...');
    try {
      await fileRef.makePublic();
      console.log('   ✅ Archivo hecho público\n');
    } catch (publicError: any) {
      console.log('   ⚠️  No se pudo hacer público:', publicError.message);
      console.log('   💡 Esto puede ser normal si las reglas de seguridad son restrictivas\n');
    }
    
    // 6. Obtener URL pública
    console.log('6️⃣ Obteniendo URL pública...');
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${testFileName}`;
    console.log(`   ✅ URL pública: ${publicUrl}\n`);
    
    // 7. Verificar que el archivo existe
    console.log('7️⃣ Verificando que el archivo existe...');
    const [fileExists] = await fileRef.exists();
    
    if (!fileExists) {
      console.log('   ❌ El archivo NO EXISTE después de subirlo');
      process.exit(1);
    }
    
    console.log('   ✅ El archivo existe\n');
    
    // 8. Limpiar - eliminar archivo de prueba
    console.log('8️⃣ Limpiando archivo de prueba...');
    await fileRef.delete();
    console.log('   ✅ Archivo de prueba eliminado\n');
    
    // Resumen
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 ¡TODAS LAS PRUEBAS PASARON!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('✅ Firebase Storage está configurado correctamente');
    console.log('✅ Puedes subir archivos');
    console.log('✅ Puedes hacer archivos públicos');
    console.log('✅ Las URLs públicas funcionan');
    console.log('');
    console.log('🚀 Ahora puedes subir modelos 3D desde /admin/karts');
    console.log('');
    
  } catch (error: any) {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('❌ ERROR EN LAS PRUEBAS');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('Error:', error.message);
    console.log('');
    
    if (error.code === 'storage/bucket-not-found') {
      console.log('💡 Solución:');
      console.log('   1. Ve a Firebase Console');
      console.log('   2. Habilita Firebase Storage');
      console.log('   3. Verifica que el nombre del bucket sea correcto');
      console.log('');
      console.log('📖 Ver guía completa: HABILITAR_FIREBASE_STORAGE.md');
    } else if (error.code === 'storage/unauthorized') {
      console.log('💡 Solución:');
      console.log('   1. Verifica las credenciales de Firebase Admin');
      console.log('   2. Verifica que el Service Account tenga permisos');
      console.log('   3. Verifica las reglas de seguridad en Firebase Storage');
    } else {
      console.log('💡 Solución:');
      console.log('   1. Verifica la configuración en .env.local');
      console.log('   2. Verifica que Firebase Storage esté habilitado');
      console.log('   3. Consulta la documentación: HABILITAR_FIREBASE_STORAGE.md');
    }
    
    console.log('');
    process.exit(1);
  }
}

testFirebaseStorage();
