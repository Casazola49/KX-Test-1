'use client';

import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  DocumentData,
  QueryConstraint,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Hook para obtener una colección
export function useCollection(collectionName: string, constraints: QueryConstraint[] = []) {
  const [data, setData] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const collectionRef = collection(db, collectionName);
    const q = constraints.length > 0 ? query(collectionRef, ...constraints) : collectionRef;

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const documents = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convertir Timestamps a Dates para facilitar el uso
          createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
          updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
        }));
        setData(documents);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, loading, error };
}

// Hook para obtener un documento específico
export function useDocument(collectionName: string, documentId: string | null) {
  const [data, setData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) {
      setData(null);
      setLoading(false);
      return;
    }

    const docRef = doc(db, collectionName, documentId);
    
    const unsubscribe = onSnapshot(docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const docData = snapshot.data();
          setData({
            id: snapshot.id,
            ...docData,
            createdAt: docData.createdAt?.toDate?.() || docData.createdAt,
            updatedAt: docData.updatedAt?.toDate?.() || docData.updatedAt,
          });
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, documentId]);

  return { data, loading, error };
}

// Hook para operaciones CRUD
export function useFirestoreOperations(collectionName: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      setLoading(false);
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const update = async (documentId: string, data: any) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, collectionName, documentId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const remove = async (documentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, collectionName, documentId);
      await deleteDoc(docRef);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return { create, update, remove, loading, error };
}

// Utilidades para queries comunes
export const firestoreQueries = {
  // Obtener documentos recientes
  recent: (limitCount: number = 10) => [
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  ],
  
  // Filtrar por campo
  where: (field: string, operator: any, value: any) => [
    where(field, operator, value)
  ],
  
  // Combinar filtros
  whereRecent: (field: string, operator: any, value: any, limitCount: number = 10) => [
    where(field, operator, value),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  ]
};