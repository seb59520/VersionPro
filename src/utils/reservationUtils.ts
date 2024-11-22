import { DisplayStand } from '../types';

export const isDateConflict = (
  startDate: Date,
  endDate: Date,
  existingStartDate: Date,
  existingEndDate: Date
): boolean => {
  return (
    (startDate <= existingEndDate && endDate >= existingStartDate) ||
    (existingStartDate <= endDate && existingEndDate >= startDate)
  );
};

export const validateReservationPeriod = (
  startDate: Date,
  endDate: Date,
  maxDuration: number = 30 // durée maximale en jours
): string | null => {
  const now = new Date();
  const maxDate = new Date(now.getTime() + maxDuration * 24 * 60 * 60 * 1000);

  if (startDate < now) {
    return "La date de début doit être dans le futur";
  }

  if (endDate < startDate) {
    return "La date de fin doit être après la date de début";
  }

  if (endDate > maxDate) {
    return `La durée maximale de réservation est de ${maxDuration} jours`;
  }

  return null;
};