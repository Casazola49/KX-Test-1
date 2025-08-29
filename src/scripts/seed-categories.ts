// Script para crear categorías básicas en Firebase
import { db } from '../lib/firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { COLLECTIONS } from '../lib/firebase-collections';

const basicCategories = [
  { id: 'senior', name: 'Senior', description: 'Categoría Senior' },
  { id: 'junior', name: 'Junior', description: 'Categoría Junior' },
  { id: 'master', name: 'Master', description: 'Categoría Master' },
  { id: 'novatos', name: 'Novatos', description: 'Categoría Novatos' },
  { id: 'pro', name: 'Pro', description: 'Categoría Profesional' }
];

export async function seedCategories() {
  try {
    console.log('🏁 Creando categorías básicas...');
    
    // Verificar si ya existen categorías
    const snapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    
    if (snapshot.size > 0) {
      console.log(`✅ Ya existen ${snapshot.size} categorías en la base de datos`);
      return { success: true, message: `${snapshot.size} categorías ya existen` };
    }
    
    // Crear las categorías básicas
    for (const category of basicCategories) {
      const docRef = doc(db, COLLECTIONS.CATEGORIES, category.id);
      await setDoc(docRef, {
        ...category,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    console.log(`✅ ${basicCategories.length} categorías creadas exitosamente`);
    return { success: true, message: `${basicCategories.length} categorías creadas` };
    
  } catch (error) {
    console.error('❌ Error creando categorías:', error);
    throw error;
  }
}

// Función para verificar categorías existentes
export async function listCategories() {
  try {
    const snapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log('📋 Categorías existentes:');
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat.id})`);
    });
    
    return categories;
  } catch (error) {
    console.error('❌ Error listando categorías:', error);
    return [];
  }
}