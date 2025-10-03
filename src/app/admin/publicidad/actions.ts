'use server';

import { db } from '@/lib/firebase-admin';
import { Advertisement } from '@/lib/types';
import { COLLECTIONS } from '@/lib/firebase-collections';
import { revalidatePath } from 'next/cache';

export async function getAdvertisements(): Promise<Advertisement[]> {
  try {
    // Verificar si Firebase está disponible
    if (!db) {
      console.error('Firebase not initialized');
      return [];
    }

    const snapshot = await db.collection(COLLECTIONS.ADVERTISEMENTS).orderBy('created_at', 'desc').get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Advertisement[];
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    // En lugar de lanzar error, devolver array vacío
    return [];
  }
}

export async function getAdvertisementById(id: string): Promise<Advertisement | null> {
  try {
    const doc = await db.collection(COLLECTIONS.ADVERTISEMENTS).doc(id).get();
    if (!doc.exists) return null;
    
    return {
      id: doc.id,
      ...doc.data()
    } as Advertisement;
  } catch (error) {
    console.error('Error fetching advertisement:', error);
    throw new Error('Failed to fetch advertisement');
  }
}

export async function createAdvertisement(data: Omit<Advertisement, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
  try {
    // Verificar si Firebase está disponible
    if (!db) {
      throw new Error('Firebase not initialized. Check your environment variables.');
    }

    const now = new Date().toISOString();
    const docRef = await db.collection(COLLECTIONS.ADVERTISEMENTS).add({
      ...data,
      created_at: now,
      updated_at: now
    });
    
    revalidatePath('/admin/publicidad');
    return docRef.id;
  } catch (error) {
    console.error('Error creating advertisement:', error);
    
    // Proporcionar mensajes de error más específicos
    if (error instanceof Error) {
      if (error.message.includes('Firebase')) {
        throw new Error('Error de conexión con Firebase. Verifica la configuración.');
      }
      if (error.message.includes('permission')) {
        throw new Error('Error de permisos en Firebase. Verifica las reglas de Firestore.');
      }
    }
    
    throw new Error('No se pudo crear el anuncio. Verifica la conexión a Firebase.');
  }
}

export async function updateAdvertisement(id: string, data: Partial<Advertisement>): Promise<void> {
  try {
    await db.collection(COLLECTIONS.ADVERTISEMENTS).doc(id).update({
      ...data,
      updated_at: new Date().toISOString()
    });
    
    revalidatePath('/admin/publicidad');
  } catch (error) {
    console.error('Error updating advertisement:', error);
    throw new Error('Failed to update advertisement');
  }
}

export async function deleteAdvertisement(id: string): Promise<void> {
  try {
    await db.collection(COLLECTIONS.ADVERTISEMENTS).doc(id).delete();
    revalidatePath('/admin/publicidad');
  } catch (error) {
    console.error('Error deleting advertisement:', error);
    throw new Error('Failed to delete advertisement');
  }
}

export async function toggleAdvertisementStatus(id: string, isActive: boolean): Promise<void> {
  try {
    await db.collection(COLLECTIONS.ADVERTISEMENTS).doc(id).update({
      is_active: isActive,
      updated_at: new Date().toISOString()
    });
    
    revalidatePath('/admin/publicidad');
  } catch (error) {
    console.error('Error toggling advertisement status:', error);
    throw new Error('Failed to toggle advertisement status');
  }
}

export async function getAdvertisementsBySection(section: string, type?: 'horizontal' | 'popup'): Promise<Advertisement[]> {
  try {
    let query = db.collection(COLLECTIONS.ADVERTISEMENTS)
      .where('section', '==', section)
      .where('is_active', '==', true);
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Advertisement[];
  } catch (error) {
    console.error('Error fetching advertisements by section:', error);
    throw new Error('Failed to fetch advertisements by section');
  }
}