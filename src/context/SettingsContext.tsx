import React, { createContext, useContext, useState, useEffect } from 'react';
import { OrganizationSettings } from '../types';
import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useOrganization } from './OrganizationContext';
import { preferencesManager } from '../lib/cache';

interface SettingsContextType {
  settings: OrganizationSettings;
  updateSettings: (newSettings: Partial<OrganizationSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { currentOrganization, setCurrentOrganization } = useOrganization();
  const [settings, setSettings] = useState<OrganizationSettings>(currentOrganization?.settings || {
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
    },
    assembly: {
      name: '',
      address: '',
      city: '',
      postalCode: '',
      country: '',
      phone: '',
      email: ''
    }
  });

  useEffect(() => {
    if (currentOrganization) {
      setSettings(currentOrganization.settings);
    }
  }, [currentOrganization]);

  const updateSettings = async (newSettings: Partial<OrganizationSettings>) => {
    if (!currentOrganization?.id) return;

    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      // Update organization in Firestore
      await updateDoc(doc(db, 'organizations', currentOrganization.id), {
        settings: updatedSettings
      });

      // Update local organization state
      setCurrentOrganization({
        ...currentOrganization,
        settings: updatedSettings
      });

      // Cache settings locally
      await preferencesManager.setPreference('settings', updatedSettings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
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