#!/usr/bin/env node

/**
 * Script de limpieza para producción
 * Remueve logs de consola, componentes de debug y optimiza el código
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Iniciando limpieza para producción...\n');

// Función para leer archivos recursivamente
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      // Excluir directorios que no necesitan limpieza
      if (!['node_modules', '.next', '.git', 'public'].includes(file)) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      }
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

// Función para limpiar logs de consola
function cleanConsoleLogs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remover console.log, console.warn, console.error (pero no console.error en catch blocks críticos)
  const consolePatterns = [
    /console\.log\([^)]*\);?\s*\n?/g,
    /console\.warn\([^)]*\);?\s*\n?/g,
    // Solo remover console.error que no están en catch blocks críticos
    /console\.error\(['"`][^'"`]*['"`]\s*,\s*[^)]*\);?\s*\n?/g
  ];

  consolePatterns.forEach(pattern => {
    const newContent = content.replace(pattern, '');
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });

  // Remover debugger statements
  const debuggerPattern = /debugger;?\s*\n?/g;
  const newContent = content.replace(debuggerPattern, '');
  if (newContent !== content) {
    content = newContent;
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

// Función para remover imports de componentes de debug
function removeDebugImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Remover imports de PerformanceMetrics
  const debugImportPattern = /import\s+PerformanceMetrics\s+from\s+['"][^'"]*PerformanceMetrics['"];\s*\n?/g;
  const newContent = content.replace(debugImportPattern, '');
  if (newContent !== content) {
    content = newContent;
    modified = true;
  }

  // Remover uso de PerformanceMetrics
  const debugUsagePattern = /<PerformanceMetrics\s*\/>\s*\n?/g;
  const finalContent = content.replace(debugUsagePattern, '');
  if (finalContent !== content) {
    content = finalContent;
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

// Ejecutar limpieza
const srcPath = path.join(__dirname, '..', 'src');
const allFiles = getAllFiles(srcPath);

let cleanedFiles = 0;
let debugRemovedFiles = 0;

console.log(`📁 Procesando ${allFiles.length} archivos...\n`);

allFiles.forEach(filePath => {
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Limpiar logs de consola
  if (cleanConsoleLogs(filePath)) {
    console.log(`🧹 Logs limpiados: ${relativePath}`);
    cleanedFiles++;
  }
  
  // Remover componentes de debug
  if (removeDebugImports(filePath)) {
    console.log(`🔧 Debug removido: ${relativePath}`);
    debugRemovedFiles++;
  }
});

console.log(`\n✅ Limpieza completada:`);
console.log(`   📄 ${cleanedFiles} archivos con logs limpiados`);
console.log(`   🔧 ${debugRemovedFiles} archivos con debug removido`);

// Verificar que no queden logs críticos
console.log('\n🔍 Verificando limpieza...');
const remainingLogs = [];

allFiles.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    if (line.match(/console\.(log|warn)/)) {
      const relativePath = path.relative(process.cwd(), filePath);
      remainingLogs.push(`${relativePath}:${index + 1} - ${line.trim()}`);
    }
  });
});

if (remainingLogs.length > 0) {
  console.log('\n⚠️  Logs restantes encontrados:');
  remainingLogs.forEach(log => console.log(`   ${log}`));
} else {
  console.log('✅ No se encontraron logs restantes');
}

console.log('\n🎉 Limpieza para producción completada!');