// ... existing types ...

export interface OrganizationSettings {
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
}

export interface Organization {
  id: string;
  name: string;
  domain: string;
  settings: OrganizationSettings;
  createdAt: string;
  updatedAt?: string;
}