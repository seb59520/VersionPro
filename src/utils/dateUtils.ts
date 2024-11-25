import { format, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatDateSafely = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return 'Non spécifié';
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (!isValid(date)) return 'Date invalide';
    return format(date, 'PPP', { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date invalide';
  }
};

export const toISODateSafely = (dateString: string | Date | undefined | null): string => {
  if (!dateString) return new Date().toISOString();
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return isValid(date) ? date.toISOString() : new Date().toISOString();
  } catch (error) {
    console.error('Error converting to ISO date:', error);
    return new Date().toISOString();
  }
};