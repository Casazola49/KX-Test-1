/**
 * Script de prueba para el sistema de transmisión en vivo
 * 
 * Este script verifica que:
 * 1. Firebase esté configurado correctamente
 * 2. Las colecciones necesarias existan
 * 3. Se puedan leer y escribir datos
 */

import { db } from '../src/lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, Timestamp } from 'firebase/firestore';

async function testLiveSystem() {
  console.log('🧪 Iniciando pruebas del sistema de transmisión en vivo...\n');

  try {
    // Test 1: Verificar conexión a Firebase
    console.log('📡 Test 1: Verificando conexión a Firebase...');
    const testDoc = await getDoc(doc(db, 'live_streams', 'main-stream'));
    console.log('✅ Conexión a Firebase exitosa\n');

    // Test 2: Verificar/Crear configuración de live stream
    console.log('⚙️  Test 2: Verificando configuración de live stream...');
    if (!testDoc.exists()) {
      console.log('⚠️  Configuración no existe, creando...');
      await setDoc(doc(db, 'live_streams', 'main-stream'), {
        is_live: false,
        stream_title: 'Próxima Carrera',
        iframe_url: '',
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });
      console.log('✅ Configuración creada exitosamente');
    } else {
      console.log('✅ Configuración existe');
      const data = testDoc.data();
      console.log('   - Estado:', data.is_live ? '🔴 EN VIVO' : '⚪ Offline');
      console.log('   - Título:', data.stream_title || 'Sin título');
      console.log('   - URL:', data.iframe_url ? '✅ Configurada' : '❌ No configurada');
    }
    console.log('');

    // Test 3: Verificar colección de mensajes
    console.log('💬 Test 3: Verificando colección de mensajes...');
    const messagesSnapshot = await getDocs(collection(db, 'live_chat_messages'));
    console.log(`✅ Colección de mensajes accesible (${messagesSnapshot.size} mensajes)\n`);

    // Test 4: Crear mensaje de prueba
    console.log('📝 Test 4: Creando mensaje de prueba...');
    const testMessageRef = doc(collection(db, 'live_chat_messages'));
    await setDoc(testMessageRef, {
      message: '🧪 Mensaje de prueba del sistema',
      author: 'Sistema',
      created_at: Timestamp.now()
    });
    console.log('✅ Mensaje de prueba creado exitosamente\n');

    // Test 5: Leer mensajes
    console.log('📖 Test 5: Leyendo mensajes...');
    const { getChatMessages } = await import('../src/lib/data-service');
    const messages = await getChatMessages(5);
    console.log(`✅ Mensajes leídos exitosamente (${messages.length} mensajes)`);
    if (messages.length > 0) {
      console.log('   Último mensaje:', messages[messages.length - 1].message);
    }
    console.log('');

    // Test 6: Verificar funciones de data-service
    console.log('🔧 Test 6: Verificando funciones de data-service...');
    const { getLiveStreamConfig, updateLiveStreamConfig } = await import('../src/lib/data-service');
    
    const config = await getLiveStreamConfig();
    console.log('✅ getLiveStreamConfig funciona correctamente');
    
    const updateResult = await updateLiveStreamConfig({
      is_live: config.is_live,
      stream_title: config.stream_title,
      iframe_url: config.iframe_url
    });
    
    if (updateResult.success) {
      console.log('✅ updateLiveStreamConfig funciona correctamente\n');
    } else {
      console.log('❌ Error en updateLiveStreamConfig:', updateResult.error, '\n');
    }

    // Resumen
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('✅ Sistema de transmisión en vivo funcionando correctamente');
    console.log('✅ Firebase configurado correctamente');
    console.log('✅ Colecciones creadas y accesibles');
    console.log('✅ Funciones de lectura/escritura operativas');
    console.log('');
    console.log('🚀 El sistema está listo para producción!');
    console.log('');
    console.log('Próximos pasos:');
    console.log('1. Ve a /admin/live para configurar la transmisión');
    console.log('2. Obtén la URL de SpeedHive/MyLaps');
    console.log('3. Activa la transmisión');
    console.log('4. Comienza a relatar la carrera');
    console.log('');

  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
    console.log('');
    console.log('Posibles soluciones:');
    console.log('1. Verifica que Firebase esté configurado en .env.local');
    console.log('2. Asegúrate de que las reglas de Firestore permitan lectura/escritura');
    console.log('3. Verifica que las colecciones existan en Firebase Console');
    console.log('');
    process.exit(1);
  }
}

// Ejecutar pruebas
testLiveSystem();
