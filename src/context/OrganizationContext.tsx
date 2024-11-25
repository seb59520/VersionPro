import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization } from '../types';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

interface OrganizationContextType {
  currentOrganization: Organization | null;
  loading: boolean;
  error: Error | null;
  setCurrentOrganization: (org: Organization | null) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setCurrentOrganization(null);
      setLoading(false);
      return;
    }

    const loadOrganization = async () => {
      try {
        // Get user document first to get organizationId
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (!userDoc.exists()) {
          setLoading(false);
          return;
        }

        const organizationId = userDoc.data().organizationId;
        if (!organizationId) {
          setLoading(false);
          return;
        }

        // Subscribe to organization document
        const unsubscribe = onSnapshot(
          doc(db, 'organizations', organizationId),
          (doc) => {
            if (doc.exists()) {
              setCurrentOrganization({ id: doc.id, ...doc.data() } as Organization);
            } else {
              setCurrentOrganization(null);
            }
            setLoading(false);
          },
          (error) => {
            console.error('Error fetching organization:', error);
            setError(error as Error);
            setLoading(false);
          }
        );

        return () => unsubscribe();
      } catch (error) {
        console.error('Error loading organization:', error);
        setError(error as Error);
        setLoading(false);
      }
    };

    loadOrganization();
  }, [currentUser]);

  const value = {
    currentOrganization,
    loading,
    error,
    setCurrentOrganization
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};