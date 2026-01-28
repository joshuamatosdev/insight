/**
 * Notification preferences type definitions
 */

/**
 * Digest frequency options
 */
export type DigestFrequency = 'REALTIME' | 'DAILY' | 'WEEKLY' | 'NONE';

/**
 * Notification preferences from the API
 */
export interface NotificationPreferences {
    emailEnabled: boolean;
    pushEnabled: boolean;
    opportunityAlerts: boolean;
    deadlineReminders: boolean;
    systemAlerts: boolean;
    digestFrequency: DigestFrequency;
}

/**
 * Form state for notification preferences
 */
export interface NotificationPreferencesFormState {
    emailEnabled: boolean;
    pushEnabled: boolean;
    opportunityAlerts: boolean;
    deadlineReminders: boolean;
    systemAlerts: boolean;
    digestFrequency: DigestFrequency;
}

/**
 * Props for NotificationPreferencesPage component
 */
export interface NotificationPreferencesPageProps {
    /**
     * Optional callback when preferences are saved successfully
     */
    onSaveSuccess?: () => void;
}
