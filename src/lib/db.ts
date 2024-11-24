// Ajoutez ces fonctions pour gérer les posters dans Firestore
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Poster } from '../types';
import { uploadImage } from './storage';

export const createPoster = async (data: Omit<Poster, 'id'>, file?: File): Promise<Poster> => {
  try {
    let imageUrl = data.imageUrl;
    
    // Si un fichier est fourni, uploadez-le d'abord
    if (file) {
      imageUrl = await uploadImage(file, 'posters');
    }

    const posterData = {
      ...data,
      imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true
    };

    const docRef = await addDoc(collection(db, 'posters'), posterData);
    return { id: docRef.id, ...posterData };
  } catch (error) {
    console.error('Error creating poster:', error);
    throw error;
  }
};

export const updatePoster = async (id: string, data: Partial<Poster>, file?: File): Promise<void> => {
  try {
    let imageUrl = data.imageUrl;
    
    // Si un fichier est fourni, uploadez-le d'abord
    if (file) {
      imageUrl = await uploadImage(file, 'posters');
    }

    const posterRef = doc(db, 'posters', id);
    await updateDoc(posterRef, {
      ...data,
      ...(imageUrl && { imageUrl }),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating poster:', error);
    throw error;
  }
};

export const deletePoster = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'posters', id));
  } catch (error) {
    console.error('Error deleting poster:', error);
    throw error;
  }
};