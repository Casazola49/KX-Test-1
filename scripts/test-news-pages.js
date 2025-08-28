#!/usr/bin/env node

/**
 * Script para verificar que las páginas de noticias funcionen correctamente
 */

console.log('🔍 Verificando migración de páginas de noticias...\n');

const fs = require('fs');
const path = require('path');

// Archivos que deben usar Firebase
const filesToCheck = [
  {
    path: 'src/app/admin/news/page.tsx',
    description: 'Lista de noticias en admin',
    shouldHave: ['getAllNews', 'data-service'],
    shouldNotHave: ['supabase', 'createClient']
  },
  {
    path: 'src/app/noticias/page.tsx', 
    description: 'Página principal de noticias',
    shouldHave: ['getAllNews', 'data-service'],
    shouldNotHave: ['supabase', 'createClient']
  },
  {
    path: 'src/app/noticias/[slug]/page.tsx',
    description: 'Página individual de noticia',
    shouldHave: ['getNewsBySlugClient'],
    shouldNotHave: ['supabase']
  },
  {
    path: 'src/lib/client-data.ts',
    description: 'Funciones de datos del cliente',
    shouldHave: ['firebase', 'collection', 'query'],
    shouldNotHave: ['supabase-client']
  }
];

let allGood = true;

filesToCheck.forEach(({ path: filePath, description, shouldHave, shouldNotHave }) => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ ${description} - Archivo no encontrado: ${filePath}`);
    allGood = false;
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Verificar que tenga lo que debe tener
  const hasRequired = shouldHave.every(item => content.includes(item));
  
  // Verificar que NO tenga lo que no debe tener
  const hasProhibited = shouldNotHave.some(item => content.includes(item));
  
  if (!hasRequired) {
    console.log(`❌ ${description} - Falta migración a Firebase`);
    console.log(`   Debe incluir: ${shouldHave.join(', ')}`);
    allGood = false;
  } else if (hasProhibited) {
    console.log(`❌ ${description} - Todavía usa Supabase`);
    console.log(`   No debe incluir: ${shouldNotHave.join(', ')}`);
    allGood = false;
  } else {
    console.log(`✅ ${description} - Migrado correctamente`);
  }
});

console.log('\n📊 Resumen:');

if (allGood) {
  console.log('✅ Todas las páginas de noticias han sido migradas');
  console.log('\n🧪 Próximas pruebas:');
  console.log('1. Ve a /admin/news - Debería mostrar "prueba noticia 33"');
  console.log('2. Ve a /noticias - Debería mostrar todas las noticias');
  console.log('3. Haz clic en una noticia - No debería dar 404');
  console.log('\n🔄 Si hay problemas, reinicia el servidor:');
  console.log('   npm run dev');
} else {
  console.log('❌ Algunas páginas necesitan corrección');
  console.log('🔧 Revisa los archivos marcados arriba');
}

console.log('\n🎯 Estado esperado:');
console.log('- 📁 Datos: Firebase Firestore');
console.log('- 🖼️  Imágenes: Cloudinary');
console.log('- 🚫 Supabase: Eliminado de páginas de noticias');