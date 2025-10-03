import { db } from './firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { FIXED_CATEGORIES } from './categories';

export async function initializeCategories() {
  try {
    // Obtener todas las categorías existentes
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    
    // Eliminar todas las categorías existentes
    for (const categoryDoc of categoriesSnapshot.docs) {
      await deleteDoc(categoryDoc.ref);
    }
    
    // Crear solo las categorías correctas
    for (const categoryName of FIXED_CATEGORIES) {
      const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
      
      await setDoc(doc(db, 'categories', categoryId), {
        name: categoryName,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
  } catch (error) {
    console.error('Error inicializando categorías:', error);
    throw error;
  }
}

export async function ensureCategoriesExist() {
  try {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    
    // Verificar si tenemos exactamente las categorías correctas
    const existingCategories = new Set(categoriesSnapshot.docs.map(doc => doc.data().name));
    const expectedCategories = new Set(FIXED_CATEGORIES);
    
    // Si no coinciden exactamente, reinicializar
    const categoriesMatch = existingCategories.size === expectedCategories.size && 
                           [...expectedCategories].every(cat => existingCategories.has(cat));
    
    if (!categoriesMatch) {
      await initializeCategories();
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error verificando categorías:', error);
    return false;
  }
}

export async function cleanupCategories() {
  try {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    const validCategoryIds = FIXED_CATEGORIES.map(name => 
      name.toLowerCase().replace(/\s+/g, '-')
    );
    
    for (const categoryDoc of categoriesSnapshot.docs) {
      const categoryId = categoryDoc.id;
      
      if (!validCategoryIds.includes(categoryId)) {
        await deleteDoc(categoryDoc.ref);
      }
    }
    
    // Asegurar que todas las categorías válidas existan
    for (const categoryName of FIXED_CATEGORIES) {
      const categoryId = categoryName.toLowerCase().replace(/\s+/g, '-');
      
      if (!categoriesSnapshot.docs.some(doc => doc.id === categoryId)) {
        await setDoc(doc(db, 'categories', categoryId), {
          name: categoryName,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    
  } catch (error) {
    console.error('Error limpiando categorías:', error);
    throw error;
  }
}

export async function migratePilotCategories() {
  try {
    // Obtener todos los pilotos sin resolver categorías
    const pilotsSnapshot = await getDocs(collection(db, 'pilots'));
    
    let migratedCount = 0;
    let errorCount = 0;
    
    // Mapeo de IDs antiguos a nuevos IDs
    const LEGACY_CATEGORY_MAPPING: Record<string, string> = {
      'promocional': 'f200-standard',
      'profesional': '125cc-profesional',
      'infantil-65': 'infantil-6-5',
      'f390': 'f200-standard',
      'profesional-t35': '125cc-profesional',
    };
    
    for (const pilotDoc of pilotsSnapshot.docs) {
      const pilotData = pilotDoc.data();
      const pilotId = pilotDoc.id;
      
      if (pilotData.category && typeof pilotData.category === 'string') {
        const currentCategory = pilotData.category;
        
        // Si la categoría parece ser un ID largo o no está en las categorías válidas
        const isLegacyId = currentCategory.length > 20 || 
                          currentCategory.includes('-') ||
                          !FIXED_CATEGORIES.includes(currentCategory);
        
        if (isLegacyId) {
          let newCategoryId: string | null = null;
          
          // Buscar en el mapeo directo
          if (LEGACY_CATEGORY_MAPPING[currentCategory]) {
            newCategoryId = LEGACY_CATEGORY_MAPPING[currentCategory];
          } else {
            // Intentar mapear por similitud de nombre
            const lowerCategory = currentCategory.toLowerCase();
            
            if (lowerCategory.includes('f200') && lowerCategory.includes('master')) {
              newCategoryId = 'f200-master';
            } else if (lowerCategory.includes('f200') && lowerCategory.includes('super')) {
              newCategoryId = 'f200-super';
            } else if (lowerCategory.includes('f200')) {
              newCategoryId = 'f200-standard';
            } else if (lowerCategory.includes('125') || lowerCategory.includes('profesional')) {
              newCategoryId = '125cc-profesional';
            } else if (lowerCategory.includes('mini') && lowerCategory.includes('60')) {
              newCategoryId = 'mini-60';
            } else if (lowerCategory.includes('baby')) {
              newCategoryId = 'baby-kart';
            } else if (lowerCategory.includes('infantil')) {
              newCategoryId = 'infantil-6-5';
            } else if (lowerCategory.includes('vortex')) {
              newCategoryId = 'vortex-100';
            } else if (lowerCategory.includes('master') && lowerCategory.includes('x30')) {
              newCategoryId = 'master-x30';
            } else {
              newCategoryId = 'f200-standard';
            }
          }
          
          if (newCategoryId) {
            try {
              await updateDoc(doc(db, 'pilots', pilotId), {
                category: newCategoryId,
                updatedAt: new Date()
              });
              
              migratedCount++;
            } catch (error) {
              console.error(`Error migrando piloto ${pilotId}:`, error);
              errorCount++;
            }
          }
        }
      }
    }
    
    return { migratedCount, errorCount };
    
  } catch (error) {
    console.error('Error en migración de categorías de pilotos:', error);
    throw error;
  }
}