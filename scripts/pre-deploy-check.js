#!/usr/bin/env node

/**
 * Script de verificación pre-despliegue
 * Verifica que todo esté listo para producción
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Verificando configuración para despliegue...\n');

// Verificar archivos esenciales
const requiredFiles = [
  'package.json',
  'next.config.js',
  'vercel.json',
  '.env.example'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - OK`);
  } else {
    console.log(`❌ ${file} - FALTA`);
    allFilesExist = false;
  }
});

// Verificar package.json scripts
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['build', 'start', 'lint'];

console.log('\n📦 Verificando scripts de package.json:');
requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`✅ ${script} - OK`);
  } else {
    console.log(`❌ ${script} - FALTA`);
    allFilesExist = false;
  }
});

// Verificar dependencias críticas
const criticalDeps = ['next', 'react', 'react-dom'];
console.log('\n🔧 Verificando dependencias críticas:');
criticalDeps.forEach(dep => {
  if (packageJson.dependencies[dep]) {
    console.log(`✅ ${dep} - v${packageJson.dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} - FALTA`);
    allFilesExist = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allFilesExist) {
  console.log('🎉 ¡Todo listo para desplegar!');
  console.log('\nPróximos pasos:');
  console.log('1. Conecta tu repositorio a Vercel');
  console.log('2. Configura las variables de entorno');
  console.log('3. Configura tu dominio personalizado');
  process.exit(0);
} else {
  console.log('⚠️  Hay problemas que resolver antes del despliegue');
  process.exit(1);
}