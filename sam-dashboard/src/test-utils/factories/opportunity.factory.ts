/**
 * Test factory for Opportunity entities.
 *
 * Uses types from the OpenAPI generated types via the domain component export.
 */
import type {Opportunity} from '@/components/domain/opportunity/Opportunity.types';

/**
 * Default values for an Opportunity entity.
 * All fields are optional per the OpenAPI schema.
 */
const defaultOpportunity: Opportunity = {
    id: '1',
    title: 'Test Opportunity',
    solicitationNumber: 'SOL-001',
    description: 'Test opportunity description',
    postedDate: '2024-01-15',
    responseDeadline: '2024-12-31',
    archiveDate: undefined,
    naicsCode: '541512',
    naicsDescription: 'Computer Systems Design Services',
    pscCode: undefined,
    type: 'Solicitation',
    typeDescription: undefined,
    url: 'https://sam.gov/opp/1',
    agency: 'Department of Defense',
    agencyCode: 'DOD',
    subAgency: undefined,
    office: undefined,
    setAsideType: undefined,
    setAsideDescription: undefined,
    placeOfPerformanceCity: undefined,
    placeOfPerformanceState: undefined,
    placeOfPerformanceCountry: 'USA',
    placeOfPerformanceZip: undefined,
    awardAmount: undefined,
    estimatedValueLow: undefined,
    estimatedValueHigh: undefined,
    contractType: undefined,
    contractNumber: undefined,
    incumbentContractor: undefined,
    isRecoveryAct: false,
    sbirPhase: undefined,
    isSbir: false,
    isSttr: false,
    primaryContactName: undefined,
    primaryContactEmail: undefined,
    primaryContactPhone: undefined,
    secondaryContactName: undefined,
    secondaryContactEmail: undefined,
    source: 'SAM.gov',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    isPastDeadline: false,
    isClosingSoon: false,
    daysUntilDeadline: 30,
};

/**
 * Creates a mock Opportunity object with optional overrides.
 *
 * @param overrides - Partial Opportunity properties to override defaults
 * @returns A fully typed Opportunity object
 *
 * @example
 * const opp = createMockOpportunity({ title: 'New Contract', agency: 'NASA' });
 */
export function createMockOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
    return {
        ...defaultOpportunity,
        ...overrides,
    };
}

/**
 * Creates multiple mock Opportunities with unique IDs.
 *
 * @param count - Number of opportunities to create
 * @param overrides - Partial Opportunity properties applied to all
 * @returns Array of Opportunity objects
 */
export function createMockOpportunities(
    count: number,
    overrides: Partial<Opportunity> = {}
): Opportunity[] {
    return Array.from({length: count}, (_, index) =>
        createMockOpportunity({
            id: `opp-${index + 1}`,
            title: `Opportunity ${index + 1}`,
            solicitationNumber: `SOL-${String(index + 1).padStart(3, '0')}`,
            ...overrides,
        })
    );
}

/**
 * Creates an SBIR opportunity.
 */
export function createMockSbirOpportunity(
    overrides: Partial<Opportunity> = {}
): Opportunity {
    return createMockOpportunity({
        isSbir: true,
        isSttr: false,
        sbirPhase: 'I',
        type: 'SBIR',
        source: 'SBIR.gov',
        ...overrides,
    });
}

/**
 * Creates an STTR opportunity.
 */
export function createMockSttrOpportunity(
    overrides: Partial<Opportunity> = {}
): Opportunity {
    return createMockOpportunity({
        isSbir: false,
        isSttr: true,
        sbirPhase: 'I',
        type: 'STTR',
        source: 'SBIR.gov',
        ...overrides,
    });
}

/**
 * Creates an opportunity that is past its deadline.
 */
export function createMockExpiredOpportunity(
    overrides: Partial<Opportunity> = {}
): Opportunity {
    return createMockOpportunity({
        status: 'CLOSED',
        isPastDeadline: true,
        responseDeadline: '2023-01-01',
        ...overrides,
    });
}

export type {Opportunity};
