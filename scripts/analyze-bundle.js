#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Analizando el bundle de la aplicación...\n');

// Limpiar builds anteriores
if (fs.existsSync('.next')) {
  console.log('🧹 Limpiando build anterior...');
  execSync('rm -rf .next', { stdio: 'inherit' });
}

// Construir con análisis
console.log('🏗️  Construyendo aplicación con análisis...');
try {
  execSync('ANALYZE=true npm run build', { 
    stdio: 'inherit',
    env: { ...process.env, ANALYZE: 'true' }
  });
  
  console.log('\n✅ Análisis completado!');
  console.log('📊 El reporte se abrirá automáticamente en tu navegador.');
  console.log('📁 Los archivos de análisis están en: .next/analyze/');
  
} catch (error) {
  console.error('❌ Error durante el análisis:', error.message);
  process.exit(1);
}

// Mostrar estadísticas básicas
console.log('\n📈 Estadísticas básicas:');
try {
  const buildManifest = require('../.next/build-manifest.json');
  const pages = Object.keys(buildManifest.pages);
  
  console.log(`📄 Páginas encontradas: ${pages.length}`);
  console.log(`🎯 Páginas principales:`, pages.slice(0, 5).join(', '));
  
  if (fs.existsSync('.next/static')) {
    const staticFiles = fs.readdirSync('.next/static');
    console.log(`📦 Archivos estáticos: ${staticFiles.length}`);
  }
  
} catch (error) {
  console.log('ℹ️  No se pudieron obtener estadísticas detalladas');
}

console.log('\n🎉 ¡Análisis completado exitosamente!');
console.log('💡 Revisa el reporte para identificar oportunidades de optimización.');