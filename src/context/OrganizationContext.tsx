import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization } from '../types';
import { getOrganizationByDomain, getOrganizationById } from '../lib/organization';
import { useAuth } from './AuthContext';
import { preferencesManager } from '../lib/cache';

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
    const loadOrganization = async () => {
      try {
        let org: Organization | null = null;

        // Try to load from cache first
        const cachedOrg = await preferencesManager.getPreference('currentOrganization');
        if (cachedOrg) {
          org = cachedOrg;
        }

        if (!org && currentUser?.organizationId) {
          // Load organization based on user's organizationId
          org = await getOrganizationById(currentUser.organizationId);
        }

        if (!org) {
          // Try to load organization based on domain if no user org found
          const domain = window.location.hostname;
          org = await getOrganizationByDomain(domain);
        }

        if (org) {
          setCurrentOrganization(org);
          // Cache the organization
          await preferencesManager.setPreference('currentOrganization', org);
        }
      } catch (err) {
        console.error('Error loading organization:', err);
        setError(err as Error);
      } finally {
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