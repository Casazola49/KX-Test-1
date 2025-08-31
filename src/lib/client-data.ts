import { db } from './firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { News } from './types';

/**
 * Funciones de datos específicas para el cliente
 * Estas funciones usan Firebase y funcionan en el navegador
 */

export async function getNewsBySlugClient(slug: string): Promise<News | null> {
  try {
    const newsRef = collection(db, 'news');
    const q = query(newsRef, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as News;
  } catch (error) {
    console.error('Error fetching news by slug:', error);
    throw new Error('Failed to fetch news');
  }
}

export async function getNewsClient(): Promise<News[]> {
  try {
    const newsRef = collection(db, 'news');
    const q = query(newsRef, orderBy('createdAt', 'desc'), limit(12));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as News[];
  } catch (error) {
    console.error('Error fetching news:', error);
    throw new Error('Failed to fetch news');
  }
}