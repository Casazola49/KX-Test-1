#!/usr/bin/env node

/**
 * Script de ANÁLISIS para producción (NO modifica archivos)
 * Solo identifica qué necesita ser limpiado
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Analizando código para producción...\n');

// Función para leer archivos recursivamente
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['node_modules', '.next', '.git', 'public', 'scripts'].includes(file)) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// Análisis de logs de consola
function analyzeConsoleLogs(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Identificar diferentes tipos de logs
    if (trimmed.match(/console\.log\(/)) {
      issues.push({
        line: index + 1,
        type: 'console.log',
        content: trimmed,
        severity: 'medium'
      });
    }
    
    if (trimmed.match(/console\.warn\(/)) {
      issues.push({
        line: index + 1,
        type: 'console.warn',
        content: trimmed,
        severity: 'medium'
      });
    }
    
    // Solo flagear console.error que parecen ser de debug
    if (trimmed.match(/console\.error\(/) && !trimmed.includes('catch') && !trimmed.includes('Error')) {
      issues.push({
        line: index + 1,
        type: 'console.error',
        content: trimmed,
        severity: 'low'
      });
    }
    
    if (trimmed.match(/debugger/)) {
      issues.push({
        line: index + 1,
        type: 'debugger',
        content: trimmed,
        severity: 'high'
      });
    }
  });

  return issues;
}

// Análisis de componentes de debug
function analyzeDebugComponents(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  if (content.includes('PerformanceMetrics')) {
    issues.push({
      type: 'debug-component',
      component: 'PerformanceMetrics',
      severity: 'high'
    });
  }

  return issues;
}

// Ejecutar análisis
const srcPath = path.join(__dirname, '..', 'src');
const allFiles = getAllFiles(srcPath);

console.log(`📁 Analizando ${allFiles.length} archivos...\n`);

const results = {
  consoleLogs: [],
  debugComponents: [],
  totalIssues: 0
};

allFiles.forEach(filePath => {
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Analizar logs de consola
  const consoleIssues = analyzeConsoleLogs(filePath);
  if (consoleIssues.length > 0) {
    results.consoleLogs.push({
      file: relativePath,
      issues: consoleIssues
    });
    results.totalIssues += consoleIssues.length;
  }
  
  // Analizar componentes de debug
  const debugIssues = analyzeDebugComponents(filePath);
  if (debugIssues.length > 0) {
    results.debugComponents.push({
      file: relativePath,
      issues: debugIssues
    });
    results.totalIssues += debugIssues.length;
  }
});

// Mostrar resultados
console.log('📊 RESULTADOS DEL ANÁLISIS:\n');

if (results.consoleLogs.length > 0) {
  console.log('🔍 LOGS DE CONSOLA ENCONTRADOS:');
  results.consoleLogs.forEach(fileResult => {
    console.log(`\n📄 ${fileResult.file}:`);
    fileResult.issues.forEach(issue => {
      const severity = issue.severity === 'high' ? '🔴' : issue.severity === 'medium' ? '🟡' : '🟢';
      console.log(`   ${severity} Línea ${issue.line}: ${issue.type} - ${issue.content.substring(0, 80)}...`);
    });
  });
}

if (results.debugComponents.length > 0) {
  console.log('\n🔧 COMPONENTES DE DEBUG ENCONTRADOS:');
  results.debugComponents.forEach(fileResult => {
    console.log(`📄 ${fileResult.file}:`);
    fileResult.issues.forEach(issue => {
      console.log(`   🔴 ${issue.component} (${issue.type})`);
    });
  });
}

console.log(`\n📈 RESUMEN:`);
console.log(`   Total de archivos analizados: ${allFiles.length}`);
console.log(`   Archivos con logs de consola: ${results.consoleLogs.length}`);
console.log(`   Archivos con componentes debug: ${results.debugComponents.length}`);
console.log(`   Total de issues encontrados: ${results.totalIssues}`);

if (results.totalIssues === 0) {
  console.log('\n✅ ¡Código listo para producción!');
} else {
  console.log('\n⚠️  Se encontraron issues que deben ser revisados antes de producción.');
  console.log('\n💡 RECOMENDACIONES:');
  console.log('   1. Revisar manualmente cada console.log/warn para determinar si es necesario');
  console.log('   2. Remover todos los debugger statements');
  console.log('   3. Remover componentes PerformanceMetrics de páginas principales');
  console.log('   4. Mantener console.error en catch blocks para errores críticos');
}

console.log('\n🎯 Este análisis NO modificó ningún archivo.');