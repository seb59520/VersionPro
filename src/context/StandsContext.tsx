import React, { createContext, useContext, useState, useEffect } from 'react';
import { DisplayStand, Poster, Publication } from '../types';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { useOrganization } from './OrganizationContext';
import { cacheManager } from '../lib/cache';
import { toast } from 'react-hot-toast';

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
  loading: boolean;
}

const StandsContext = createContext<StandsContextType | undefined>(undefined);

export const StandsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stands, setStands] = useState<DisplayStand[]>([]);
  const [availablePosters, setAvailablePosters] = useState<Poster[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const { currentOrganization } = useOrganization();

  useEffect(() => {
    if (!currentUser || !currentOrganization?.id) {
      setStands([]);
      setAvailablePosters([]);
      setPublications([]);
      setLoading(false);
      return;
    }

    // Subscribe to stands collection
    const standsQuery = query(
      collection(db, 'stands'),
      where('organizationId', '==', currentOrganization.id)
    );

    const unsubscribeStands = onSnapshot(standsQuery, async (snapshot) => {
      const standsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DisplayStand[];
      
      console.log('Loaded stands:', standsData); // Debug log
      setStands(standsData);
      await cacheManager.set('stands', standsData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching stands:', error);
      toast.error('Erreur lors du chargement des présentoirs');
      setLoading(false);
    });

    // Subscribe to posters collection
    const postersQuery = query(
      collection(db, 'posters'),
      where('organizationId', '==', currentOrganization.id)
    );

    const unsubscribePosters = onSnapshot(postersQuery, async (snapshot) => {
      const postersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Poster[];
      
      setAvailablePosters(postersData);
      await cacheManager.set('posters', postersData);
    }, (error) => {
      console.error('Error fetching posters:', error);
      toast.error('Erreur lors du chargement des affiches');
    });

    // Subscribe to publications collection
    const publicationsQuery = query(
      collection(db, 'publications'),
      where('organizationId', '==', currentOrganization.id)
    );

    const unsubscribePublications = onSnapshot(publicationsQuery, async (snapshot) => {
      const publicationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Publication[];
      
      setPublications(publicationsData);
      await cacheManager.set('publications', publicationsData);
    }, (error) => {
      console.error('Error fetching publications:', error);
      toast.error('Erreur lors du chargement des publications');
    });

    return () => {
      unsubscribeStands();
      unsubscribePosters();
      unsubscribePublications();
    };
  }, [currentUser, currentOrganization?.id]);

  const addMaintenance = async (standId: string, maintenance: any) => {
    if (!currentUser || !currentOrganization) {
      throw new Error('User must be authenticated');
    }

    const maintenanceData = {
      ...maintenance,
      id: crypto.randomUUID(),
      standId,
      organizationId: currentOrganization.id,
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
      toast.error('Erreur lors de l\'ajout de la maintenance');
      throw error;
    }
  };

  const addStand = async (standData: Omit<DisplayStand, 'id'>) => {
    if (!currentUser || !currentOrganization) {
      throw new Error('User must be authenticated');
    }

    try {
      await addDoc(collection(db, 'stands'), {
        ...standData,
        organizationId: currentOrganization.id,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding stand:', error);
      toast.error('Erreur lors de l\'ajout du présentoir');
      throw error;
    }
  };

  const removeStand = async (standId: string) => {
    if (!currentUser || !currentOrganization) {
      throw new Error('User must be authenticated');
    }

    try {
      await addDoc(collection(db, 'stands'), { id: standId });
      setStands(prevStands => prevStands.filter(stand => stand.id !== standId));
    } catch (error) {
      console.error('Error removing stand:', error);
      toast.error('Erreur lors de la suppression du présentoir');
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
    removeStand,
    loading
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