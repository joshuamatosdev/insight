/**
 * Tenant Admin service for settings and branding
 */

const API_BASE = '/admin/tenant';

export interface TenantSettings {
    id: string;
    tenantId: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    mfaRequired: boolean;
    sessionTimeoutMinutes: number;
    passwordExpiryDays: number;
    ssoEnabled: boolean;
    ssoProvider: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface TenantBranding {
    id: string;
    tenantId: string;
    logoUrl: string | null;
    faviconUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    companyName: string | null;
    supportEmail: string | null;
    supportPhone: string | null;
    customCss: string | null;
    loginMessage: string | null;
    createdAt: string;
    updatedAt: string;
}

/**
 * Get tenant settings
 */
export async function fetchTenantSettings(token: string): Promise<TenantSettings> {
    const response = await fetch(`${API_BASE}/settings`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.ok === false) {
        throw new Error('Failed to fetch tenant settings');
    }

    return response.json();
}

/**
 * Update tenant settings
 */
export async function updateTenantSettings(
    token: string,
    settings: Partial<TenantSettings>
): Promise<TenantSettings> {
    const response = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
    });

    if (response.ok === false) {
        const error = await response.json();
        throw new Error(error.message ?? 'Failed to update settings');
    }

    return response.json();
}

/**
 * Get tenant branding
 */
export async function fetchTenantBranding(token: string): Promise<TenantBranding> {
    const response = await fetch(`${API_BASE}/branding`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    if (response.ok === false) {
        throw new Error('Failed to fetch tenant branding');
    }

    return response.json();
}

/**
 * Update tenant branding
 */
export async function updateTenantBranding(
    token: string,
    branding: Partial<TenantBranding>
): Promise<TenantBranding> {
    const response = await fetch(`${API_BASE}/branding`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(branding),
    });

    if (response.ok === false) {
        const error = await response.json();
        throw new Error(error.message ?? 'Failed to update branding');
    }

    return response.json();
}

/**
 * Get public branding (for login page)
 */
export async function fetchPublicBranding(): Promise<TenantBranding> {
    const response = await fetch(`${API_BASE}/branding/public`);

    if (response.ok === false) {
        throw new Error('Failed to fetch branding');
    }

    return response.json();
}

/**
 * Common timezone options
 */
export const TIMEZONE_OPTIONS = [
    {value: 'America/New_York', label: 'Eastern Time (ET)'},
    {value: 'America/Chicago', label: 'Central Time (CT)'},
    {value: 'America/Denver', label: 'Mountain Time (MT)'},
    {value: 'America/Los_Angeles', label: 'Pacific Time (PT)'},
    {value: 'America/Anchorage', label: 'Alaska Time (AKT)'},
    {value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)'},
    {value: 'UTC', label: 'UTC'},
];

/**
 * Date format options
 */
export const DATE_FORMAT_OPTIONS = [
    {value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (US)'},
    {value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (EU)'},
    {value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (ISO)'},
];

/**
 * Currency options
 */
export const CURRENCY_OPTIONS = [
    {value: 'USD', label: 'US Dollar (USD)'},
    {value: 'EUR', label: 'Euro (EUR)'},
    {value: 'GBP', label: 'British Pound (GBP)'},
    {value: 'CAD', label: 'Canadian Dollar (CAD)'},
];
