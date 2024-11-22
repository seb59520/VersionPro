import { differenceInMonths, differenceInYears, format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const getStandAge = (createdAt?: string | Date | null) => {
  if (!createdAt) return 'Date inconnue';
  
  try {
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) return 'Date invalide';

    const years = differenceInYears(new Date(), date);
    const months = differenceInMonths(new Date(), date) % 12;

    if (years > 0) {
      return `${years} an${years > 1 ? 's' : ''} ${months > 0 ? `et ${months} mois` : ''}`;
    }
    return `${months} mois`;
  } catch (error) {
    console.error('Error calculating stand age:', error);
    return 'Date invalide';
  }
};

export const getAgeStatus = (createdAt?: string | Date | null) => {
  if (!createdAt) {
    return {
      status: 'unknown',
      color: 'gray',
      label: 'Inconnu'
    };
  }

  try {
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) {
      return {
        status: 'unknown',
        color: 'gray',
        label: 'Inconnu'
      };
    }

    const months = differenceInMonths(new Date(), date);
    
    if (months < 24) {
      return {
        status: 'new',
        color: 'green',
        label: 'Neuf'
      };
    } else if (months < 48) {
      return {
        status: 'good',
        color: 'blue',
        label: 'Bon état'
      };
    } else if (months < 72) {
      return {
        status: 'aging',
        color: 'yellow',
        label: 'Vieillissant'
      };
    } else {
      return {
        status: 'old',
        color: 'red',
        label: 'À remplacer'
      };
    }
  } catch (error) {
    console.error('Error calculating age status:', error);
    return {
      status: 'unknown',
      color: 'gray',
      label: 'Inconnu'
    };
  }
};

export const formatDate = (date?: string | Date | null) => {
  if (!date) return 'Date inconnue';
  
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return 'Date invalide';
    
    return format(parsedDate, 'PP', { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Date invalide';
  }
};