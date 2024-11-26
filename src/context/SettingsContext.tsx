import React, { createContext, useContext, useState, useEffect } from 'react';
import { OrganizationSettings } from '../types';
import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useOrganization } from './OrganizationContext';
import { preferencesManager } from '../lib/cache';
import { toast } from 'react-hot-toast';

interface SettingsContextType {
  settings: OrganizationSettings;
  updateSettings: (newSettings: Partial<OrganizationSettings>) => Promise<void>;
  loading: boolean;
}

const defaultSettings: OrganizationSettings = {
  baseUrl: window.location.origin + '/stand/',
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
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { currentOrganization } = useOrganization();
  const [settings, setSettings] = useState<OrganizationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrganization?.id) {
      setSettings(defaultSettings);
      setLoading(false);
      return;
    }

    // Subscribe to settings changes
    const unsubscribe = onSnapshot(
      doc(db, 'organizations', currentOrganization.id),
      (doc) => {
        if (doc.exists()) {
          const orgData = doc.data();
          setSettings(orgData.settings || defaultSettings);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error loading settings:', error);
        toast.error('Erreur lors du chargement des paramètres');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentOrganization?.id]);

  const updateSettings = async (newSettings: Partial<OrganizationSettings>) => {
    if (!currentOrganization?.id) {
      toast.error('Organisation non trouvée');
      return;
    }

    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      // Update Firestore
      await updateDoc(doc(db, 'organizations', currentOrganization.id), {
        settings: updatedSettings
      });

      // Update local state
      setSettings(updatedSettings);

      // Cache settings
      await preferencesManager.setPreference('settings', updatedSettings);

      toast.success('Paramètres mis à jour avec succès');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Erreur lors de la mise à jour des paramètres');
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};