/**
 * Theme options for user preferences
 */
export type Theme = 'LIGHT' | 'DARK' | 'SYSTEM';

/**
 * User preferences from the API
 */
export interface UserPreferences {
  id: string;
  userId: string;
  theme: Theme;
  emailNotifications: boolean;
  dashboardLayout: string | null;
  timezone: string;
  language: string;
}

/**
 * Request payload for updating preferences
 */
export interface UpdatePreferencesRequest {
  theme?: Theme;
  emailNotifications?: boolean;
  dashboardLayout?: string;
  timezone?: string;
  language?: string;
}

/**
 * Form state for settings page
 */
export interface SettingsFormState {
  theme: Theme;
  emailNotifications: boolean;
  timezone: string;
}

/**
 * Props for SettingsPage component
 */
export interface SettingsPageProps {
  /**
   * Optional callback when settings are saved successfully
   */
  onSaveSuccess?: () => void;
}
