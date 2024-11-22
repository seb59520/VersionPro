import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, QueryConstraint } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export function useFirestore<T>(
  collectionName: string,
  initialData: T[] = [],
  cacheKey?: string
) {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setData(initialData);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, collectionName),
      where('organizationId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as T[];
        
        setData(items);
        setLoading(false);
        
        // Mettre en cache si nécessaire
        if (cacheKey) {
          localStorage.setItem(cacheKey, JSON.stringify(items));
        }
      },
      (err) => {
        console.error('Firestore error:', err);
        setError(err);
        setLoading(false);
        
        // Utiliser les données en cache si disponibles
        if (cacheKey) {
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            setData(JSON.parse(cached));
          }
        }
      }
    );

    return () => unsubscribe();
  }, [collectionName, currentUser, cacheKey]);

  return { data, loading, error };
}