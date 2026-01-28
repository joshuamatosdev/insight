/**
 * Subscription plan types - mirrors backend Plan enum
 */
export type SubscriptionPlan = 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

/**
 * Subscription status types - mirrors backend SubscriptionStatus enum
 */
export type SubscriptionStatus =
    | 'ACTIVE'
    | 'CANCELED'
    | 'PAST_DUE'
    | 'TRIALING'
    | 'UNPAID'
    | 'INCOMPLETE'
    | 'INCOMPLETE_EXPIRED'
    | 'PAUSED';

/**
 * Current subscription state
 */
export interface Subscription {
    id: string | null;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    canceledAt: string | null;
    trialStart: string | null;
    trialEnd: string | null;
}

/**
 * Plan details with features and pricing
 */
export interface PlanDetails {
    id: SubscriptionPlan;
    name: string;
    description: string;
    price: number;
    interval: 'month' | 'year';
    features: string[];
    requiresPayment: boolean;
    stripePriceId: string | null;
}

/**
 * Billing configuration from backend
 */
export interface BillingConfig {
    publishableKey: string | null;
    configured: boolean;
}

/**
 * Request to subscribe to a plan
 */
export interface SubscribeRequest {
    plan: SubscriptionPlan;
}

/**
 * Request to update plan
 */
export interface UpdatePlanRequest {
    plan: SubscriptionPlan;
}

/**
 * Billing history entry
 */
export interface BillingHistoryEntry {
    id: string;
    date: string;
    description: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed' | 'refunded';
    invoiceUrl: string | null;
}

/**
 * Billing page state
 */
export interface BillingPageState {
    subscription: Subscription | null;
    plans: PlanDetails[];
    config: BillingConfig | null;
    isLoading: boolean;
    error: string | null;
    successMessage: string | null;
}

/**
 * Props for plan card component
 */
export interface PlanCardProps {
    plan: PlanDetails;
    currentPlan: SubscriptionPlan;
    isLoading: boolean;
    onSelect: (plan: SubscriptionPlan) => void;
}

/**
 * Props for billing page
 */
export interface BillingPageProps {
    onPlanChange?: () => void;
}

/**
 * Plan comparison for display
 */
export const PLAN_ORDER: SubscriptionPlan[] = ['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'];

/**
 * Human-readable plan names
 */
export const PLAN_NAMES: Record<SubscriptionPlan, string> = {
    FREE: 'Free',
    STARTER: 'Starter',
    PROFESSIONAL: 'Professional',
    ENTERPRISE: 'Enterprise',
};

/**
 * Status display configuration
 */
export const STATUS_DISPLAY: Record<SubscriptionStatus, {
    label: string;
    variant: 'success' | 'warning' | 'danger' | 'info'
}> = {
    ACTIVE: {label: 'Active', variant: 'success'},
    CANCELED: {label: 'Canceled', variant: 'danger'},
    PAST_DUE: {label: 'Past Due', variant: 'warning'},
    TRIALING: {label: 'Trial', variant: 'info'},
    UNPAID: {label: 'Unpaid', variant: 'danger'},
    INCOMPLETE: {label: 'Incomplete', variant: 'warning'},
    INCOMPLETE_EXPIRED: {label: 'Expired', variant: 'danger'},
    PAUSED: {label: 'Paused', variant: 'warning'},
};
