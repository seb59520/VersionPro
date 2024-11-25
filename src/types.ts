export interface PublicationAssociation {
  id: string;
  publicationId: string;
  standId: string;
  startDate: Date;
  endDate?: Date;
  quantity: number;
  status: 'active' | 'inactive';
  requestedBy?: string;
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

export interface PublicationRequest {
  id: string;
  publicationId: string;
  standId: string;
  requestedBy: string;
  requestDate: Date;
  startDate: Date;
  endDate?: Date;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}