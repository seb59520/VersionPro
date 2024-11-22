// Add to existing types
export interface Settings {
  baseUrl: string;
  maxReservationDays: number;
  minAdvanceHours: number;
  emailNotifications: {
    newReservation: boolean;
    posterRequest: boolean;
    maintenance: boolean;
  };
  maintenance: {
    preventiveIntervalMonths: number;
    emailNotifications: boolean;
  };
  assembly: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
    email?: string;
  };
}