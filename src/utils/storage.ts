import { DisplayStand } from '../types';

const STORAGE_KEY = 'display-stands';

export const loadStands = (): DisplayStand[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const stands = JSON.parse(data);
    return stands.map((stand: any) => ({
      ...stand,
      lastUpdated: new Date(stand.lastUpdated),
      reservedUntil: stand.reservedUntil ? new Date(stand.reservedUntil) : undefined
    }));
  } catch (error) {
    console.error('Error loading stands:', error);
    return [];
  }
};

export const saveStands = (stands: DisplayStand[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stands));
  } catch (error) {
    console.error('Error saving stands:', error);
  }
};