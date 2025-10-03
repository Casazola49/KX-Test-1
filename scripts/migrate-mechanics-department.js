/**
 * Script de migración para actualizar mecánicos de "Servicio Internacional" a "General"
 * 
 * Este script debe ejecutarse una sola vez para migrar los datos existentes.
 * 
 * Uso: node scripts/migrate-mechanics-department.js
 */

const admin = require('firebase-admin');

// Configurar Firebase Admin (usar las credenciales del proyecto)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // O usar serviceAccountKey si tienes el archivo JSON
  });
}

const db = admin.firestore();

async function migrateMechanicsDepartment() {
  try {
    console.log('🔄 Iniciando migración de departamentos de mecánicos...');
    
    // Obtener todos los mecánicos con department = "Servicio Internacional"
    const snapshot = await db.collection('mechanics')
      .where('department', '==', 'Servicio Internacional')
      .get();
    
    if (snapshot.empty) {
      console.log('✅ No se encontraron mecánicos con "Servicio Internacional" para migrar.');
      return;
    }
    
    console.log(`📋 Encontrados ${snapshot.size} mecánicos para migrar.`);
    
    // Crear batch para actualizar todos los documentos
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      console.log(`🔄 Migrando: ${doc.data().name} (${doc.id})`);
      batch.update(doc.ref, {
        department: 'General',
        updatedAt: admin.firestore.Timestamp.now()
      });
    });
    
    // Ejecutar el batch
    await batch.commit();
    
    console.log('✅ Migración completada exitosamente!');
    console.log(`📊 ${snapshot.size} mecánicos actualizados de "Servicio Internacional" a "General"`);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
}

// Ejecutar la migración
if (require.main === module) {
  migrateMechanicsDepartment()
    .then(() => {
      console.log('🎉 Proceso de migración finalizado.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { migrateMechanicsDepartment };