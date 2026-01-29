/**
 * Contact types used across both systems.
 *
 * **Face One (Contract Intelligence):**
 * - GOVERNMENT_CUSTOMER - Agency contacts for BD/capture
 * - CONTRACTING_OFFICER - Government COs
 * - CONTRACTING_SPECIALIST - Government contracting specialists
 * - PROGRAM_MANAGER - Government PMs
 * - TECHNICAL_POC - Government technical points of contact
 * - COR - Contracting Officer's Representative
 * - TEAMING_PARTNER - Partners for teaming on bids
 * - CONSULTANT - External consultants
 * - PROSPECT - Potential customers
 * - INTERNAL - DoctrineOne Labs internal staff
 *
 * **Face Two (Portal):**
 * - GOVERNMENT_CUSTOMER - Client agency contacts
 * - PRIME_CONTRACTOR - Prime contractor on client's contract
 * - SUBCONTRACTOR - Subcontractors on client's contract
 * - VENDOR - Vendors for client projects
 *
 * **Shared:** INTERNAL (DoctrineOne Labs staff in both systems)
 */
export type ContactType =
    | 'GOVERNMENT_CUSTOMER'
    | 'CONTRACTING_OFFICER'
    | 'CONTRACTING_SPECIALIST'
    | 'PROGRAM_MANAGER'
    | 'TECHNICAL_POC'
    | 'COR'
    | 'PRIME_CONTRACTOR'
    | 'SUBCONTRACTOR'
    | 'TEAMING_PARTNER'
    | 'VENDOR'
    | 'CONSULTANT'
    | 'PROSPECT'
    | 'INTERNAL'
    | 'OTHER';

export type ContactStatus = 'ACTIVE' | 'INACTIVE' | 'DO_NOT_CONTACT' | 'ARCHIVED';

/**
 * Contact entity used in both Face One (Contract Intelligence) and Face Two (Portal).
 *
 * **Face One (Contract Intelligence):** Tracks contacts at government agencies, competitor companies,
 * teaming partners, and prospects for business development and capture management.
 *
 * **Face Two (Portal):** Tracks contacts at client organizations for contract execution and communication.
 *
 * @see ContactType for which types belong to which system
 */
export interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    middleName: string | null;
    prefix: string | null;
    suffix: string | null;
    nickname: string | null;
    contactType: ContactType;
    status: ContactStatus;
    jobTitle: string | null;
    department: string | null;
    roleDescription: string | null;
    email: string | null;
    emailSecondary: string | null;
    phoneWork: string | null;
    phoneMobile: string | null;
    phoneFax: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    country: string | null;
    linkedinUrl: string | null;
    website: string | null;
    preferredContactMethod: string | null;
    bestTimeToContact: string | null;
    timezone: string | null;
    tags: string | null;
    notes: string | null;
    relationshipScore: number | null;
    lastContactDate: string | null;
    nextFollowupDate: string | null;
    followupNotes: string | null;
    source: string | null;
    referralSource: string | null;
    photoUrl: string | null;
    organizationId: string | null;
    organizationName: string | null;
    ownerId: string | null;
    ownerName: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateContactRequest {
    firstName: string;
    lastName: string;
    middleName?: string;
    prefix?: string;
    suffix?: string;
    nickname?: string;
    contactType: ContactType;
    status?: ContactStatus;
    jobTitle?: string;
    department?: string;
    roleDescription?: string;
    email?: string;
    emailSecondary?: string;
    phoneWork?: string;
    phoneMobile?: string;
    phoneFax?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    linkedinUrl?: string;
    website?: string;
    preferredContactMethod?: string;
    bestTimeToContact?: string;
    timezone?: string;
    tags?: string;
    notes?: string;
    organizationId?: string;
    ownerId?: string;
}

export type UpdateContactRequest = Partial<CreateContactRequest>;

export interface ContactFilters {
    search?: string;
    contactType?: ContactType;
    status?: ContactStatus;
    organizationId?: string;
}
