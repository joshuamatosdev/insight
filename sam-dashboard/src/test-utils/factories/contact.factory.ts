/**
 * Test factory for Contact entities.
 *
 * Uses types from @/types/crm to ensure test mocks match the actual type definitions.
 */
import type {Contact, ContactType, ContactStatus} from '@/types/crm';

/**
 * Default values for a Contact entity.
 * All nullable fields default to null for consistency.
 */
const defaultContact: Contact = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    middleName: null,
    prefix: null,
    suffix: null,
    nickname: null,
    contactType: 'GOVERNMENT_CUSTOMER',
    status: 'ACTIVE',
    jobTitle: null,
    department: null,
    roleDescription: null,
    email: 'john.doe@example.com',
    emailSecondary: null,
    phoneWork: null,
    phoneMobile: null,
    phoneFax: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    state: null,
    postalCode: null,
    country: null,
    linkedinUrl: null,
    website: null,
    preferredContactMethod: null,
    bestTimeToContact: null,
    timezone: null,
    tags: null,
    notes: null,
    relationshipScore: null,
    lastContactDate: null,
    nextFollowupDate: null,
    followupNotes: null,
    source: null,
    referralSource: null,
    photoUrl: null,
    organizationId: null,
    organizationName: null,
    ownerId: null,
    ownerName: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
};

/**
 * Creates a mock Contact object with optional overrides.
 *
 * @param overrides - Partial Contact properties to override defaults
 * @returns A fully typed Contact object
 *
 * @example
 * const contact = createMockContact({ firstName: 'Jane', email: 'jane@example.com' });
 */
export function createMockContact(overrides: Partial<Contact> = {}): Contact {
    return {
        ...defaultContact,
        ...overrides,
    };
}

/**
 * Creates multiple mock Contacts with unique IDs.
 *
 * @param count - Number of contacts to create
 * @param overrides - Partial Contact properties applied to all contacts
 * @returns Array of Contact objects
 */
export function createMockContacts(
    count: number,
    overrides: Partial<Contact> = {}
): Contact[] {
    return Array.from({length: count}, (_, index) =>
        createMockContact({
            id: `contact-${index + 1}`,
            firstName: `Contact`,
            lastName: `${index + 1}`,
            email: `contact${index + 1}@example.com`,
            ...overrides,
        })
    );
}

/**
 * Creates a government customer contact.
 */
export function createMockGovernmentContact(
    overrides: Partial<Contact> = {}
): Contact {
    return createMockContact({
        contactType: 'GOVERNMENT_CUSTOMER',
        jobTitle: 'Program Manager',
        department: 'Acquisition',
        ...overrides,
    });
}

/**
 * Creates a vendor contact.
 */
export function createMockVendorContact(
    overrides: Partial<Contact> = {}
): Contact {
    return createMockContact({
        contactType: 'VENDOR',
        jobTitle: 'Account Manager',
        ...overrides,
    });
}

export type {Contact, ContactType, ContactStatus};
