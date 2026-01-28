import type {
    BillingConfig,
    PlanDetails,
    SubscribeRequest,
    Subscription,
    SubscriptionPlan,
    UpdatePlanRequest,
} from '../types/billing.types';

const API_BASE = '/api/billing';
const AUTH_STORAGE_KEY = 'sam_auth_state';

/**
 * Gets the auth token from localStorage
 */
function getAuthToken(): string | null {
    try {
        const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (stored === null) {
            return null;
        }
        const parsed = JSON.parse(stored);
        return parsed.token ?? null;
    } catch {
        return null;
    }
}

/**
 * Creates headers with auth token if available
 */
function getAuthHeaders(): HeadersInit {
    const token = getAuthToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    if (token !== null) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
}

/**
 * Authenticated fetch wrapper
 */
async function authFetch(url: string, options?: RequestInit): Promise<Response> {
    const headers = {
        ...getAuthHeaders(),
        ...options?.headers,
    };

    return fetch(url, {
        ...options,
        headers,
    });
}

/**
 * Fetch current subscription
 */
export async function fetchSubscription(): Promise<Subscription> {
    const response = await authFetch(`${API_BASE}/subscription`);
    if (response.ok === false) {
        throw new Error(`Failed to fetch subscription: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Fetch available plans
 */
export async function fetchPlans(): Promise<PlanDetails[]> {
    const response = await authFetch(`${API_BASE}/plans`);
    if (response.ok === false) {
        throw new Error(`Failed to fetch plans: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Fetch billing configuration
 */
export async function fetchBillingConfig(): Promise<BillingConfig> {
    const response = await authFetch(`${API_BASE}/config`);
    if (response.ok === false) {
        throw new Error(`Failed to fetch billing config: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Subscribe to a plan
 */
export async function subscribeToPlan(plan: SubscriptionPlan): Promise<Subscription> {
    const request: SubscribeRequest = {plan};
    const response = await authFetch(`${API_BASE}/subscribe`, {
        method: 'POST',
        body: JSON.stringify(request),
    });
    if (response.ok === false) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message ?? `Failed to subscribe: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(immediate: boolean = false): Promise<Subscription> {
    const url = `${API_BASE}/cancel?immediate=${immediate}`;
    const response = await authFetch(url, {
        method: 'POST',
    });
    if (response.ok === false) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message ?? `Failed to cancel subscription: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Update subscription plan
 */
export async function updatePlan(plan: SubscriptionPlan): Promise<Subscription> {
    const request: UpdatePlanRequest = {plan};
    const response = await authFetch(`${API_BASE}/plan`, {
        method: 'PUT',
        body: JSON.stringify(request),
    });
    if (response.ok === false) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message ?? `Failed to update plan: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Check if a plan is an upgrade from current plan
 */
export function isPlanUpgrade(currentPlan: SubscriptionPlan, newPlan: SubscriptionPlan): boolean {
    const planOrder: SubscriptionPlan[] = ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'];
    const currentIndex = planOrder.indexOf(currentPlan);
    const newIndex = planOrder.indexOf(newPlan);
    return newIndex > currentIndex;
}

/**
 * Check if a plan is a downgrade from current plan
 */
export function isPlanDowngrade(currentPlan: SubscriptionPlan, newPlan: SubscriptionPlan): boolean {
    const planOrder: SubscriptionPlan[] = ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'];
    const currentIndex = planOrder.indexOf(currentPlan);
    const newIndex = planOrder.indexOf(newPlan);
    return newIndex < currentIndex;
}

/**
 * Format price for display
 */
export function formatPrice(price: number, interval: string): string {
    if (price === 0) {
        return 'Free';
    }
    return `$${price.toFixed(2)}/${interval}`;
}

/**
 * Format date for display
 */
export function formatBillingDate(dateString: string | null): string {
    if (dateString === null) {
        return 'N/A';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}
