import type {
    BusinessSize,
    CreateOrganizationRequest,
    Organization,
    OrganizationStatus,
    OrganizationType
} from '../../../types/crm';

export interface OrganizationFormProps {
    organization?: Organization;
    onSubmit: (data: CreateOrganizationRequest) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

export interface OrganizationFormData {
    name: string;
    legalName: string;
    dbaName: string;
    organizationType: OrganizationType;
    status: OrganizationStatus;
    businessSize: BusinessSize | '';
    uei: string;
    cageCode: string;
    phone: string;
    email: string;
    website: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    naicsCodes: string;
    primaryNaics: string;
    capabilities: string;
    notes: string;
    tags: string;
}

export interface OrganizationFormErrors {
    name?: string;
    organizationType?: string;
}
