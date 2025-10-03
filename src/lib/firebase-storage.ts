'use client';

import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from './firebase';

const storage = getStorage(app);

/**
 * Sube un archivo a Firebase Storage
 * @param file - Archivo a subir
 * @param folder - Carpeta destino en Storage
 * @returns URL pública del archivo subido
 */
export async function uploadToFirebaseStorage(file: File, folder: string): Promise<string> {
  try {
    console.log(`📤 Subiendo ${file.name} a Firebase Storage...`);
    
    // Crear referencia con timestamp para evitar colisiones
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `${folder}/${fileName}`);
    
    // Subir el archivo
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type || 'application/octet-stream',
    });
    
    console.log('✅ Archivo subido a Firebase Storage');
    
    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ URL obtenida:', downloadURL);
    
    return downloadURL;
  } catch (error: any) {
    console.error('❌ Error subiendo a Firebase Storage:', error);
    throw new Error(`Error al subir archivo: ${error.message}`);
  }
}

/**
 * Valida que el archivo sea un modelo 3D válido
 */
export function validateModelFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 50 * 1024 * 1024; // 50MB (aumentado para modelos 3D grandes)
  const validExtensions = ['.glb', '.gltf'];
  
  // Verificar extensión
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!validExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'El archivo debe ser .glb o .gltf'
    };
  }
  
  // Verificar tamaño
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `El archivo es muy grande (${(file.size / 1024 / 1024).toFixed(2)}MB). Máximo: 50MB`
    };
  }
  
  return { valid: true };
}
