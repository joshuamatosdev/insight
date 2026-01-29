/**
 * UI label constants for consistent text across components and tests.
 * Single source of truth to prevent test brittleness from text changes.
 */

export const PORTAL_LABELS = {
    DASHBOARD_TITLE: 'Client Dashboard',
    DASHBOARD_WELCOME: "Welcome back! Here's your contract portfolio overview.",
    EXPORT_REPORT_BUTTON: 'Export Report',
    NEW_SUBMISSION_BUTTON: 'New Submission',
    ACTIVE_CONTRACTS: 'Active Contracts',
    PENDING_INVOICES: 'Pending Invoices',
    UPCOMING_DEADLINES: 'Upcoming Deadlines',
    TOTAL_CONTRACT_VALUE: 'Total Contract Value',
    INVOICE_SUMMARY: 'Invoice Summary',
    DELIVERABLE_TRACKER: 'Deliverable Tracker',
} as const;

export const CONTRACT_INTEL_LABELS = {
    // Future: Contract Intelligence labels
} as const;

export const SHARED_LABELS = {
    // Future: Shared labels between systems
} as const;
