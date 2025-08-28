#!/usr/bin/env node

/**
 * Script para analizar qué páginas del frontend necesitan migración
 */

console.log('🔍 Analizando páginas del frontend que usan Supabase...\n');

const fs = require('fs');
const path = require('path');

// Páginas públicas importantes que necesitan migración
const publicPages = [
  {
    path: 'src/app/pistas/page.tsx',
    description: 'Lista de pistas',
    priority: 'Alta',
    users: 'Público general'
  },
  {
    path: 'src/app/pistas/[id]/page.tsx', 
    description: 'Detalle de pista individual',
    priority: 'Alta',
    users: 'Público general'
  },
  {
    path: 'src/app/pilotos-equipos/page.tsx',
    description: 'Lista de pilotos',
    priority: 'Alta', 
    users: 'Fans, competidores'
  },
  {
    path: 'src/app/pilotos-equipos/[slug]/page.tsx',
    description: 'Perfil individual de piloto',
    priority: 'Alta',
    users: 'Fans, competidores'
  },
  {
    path: 'src/app/calendario/page.tsx',
    description: 'Calendario de eventos',
    priority: 'Alta',
    users: 'Competidores, público'
  },
  {
    path: 'src/app/calendario/[id]/page.tsx',
    description: 'Detalle de evento',
    priority: 'Alta',
    users: 'Competidores, público'
  },
  {
    path: 'src/app/galeria/page.tsx',
    description: 'Galería de fotos',
    priority: 'Media',
    users: 'Público general'
  },
  {
    path: 'src/app/equipamiento-servicios/page.tsx',
    description: 'Lista de productos/servicios',
    priority: 'Media',
    users: 'Compradores potenciales'
  },
  {
    path: 'src/app/equipamiento-servicios/[slug]/page.tsx',
    description: 'Detalle de producto',
    priority: 'Media',
    users: 'Compradores potenciales'
  },
  {
    path: 'src/app/kart/page.tsx',
    description: 'Página de karts',
    priority: 'Media',
    users: 'Entusiastas técnicos'
  },
  {
    path: 'src/components/sections/HomepageHero.tsx',
    description: 'Hero de página de inicio',
    priority: 'Alta',
    users: 'Todos los visitantes'
  },
  {
    path: 'src/components/client/HomeGalleryClient.tsx',
    description: 'Galería en página de inicio',
    priority: 'Media',
    users: 'Todos los visitantes'
  }
];

console.log('📊 Páginas públicas que necesitan migración:\n');

// Agrupar por prioridad
const byPriority = {
  'Alta': [],
  'Media': [],
  'Baja': []
};

publicPages.forEach(page => {
  const fullPath = path.join(__dirname, '..', page.path);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const usesSupabase = content.includes('supabase') || content.includes('createClient');
    
    if (usesSupabase) {
      byPriority[page.priority].push({
        ...page,
        status: '❌ Usa Supabase'
      });
    } else {
      byPriority[page.priority].push({
        ...page,
        status: '✅ Ya migrado'
      });
    }
  } else {
    byPriority[page.priority].push({
      ...page,
      status: '⚠️ No encontrado'
    });
  }
});

// Mostrar resultados por prioridad
Object.entries(byPriority).forEach(([priority, pages]) => {
  if (pages.length > 0) {
    console.log(`🎯 **PRIORIDAD ${priority.toUpperCase()}**`);
    pages.forEach(page => {
      console.log(`   ${page.status} ${page.description}`);
      console.log(`      📁 ${page.path}`);
      console.log(`      👥 ${page.users}`);
      console.log('');
    });
  }
});

// Contar estadísticas
const needsMigration = publicPages.filter(page => {
  const fullPath = path.join(__dirname, '..', page.path);
  if (!fs.existsSync(fullPath)) return false;
  const content = fs.readFileSync(fullPath, 'utf8');
  return content.includes('supabase') || content.includes('createClient');
});

console.log('📈 **RESUMEN**');
console.log(`Total páginas analizadas: ${publicPages.length}`);
console.log(`Necesitan migración: ${needsMigration.length}`);
console.log(`Ya migradas: ${publicPages.length - needsMigration.length}`);

console.log('\n🚀 **PLAN DE MIGRACIÓN SUGERIDO**');
console.log('1. **Fase 1**: Páginas de Alta Prioridad');
console.log('   - Pistas (lista y detalle)');
console.log('   - Pilotos (lista y perfil)'); 
console.log('   - Calendario (lista y evento)');
console.log('   - Homepage Hero');
console.log('');
console.log('2. **Fase 2**: Páginas de Media Prioridad');
console.log('   - Galería');
console.log('   - Equipamiento/Servicios');
console.log('   - Karts');
console.log('');
console.log('3. **Fase 3**: Componentes y Hooks');
console.log('   - Live streaming');
console.log('   - Realtime features');

console.log('\n💡 **RECOMENDACIÓN**: Empezar con Pistas (más simple) y luego Pilotos');