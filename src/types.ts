export interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;
  logo?: string;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
  };
  settings: OrganizationSettings;
  createdAt: string;
  updatedAt?: string;
}

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

export interface User {
  id: string;
  email: string;
  displayName?: string;
  organizationId: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface DisplayStand {
  id: string;
  name: string;
  location: string;
  currentPoster: string;
  isReserved: boolean;
  reservedBy?: string;
  reservedUntil?: string;
  lastUpdated: string;
  createdAt: string;
  organizationId: string;
  maintenanceHistory: Maintenance[];
  posterRequests: PosterRequest[];
  publications: PublicationStock[];
  reservationHistory: Reservation[];
  usageHistory: UsageReport[];
}

export interface Maintenance {
  id: string;
  standId: string;
  type: 'preventive' | 'curative';
  date: string;
  performedBy: string;
  description: string;
  issues?: string;
  resolution?: string;
}

export interface PosterRequest {
  id: string;
  standId: string;
  requestedBy: string;
  requestedPoster: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface Publication {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category: string;
  isActive: boolean;
  minStock: number;
  organizationId: string;
}

export interface PublicationStock {
  publicationId: string;
  quantity: number;
  lastUpdated: string;
}

export interface Poster {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  category: string;
  isActive: boolean;
  organizationId: string;
}

export interface Reservation {
  startDate: string;
  endDate: string;
  reservedBy: string;
}

export interface UsageReport {
  date: string;
  visitorsCount: number;
  usageHours: number;
}

export interface ReservationFormData {
  name: string;
  startDate: Date;
  endDate: Date;
}