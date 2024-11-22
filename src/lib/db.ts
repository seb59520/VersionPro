import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { DisplayStand, Maintenance, Poster, Publication } from '../types';
import { auth } from './firebase';

// Vérification de l'authentification
const checkAuth = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User must be authenticated');
  return user;
};

// Gestion des publications
export const createPublication = async (data: Omit<Publication, 'id'>) => {
  const user = checkAuth();
  const publicationsRef = collection(db, 'publications');
  
  const publicationData = {
    ...data,
    organizationId: user.uid,
    createdAt: serverTimestamp(),
    isActive: true
  };
  
  try {
    const docRef = await addDoc(publicationsRef, publicationData);
    return { id: docRef.id, ...publicationData };
  } catch (error) {
    console.error('Erreur lors de la création de la publication:', error);
    throw error;
  }
};

export const updatePublication = async (publicationId: string, data: Partial<Publication>) => {
  checkAuth();
  const publicationRef = doc(db, 'publications', publicationId);

  try {
    await updateDoc(publicationRef, {
      ...data,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la publication:', error);
    throw error;
  }
};

export const deletePublication = async (publicationId: string) => {
  checkAuth();
  const publicationRef = doc(db, 'publications', publicationId);

  try {
    await deleteDoc(publicationRef);
  } catch (error) {
    console.error('Erreur lors de la suppression de la publication:', error);
    throw error;
  }
};

// Gestion des affiches
export const createPoster = async (data: Omit<Poster, 'id'>) => {
  const user = checkAuth();
  const postersRef = collection(db, 'posters');
  
  const posterData = {
    ...data,
    organizationId: user.uid,
    createdAt: serverTimestamp(),
    isActive: true
  };
  
  try {
    const docRef = await addDoc(postersRef, posterData);
    return { id: docRef.id, ...posterData };
  } catch (error) {
    console.error('Erreur lors de la création de l\'affiche:', error);
    throw error;
  }
};

export const updatePoster = async (posterId: string, data: Partial<Poster>) => {
  checkAuth();
  const posterRef = doc(db, 'posters', posterId);

  try {
    await updateDoc(posterRef, {
      ...data,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'affiche:', error);
    throw error;
  }
};

export const deletePoster = async (posterId: string) => {
  checkAuth();
  const posterRef = doc(db, 'posters', posterId);

  try {
    await deleteDoc(posterRef);
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'affiche:', error);
    throw error;
  }
};

// Gestion des maintenances
export const addMaintenance = async (standId: string, maintenance: Maintenance) => {
  const user = checkAuth();
  const maintenanceRef = collection(db, 'maintenance');
  
  const maintenanceData = {
    ...maintenance,
    standId,
    organizationId: user.uid,
    createdAt: serverTimestamp()
  };

  try {
    const docRef = await addDoc(maintenanceRef, maintenanceData);
    return { id: docRef.id, ...maintenanceData };
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la maintenance:', error);
    throw error;
  }
};