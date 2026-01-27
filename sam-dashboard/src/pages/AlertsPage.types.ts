/**
 * Types for the Alerts Page
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
