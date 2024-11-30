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
  appSettings?: {
    title: string;
    icon: string;
    description: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface HistoryRecord {
  id: string;
  type: 'reservation' | 'maintenance' | 'poster_change' | 'stock_update' | 'publication_association';
  date: string;
  performedBy: string;
  details: {
    action: string;
    previousState?: any;
    newState?: any;
    notes?: string;
  };
}

export interface DisplayStand {
  id: string;
  name: string;
  location: string;
  imageUrl?: string;
  currentPoster?: string;
  isReserved: boolean;
  reservedBy?: string;
  reservedUntil?: string;
  isPerpetual?: boolean;
  organizationId: string;
  maintenanceHistory: MaintenanceRecord[];
  publications: PublicationRecord[];
  history: HistoryRecord[];
  createdAt: string;
  lastUpdated: string;
  lastMaintenance?: string;
}

export interface MaintenanceRecord {
  id: string;
  type: 'preventive' | 'curative';
  date: string;
  performedBy: string;
  description: string;
  issues?: string;
  resolution?: string;
  status: 'pending' | 'completed' | 'cancelled';
  canBeReserved?: boolean;
}

export interface PublicationRecord {
  publicationId: string;
  quantity: number;
  lastUpdated: string;
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

export interface Poster {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  category: string;
  isActive: boolean;
  organizationId: string;
}