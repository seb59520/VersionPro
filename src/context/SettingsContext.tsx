import React, { createContext, useContext, useState, useEffect } from 'react';
import { Settings } from '../types';
import { db } from '../lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { preferencesManager } from '../lib/cache';

const defaultSettings: Settings = {
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
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setSettings(defaultSettings);
      return;
    }

    // Subscribe to settings changes in Firestore
    const unsubscribe = onSnapshot(
      doc(db, 'settings', currentUser.uid),
      (doc) => {
        if (doc.exists()) {
          setSettings(doc.data() as Settings);
          // Cache settings locally
          preferencesManager.setPreference('settings', doc.data());
        }
      },
      async (error) => {
        console.error('Error fetching settings:', error);
        // Try to load from cache if Firestore fails
        const cachedSettings = await preferencesManager.getPreference('settings');
        if (cachedSettings) {
          setSettings(cachedSettings as Settings);
        }
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!currentUser) throw new Error('User must be authenticated');

    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      await updateDoc(doc(db, 'settings', currentUser.uid), updatedSettings);
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

export default SettingsProvider;