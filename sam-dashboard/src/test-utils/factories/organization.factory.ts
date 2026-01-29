/**
 * Test factory for Organization entities.
 *
 * Uses types from @/types/crm to ensure test mocks match the actual type definitions.
 */
import type {Organization, OrganizationType, OrganizationStatus, BusinessSize} from '@/types/crm';

/**
 * Default values for an Organization entity.
 * All nullable fields default to null for consistency.
 */
const defaultOrganization: Organization = {
    id: '1',
    name: 'Acme Corp',
    legalName: null,
    dbaName: null,
    organizationType: 'PRIME_CONTRACTOR',
    status: 'ACTIVE',
    businessSize: null,
    uei: 'ACME123456789',
    cageCode: 'ABC12',
    duns: null,
    taxId: null,
    agencyCode: null,
    parentAgency: null,
    naicsCodes: null,
    pscCodes: null,
    primaryNaics: null,
    phone: null,
    fax: null,
    email: null,
    website: null,
    addressLine1: null,
    addressLine2: null,
    city: 'Washington',
    state: 'DC',
    postalCode: null,
    country: null,
    capabilities: null,
    coreCompetencies: null,
    pastPerformanceSummary: null,
    certifications: null,
    contractVehicles: null,
    relationshipTier: null,
    relationshipScore: null,
    annualRevenue: null,
    employeeCount: null,
    yearFounded: null,
    tags: null,
    notes: null,
    logoUrl: null,
    parentOrganizationId: null,
    parentOrganizationName: null,
    ownerId: null,
    ownerName: null,
    contactCount: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
};

/**
 * Creates a mock Organization object with optional overrides.
 *
 * @param overrides - Partial Organization properties to override defaults
 * @returns A fully typed Organization object
 *
 * @example
 * const org = createMockOrganization({ name: 'Test Corp', uei: 'TEST123' });
 */
export function createMockOrganization(overrides: Partial<Organization> = {}): Organization {
    return {
        ...defaultOrganization,
        ...overrides,
    };
}

/**
 * Creates multiple mock Organizations with unique IDs.
 *
 * @param count - Number of organizations to create
 * @param overrides - Partial Organization properties applied to all
 * @returns Array of Organization objects
 */
export function createMockOrganizations(
    count: number,
    overrides: Partial<Organization> = {}
): Organization[] {
    return Array.from({length: count}, (_, index) =>
        createMockOrganization({
            id: `org-${index + 1}`,
            name: `Organization ${index + 1}`,
            uei: `UEI${String(index + 1).padStart(9, '0')}`,
            ...overrides,
        })
    );
}

/**
 * Creates a government agency organization.
 */
export function createMockGovernmentAgency(
    overrides: Partial<Organization> = {}
): Organization {
    return createMockOrganization({
        organizationType: 'GOVERNMENT_AGENCY',
        agencyCode: 'DOD',
        parentAgency: 'Department of Defense',
        ...overrides,
    });
}

/**
 * Creates a vendor organization.
 */
export function createMockVendor(
    overrides: Partial<Organization> = {}
): Organization {
    return createMockOrganization({
        organizationType: 'VENDOR',
        businessSize: 'SMALL',
        ...overrides,
    });
}

export type {Organization, OrganizationType, OrganizationStatus, BusinessSize};
