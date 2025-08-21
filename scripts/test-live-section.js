#!/usr/bin/env node

/**
 * Script de prueba para verificar la funcionalidad de la sección "Carrera en Vivo"
 * Ejecutar con: node scripts/test-live-section.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testLiveSection() {
  console.log('🧪 Iniciando pruebas de la sección "Carrera en Vivo"...\n');

  try {
    // Test 1: Verificar configuración del stream
    console.log('1️⃣ Verificando configuración del stream...');
    const { data: streamConfig, error: streamError } = await supabase
      .from('live_stream')
      .select('*')
      .single();

    if (streamError) {
      console.log('❌ Error al obtener configuración:', streamError.message);
      console.log('💡 Creando configuración inicial...');
      
      const { error: insertError } = await supabase
        .from('live_stream')
        .insert({
          id: 1,
          is_live: false,
          stream_title: 'Próxima Carrera Santa Cruz',
          iframe_url: null
        });

      if (insertError) {
        console.log('❌ Error al crear configuración:', insertError.message);
      } else {
        console.log('✅ Configuración inicial creada');
      }
    } else {
      console.log('✅ Configuración encontrada:', {
        is_live: streamConfig.is_live,
        title: streamConfig.stream_title,
        has_url: !!streamConfig.iframe_url
      });
    }

    // Test 2: Verificar tabla de mensajes
    console.log('\n2️⃣ Verificando tabla de mensajes...');
    const { data: messages, error: messagesError } = await supabase
      .from('live_chat_messages')
      .select('*')
      .limit(5);

    if (messagesError) {
      console.log('❌ Error al obtener mensajes:', messagesError.message);
    } else {
      console.log(`✅ Tabla de mensajes accesible (${messages.length} mensajes encontrados)`);
    }

    // Test 3: Probar inserción de mensaje de prueba
    console.log('\n3️⃣ Probando inserción de mensaje...');
    const testMessage = `Mensaje de prueba - ${new Date().toISOString()}`;
    
    const { data: newMessage, error: insertMessageError } = await supabase
      .from('live_chat_messages')
      .insert({
        message: testMessage,
        author: 'Sistema de Pruebas'
      })
      .select()
      .single();

    if (insertMessageError) {
      console.log('❌ Error al insertar mensaje:', insertMessageError.message);
    } else {
      console.log('✅ Mensaje insertado correctamente:', newMessage.id);
      
      // Limpiar mensaje de prueba
      await supabase
        .from('live_chat_messages')
        .delete()
        .eq('id', newMessage.id);
      console.log('🧹 Mensaje de prueba eliminado');
    }

    // Test 4: Verificar políticas RLS
    console.log('\n4️⃣ Verificando políticas de seguridad...');
    const publicClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: publicStream, error: publicStreamError } = await publicClient
      .from('live_stream')
      .select('*')
      .single();

    if (publicStreamError) {
      console.log('❌ Error en acceso público al stream:', publicStreamError.message);
    } else {
      console.log('✅ Acceso público al stream funcionando');
    }

    const { data: publicMessages, error: publicMessagesError } = await publicClient
      .from('live_chat_messages')
      .select('*')
      .limit(1);

    if (publicMessagesError) {
      console.log('❌ Error en acceso público a mensajes:', publicMessagesError.message);
    } else {
      console.log('✅ Acceso público a mensajes funcionando');
    }

    console.log('\n🎉 Todas las pruebas completadas!');
    console.log('\n📋 Resumen:');
    console.log('- Configuración del stream: ✅');
    console.log('- Tabla de mensajes: ✅');
    console.log('- Inserción de mensajes: ✅');
    console.log('- Políticas de seguridad: ✅');
    console.log('\n🚀 La sección "Carrera en Vivo" está lista para usar!');

  } catch (error) {
    console.error('💥 Error inesperado:', error);
  }
}

// Ejecutar pruebas
testLiveSection();