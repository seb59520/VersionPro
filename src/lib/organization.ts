import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { Organization } from '../types';
import slugify from 'slugify';

// Get organization by domain
export const getOrganizationByDomain = async (domain: string): Promise<Organization | null> => {
  try {
    // First try exact domain match
    let q = query(collection(db, 'organizations'), where('domain', '==', domain));
    let snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      // If no exact match, try matching the base domain (without subdomain)
      const baseDomain = domain.split('.').slice(-2).join('.');
      q = query(collection(db, 'organizations'), where('domain', '==', baseDomain));
      snapshot = await getDocs(q);
    }
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Organization;
  } catch (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
};

// Get organization by slug
export const getOrganizationBySlug = async (slug: string): Promise<Organization | null> => {
  try {
    const q = query(collection(db, 'organizations'), where('slug', '==', slug));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Organization;
  } catch (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
};

// Create new organization
export const createOrganization = async (data: Partial<Organization>): Promise<string> => {
  try {
    const slug = slugify(data.name!, { lower: true, strict: true });
    
    // Check if slug already exists
    const existingOrg = await getOrganizationBySlug(slug);
    if (existingOrg) {
      throw new Error('Une organisation avec ce nom existe déjà');
    }

    // Check if domain already exists
    if (data.domain) {
      const existingOrgByDomain = await getOrganizationByDomain(data.domain);
      if (existingOrgByDomain) {
        throw new Error('Ce domaine est déjà utilisé par une autre organisation');
      }
    }

    const orgData = {
      ...data,
      slug,
      createdAt: serverTimestamp(),
      settings: {
        baseUrl: `${window.location.origin}/stand/`,
        maxReservationDays: 30,
        minAdvanceHours: 24,
        emailNotifications: {
          newReservation: true,
          posterRequest: true,
          maintenance: true
        },
        maintenance: {
          preventiveIntervalMonths: 3,
          emailNotifications: true
        }
      }
    };

    const docRef = await addDoc(collection(db, 'organizations'), orgData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating organization:', error);
    throw error;
  }
};

// Update organization
export const updateOrganization = async (id: string, data: Partial<Organization>): Promise<void> => {
  try {
    // If domain is being updated, check if it's already in use
    if (data.domain) {
      const existingOrg = await getOrganizationByDomain(data.domain);
      if (existingOrg && existingOrg.id !== id) {
        throw new Error('Ce domaine est déjà utilisé par une autre organisation');
      }
    }

    const orgRef = doc(db, 'organizations', id);
    await updateDoc(orgRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    throw error;
  }
};

// Get organization by ID
export const getOrganizationById = async (id: string): Promise<Organization | null> => {
  try {
    const docRef = doc(db, 'organizations', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    return { id: docSnap.id, ...docSnap.data() } as Organization;
  } catch (error) {
    console.error('Error fetching organization:', error);
    return null;
  }
};