import { useState, useCallback, useEffect, ChangeEvent } from 'react';
import { Card, CardHeader, CardBody, Flex, Stack, Box } from '../components/layout';
import { Text, Button, Select } from '../components/primitives';
import { useAuth } from '../auth';
import type {
  Theme,
  UserPreferences,
  UpdatePreferencesRequest,
  SettingsFormState,
  SettingsPageProps,
} from './SettingsPage.types';

/**
 * Common timezone options
 */
const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'UTC', label: 'UTC' },
];

/**
 * Theme options for the selector
 */
const THEME_OPTIONS = [
  { value: 'LIGHT', label: 'Light' },
  { value: 'DARK', label: 'Dark' },
  { value: 'SYSTEM', label: 'System Default' },
];

/**
 * Fetches user preferences from the API
 */
async function fetchPreferences(token: string): Promise<UserPreferences> {
  const response = await fetch('/api/v1/preferences', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.ok === false) {
    throw new Error('Failed to fetch preferences');
  }

  return response.json();
}

/**
 * Updates user preferences via the API
 */
async function updatePreferences(
  token: string,
  request: UpdatePreferencesRequest
): Promise<UserPreferences> {
  const response = await fetch('/api/v1/preferences', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (response.ok === false) {
    throw new Error('Failed to update preferences');
  }

  return response.json();
}

/**
 * Settings page component for user preferences
 */
export function SettingsPage({ onSaveSuccess }: SettingsPageProps): React.ReactElement {
  const { token } = useAuth();

  const [form, setForm] = useState<SettingsFormState>({
    theme: 'SYSTEM',
    emailNotifications: true,
    timezone: 'America/New_York',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalForm, setOriginalForm] = useState<SettingsFormState | null>(null);

  // Load preferences on mount
  useEffect(() => {
    if (token === null) {
      return;
    }

    const loadPreferences = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);
        const preferences = await fetchPreferences(token);
        const formState: SettingsFormState = {
          theme: preferences.theme,
          emailNotifications: preferences.emailNotifications,
          timezone: preferences.timezone,
        };
        setForm(formState);
        setOriginalForm(formState);
      } catch (err) {
        setError('Failed to load preferences. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadPreferences();
  }, [token]);

  // Track changes
  useEffect(() => {
    if (originalForm === null) {
      setHasChanges(false);
      return;
    }

    const changed =
      form.theme !== originalForm.theme ||
      form.emailNotifications !== originalForm.emailNotifications ||
      form.timezone !== originalForm.timezone;

    setHasChanges(changed);
  }, [form, originalForm]);

  const handleThemeChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as Theme;
    setForm((prev) => ({ ...prev, theme: value }));
    setSuccessMessage(null);
  }, []);

  const handleTimezoneChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, timezone: value }));
    setSuccessMessage(null);
  }, []);

  const handleEmailNotificationsToggle = useCallback(() => {
    setForm((prev) => ({ ...prev, emailNotifications: prev.emailNotifications === false }));
    setSuccessMessage(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (token === null) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const request: UpdatePreferencesRequest = {
        theme: form.theme,
        emailNotifications: form.emailNotifications,
        timezone: form.timezone,
      };

      const updatedPreferences = await updatePreferences(token, request);

      const formState: SettingsFormState = {
        theme: updatedPreferences.theme,
        emailNotifications: updatedPreferences.emailNotifications,
        timezone: updatedPreferences.timezone,
      };
      setOriginalForm(formState);
      setHasChanges(false);
      setSuccessMessage('Settings saved successfully!');

      if (onSaveSuccess !== undefined) {
        onSaveSuccess();
      }
    } catch (err) {
      setError('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [token, form, onSaveSuccess]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ padding: 'var(--spacing-8)' }}>
        <Text variant="body">Loading preferences...</Text>
      </Flex>
    );
  }

  return (
    <Box style={{ padding: 'var(--spacing-6)', maxWidth: '600px', margin: '0 auto' }}>
      <Stack spacing="var(--spacing-6)">
        <Text variant="heading3">Settings</Text>

        {/* Error message */}
        {error !== null && (
          <Box
            style={{
              padding: 'var(--spacing-3)',
              backgroundColor: 'var(--color-danger-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-danger)',
            }}
          >
            <Text variant="bodySmall" color="danger">
              {error}
            </Text>
          </Box>
        )}

        {/* Success message */}
        {successMessage !== null && (
          <Box
            style={{
              padding: 'var(--spacing-3)',
              backgroundColor: 'var(--color-success-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-success)',
            }}
          >
            <Text variant="bodySmall" color="success">
              {successMessage}
            </Text>
          </Box>
        )}

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <Text variant="heading5">Appearance</Text>
          </CardHeader>
          <CardBody>
            <Stack spacing="var(--spacing-4)">
              <Box>
                <Text
                  as="label"
                  variant="bodySmall"
                  weight="medium"
                  style={{
                    display: 'block',
                    marginBottom: 'var(--spacing-2)',
                  }}
                >
                  Theme
                </Text>
                <Select
                  value={form.theme}
                  onChange={handleThemeChange}
                  options={THEME_OPTIONS}
                  fullWidth
                />
                <Text
                  variant="caption"
                  color="muted"
                  style={{ marginTop: 'var(--spacing-1)' }}
                >
                  Choose your preferred color scheme
                </Text>
              </Box>
            </Stack>
          </CardBody>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <Text variant="heading5">Notifications</Text>
          </CardHeader>
          <CardBody>
            <Stack spacing="var(--spacing-4)">
              <Flex justify="between" align="center">
                <Box>
                  <Text variant="body" weight="medium">
                    Email Notifications
                  </Text>
                  <Text variant="caption" color="muted">
                    Receive email alerts for new opportunities and deadlines
                  </Text>
                </Box>
                <Button
                  variant={form.emailNotifications ? 'primary' : 'outline'}
                  size="sm"
                  onClick={handleEmailNotificationsToggle}
                  aria-pressed={form.emailNotifications}
                >
                  {form.emailNotifications ? 'Enabled' : 'Disabled'}
                </Button>
              </Flex>
            </Stack>
          </CardBody>
        </Card>

        {/* Regional Settings */}
        <Card>
          <CardHeader>
            <Text variant="heading5">Regional</Text>
          </CardHeader>
          <CardBody>
            <Stack spacing="var(--spacing-4)">
              <Box>
                <Text
                  as="label"
                  variant="bodySmall"
                  weight="medium"
                  style={{
                    display: 'block',
                    marginBottom: 'var(--spacing-2)',
                  }}
                >
                  Timezone
                </Text>
                <Select
                  value={form.timezone}
                  onChange={handleTimezoneChange}
                  options={TIMEZONE_OPTIONS}
                  fullWidth
                />
                <Text
                  variant="caption"
                  color="muted"
                  style={{ marginTop: 'var(--spacing-1)' }}
                >
                  Used for displaying deadlines and scheduling alerts
                </Text>
              </Box>
            </Stack>
          </CardBody>
        </Card>

        {/* Save Button */}
        <Flex justify="end">
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={isSaving}
            isDisabled={isSaving || hasChanges === false}
          >
            Save Changes
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
}

export default SettingsPage;
