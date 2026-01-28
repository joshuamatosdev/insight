import type {Contact, ContactStatus, ContactType, CreateContactRequest} from '../../../types/crm';

export interface ContactFormProps {
    contact?: Contact;
    onSubmit: (data: CreateContactRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export interface ContactFormData {
    firstName: string;
    lastName: string;
    middleName: string;
    prefix: string;
    suffix: string;
    contactType: ContactType;
    status: ContactStatus;
    jobTitle: string;
    department: string;
    email: string;
    emailSecondary: string;
    phoneWork: string;
    phoneMobile: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    linkedinUrl: string;
    website: string;
    notes: string;
    tags: string;
}

export interface ContactFormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    contactType?: string;
}
