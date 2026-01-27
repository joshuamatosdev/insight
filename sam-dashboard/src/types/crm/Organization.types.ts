export type OrganizationType =
  | 'GOVERNMENT_AGENCY'
  | 'GOVERNMENT_OFFICE'
  | 'PRIME_CONTRACTOR'
  | 'SUBCONTRACTOR'
  | 'TEAMING_PARTNER'
  | 'VENDOR'
  | 'COMPETITOR'
  | 'PROSPECT'
  | 'CUSTOMER'
  | 'OTHER';

export type OrganizationStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PROSPECT'
  | 'DO_NOT_CONTACT'
  | 'ARCHIVED';

export type BusinessSize =
  | 'LARGE'
  | 'SMALL'
  | 'SMALL_DISADVANTAGED'
  | 'HUBZONE_SMALL'
  | 'WOSB'
  | 'SDVOSB'
  | 'VOSB'
  | 'UNKNOWN';

export interface Organization {
  id: string;
  name: string;
  legalName: string | null;
  dbaName: string | null;
  organizationType: OrganizationType;
  status: OrganizationStatus;
  businessSize: BusinessSize | null;
  uei: string | null;
  cageCode: string | null;
  duns: string | null;
  taxId: string | null;
  agencyCode: string | null;
  parentAgency: string | null;
  naicsCodes: string | null;
  pscCodes: string | null;
  primaryNaics: string | null;
  phone: string | null;
  fax: string | null;
  email: string | null;
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  capabilities: string | null;
  coreCompetencies: string | null;
  pastPerformanceSummary: string | null;
  certifications: string | null;
  contractVehicles: string | null;
  relationshipTier: string | null;
  relationshipScore: number | null;
  annualRevenue: string | null;
  employeeCount: number | null;
  yearFounded: number | null;
  tags: string | null;
  notes: string | null;
  logoUrl: string | null;
  parentOrganizationId: string | null;
  parentOrganizationName: string | null;
  ownerId: string | null;
  ownerName: string | null;
  contactCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrganizationRequest {
  name: string;
  legalName?: string;
  dbaName?: string;
  organizationType: OrganizationType;
  status?: OrganizationStatus;
  businessSize?: BusinessSize;
  uei?: string;
  cageCode?: string;
  duns?: string;
  taxId?: string;
  agencyCode?: string;
  parentAgency?: string;
  naicsCodes?: string;
  pscCodes?: string;
  primaryNaics?: string;
  phone?: string;
  fax?: string;
  email?: string;
  website?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  capabilities?: string;
  coreCompetencies?: string;
  pastPerformanceSummary?: string;
  certifications?: string;
  contractVehicles?: string;
  relationshipTier?: string;
  annualRevenue?: string;
  employeeCount?: number;
  yearFounded?: number;
  tags?: string;
  notes?: string;
  parentOrganizationId?: string;
  ownerId?: string;
}

export type UpdateOrganizationRequest = Partial<CreateOrganizationRequest>;

export interface OrganizationFilters {
  search?: string;
  organizationType?: OrganizationType;
  status?: OrganizationStatus;
  businessSize?: BusinessSize;
}
