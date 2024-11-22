import React, { createContext, useContext, useState, useEffect } from 'react';
import { DisplayStand, Poster, Publication } from '../types';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { cacheManager } from '../lib/cache';

interface StandsContextType {
  stands: DisplayStand[];
  setStands: React.Dispatch<React.SetStateAction<DisplayStand[]>>;
  availablePosters: Poster[];
  setAvailablePosters: React.Dispatch<React.SetStateAction<Poster[]>>;
  publications: Publication[];
  setPublications: React.Dispatch<React.SetStateAction<Publication[]>>;
  addMaintenance: (standId: string, maintenance: any) => Promise<void>;
  addStand: (standData: Omit<DisplayStand, 'id'>) => Promise<void>;
  removeStand: (standId: string) => Promise<void>;
}

const StandsContext = createContext<StandsContextType | undefined>(undefined);

export const StandsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stands, setStands] = useState<DisplayStand[]>([]);
  const [availablePosters, setAvailablePosters] = useState<Poster[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // Subscribe to stands collection
    const standsQuery = query(
      collection(db, 'stands'),
      where('organizationId', '==', currentUser.uid)
    );

    const unsubscribeStands = onSnapshot(standsQuery, async (snapshot) => {
      const standsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DisplayStand[];

      setStands(standsData);
      await cacheManager.set('stands', standsData);
    });

    // Subscribe to posters collection
    const postersQuery = query(
      collection(db, 'posters'),
      where('organizationId', '==', currentUser.uid)
    );

    const unsubscribePosters = onSnapshot(postersQuery, async (snapshot) => {
      const postersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Poster[];

      setAvailablePosters(postersData);
      await cacheManager.set('posters', postersData);
    });

    // Subscribe to publications collection
    const publicationsQuery = query(
      collection(db, 'publications'),
      where('organizationId', '==', currentUser.uid)
    );

    const unsubscribePublications = onSnapshot(publicationsQuery, async (snapshot) => {
      const publicationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Publication[];

      setPublications(publicationsData);
      await cacheManager.set('publications', publicationsData);
    });

    return () => {
      unsubscribeStands();
      unsubscribePosters();
      unsubscribePublications();
    };
  }, [currentUser]);

  const addMaintenance = async (standId: string, maintenance: any) => {
    if (!currentUser) throw new Error('User must be authenticated');

    const maintenanceData = {
      ...maintenance,
      id: crypto.randomUUID(),
      standId,
      organizationId: currentUser.uid,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'maintenance'), maintenanceData);
      
      setStands(prevStands => prevStands.map(stand => 
        stand.id === standId
          ? {
              ...stand,
              maintenanceHistory: [...(stand.maintenanceHistory || []), maintenanceData],
              lastMaintenance: maintenance.date
            }
          : stand
      ));
    } catch (error) {
      console.error('Error adding maintenance:', error);
      throw error;
    }
  };

  const addStand = async (standData: Omit<DisplayStand, 'id'>) => {
    if (!currentUser) throw new Error('User must be authenticated');

    try {
      await addDoc(collection(db, 'stands'), {
        ...standData,
        organizationId: currentUser.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding stand:', error);
      throw error;
    }
  };

  const removeStand = async (standId: string) => {
    if (!currentUser) throw new Error('User must be authenticated');

    try {
      await addDoc(collection(db, 'stands'), { id: standId });
      setStands(prevStands => prevStands.filter(stand => stand.id !== standId));
    } catch (error) {
      console.error('Error removing stand:', error);
      throw error;
    }
  };

  const value = {
    stands,
    setStands,
    availablePosters,
    setAvailablePosters,
    publications,
    setPublications,
    addMaintenance,
    addStand,
    removeStand
  };

  return (
    <StandsContext.Provider value={value}>
      {children}
    </StandsContext.Provider>
  );
};

export const useStands = () => {
  const context = useContext(StandsContext);
  if (!context) {
    throw new Error('useStands must be used within a StandsProvider');
  }
  return context;
};

export default StandsProvider;