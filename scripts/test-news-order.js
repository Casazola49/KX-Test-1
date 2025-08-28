#!/usr/bin/env node

/**
 * Script para verificar que las noticias aparezcan en orden correcto
 */

console.log('🔍 Verificando orden de noticias...\n');

const fs = require('fs');
const path = require('path');

// Verificar que las funciones usen 'createdAt' en lugar de 'date'
const functionsToCheck = [
  {
    file: 'src/lib/data-service.ts',
    functions: ['getAllNews', 'getMainNews'],
    description: 'Funciones del servidor'
  },
  {
    file: 'src/lib/client-data.ts', 
    functions: ['getNewsClient'],
    description: 'Funciones del cliente'
  }
];

let allGood = true;

functionsToCheck.forEach(({ file, functions, description }) => {
  const fullPath = path.join(__dirname, '..', file);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ ${description} - Archivo no encontrado: ${file}`);
    allGood = false;
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  
  functions.forEach(funcName => {
    // Buscar la función
    const funcRegex = new RegExp(`${funcName}[\\s\\S]*?orderBy\\(['"]([^'"]+)['"]`, 'g');
    const matches = [...content.matchAll(funcRegex)];
    
    if (matches.length === 0) {
      console.log(`⚠️  ${description} - No se encontró orderBy en ${funcName}`);
      return;
    }
    
    matches.forEach(match => {
      const orderField = match[1];
      if (orderField === 'createdAt') {
        console.log(`✅ ${funcName} - Ordena por 'createdAt' (correcto)`);
      } else if (orderField === 'date') {
        console.log(`❌ ${funcName} - Ordena por 'date' (incorrecto, debería ser 'createdAt')`);
        allGood = false;
      } else {
        console.log(`⚠️  ${funcName} - Ordena por '${orderField}' (verificar si es correcto)`);
      }
    });
  });
});

console.log('\n📊 Resumen:');

if (allGood) {
  console.log('✅ Todas las funciones de noticias ordenan correctamente');
  console.log('\n🧪 Para probar:');
  console.log('1. Reinicia el servidor: npm run dev');
  console.log('2. Ve a /admin/news - "prueba noticia 33" debería aparecer primero');
  console.log('3. Ve a /noticias - Las noticias más recientes primero');
  console.log('\n💡 Orden esperado: Más reciente → Más antigua');
} else {
  console.log('❌ Algunas funciones necesitan corrección');
  console.log('🔧 Las funciones deben usar orderBy("createdAt", "desc")');
}

console.log('\n🎯 Campo correcto para ordenar:');
console.log('- ✅ createdAt: Fecha de creación en Firebase');
console.log('- ❌ date: Campo legacy de Supabase');