/**
 * Types for the Alerts Page
 */

/**
 * Opportunity Alert (Intelligence Users)
 * Used for monitoring new contract opportunities matching criteria
 */
export interface OpportunityAlert {
    id: string;
    name: string;
    description: string | null;
    naicsCodes: string[];
    keywords: string[];
    minValue: number | null;
    maxValue: number | null;
    enabled: boolean;
    lastCheckedAt: string | null;
    lastMatchCount: number | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Contract Alert Type (Portal Users)
 */
export type ContractAlertType =
    | 'DELIVERABLE_DUE'
    | 'MILESTONE_APPROACHING'
    | 'INVOICE_OVERDUE'
    | 'CONTRACT_EXPIRING';

/**
 * Contract Alert (Portal Users)
 * Used for monitoring contract execution events
 */
export interface ContractAlert {
    id: string;
    name: string;
    description: string | null;
    alertType: ContractAlertType;
    contractId: string | null;
    contractName: string | null;
    daysBeforeReminder: number;
    enabled: boolean;
    lastTriggeredAt: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Contract alert form state
 */
export interface ContractAlertFormState {
    name: string;
    description: string;
    alertType: ContractAlertType;
    contractId: string;
    daysBeforeReminder: string;
    enabled: boolean;
}

/**
 * Contract alert form errors
 */
export interface ContractAlertFormErrors {
    name?: string;
    alertType?: string;
    contractId?: string;
    daysBeforeReminder?: string;
    general?: string;
}

export interface AlertFormState {
    name: string;
    description: string;
    naicsCodes: string[];
    keywords: string[];
    minValue: string;
    maxValue: string;
    enabled: boolean;
}

export interface AlertFormErrors {
    name?: string;
    naicsCodes?: string;
    keywords?: string;
    minValue?: string;
    maxValue?: string;
    general?: string;
}

export interface CreateAlertRequest {
    name: string;
    description?: string;
    naicsCodes?: string[];
    keywords?: string[];
    minValue?: number;
    maxValue?: number;
    enabled?: boolean;
}

export interface UpdateAlertRequest {
    name?: string;
    description?: string;
    naicsCodes?: string[];
    keywords?: string[];
    minValue?: number;
    maxValue?: number;
    enabled?: boolean;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
}
