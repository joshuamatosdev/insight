/**
 * Organization types used across both systems.
 *
 * **Face One (Contract Intelligence):**
 * - GOVERNMENT_AGENCY - Federal/state agencies for BD targeting
 * - GOVERNMENT_OFFICE - Specific offices within agencies
 * - COMPETITOR - Competing contractors (market intelligence)
 * - PROSPECT - Potential clients
 * - TEAMING_PARTNER - Partners for teaming on bids
 *
 * **Face Two (Portal):**
 * - CUSTOMER - Client organizations (those who hired DoctrineOne Labs)
 * - PRIME_CONTRACTOR - Prime on client's contract
 * - SUBCONTRACTOR - Subs on client's contract
 * - VENDOR - Vendors for client projects
 *
 * **Shared:** TEAMING_PARTNER, VENDOR (used in both contexts)
 */
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

/**
 * Organization entity used in both Face One (Contract Intelligence) and Face Two (Portal).
 *
 * **Face One (Contract Intelligence):** Tracks government agencies, competitors, teaming partners,
 * and prospects for business development and market intelligence.
 *
 * **Face Two (Portal):** Tracks client organizations, prime contractors, subcontractors,
 * and vendors for contract execution.
 *
 * @see OrganizationType for which types belong to which system
 */
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
