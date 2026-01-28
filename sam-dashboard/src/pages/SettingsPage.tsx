import { useState, useCallback, useEffect } from 'react';
import {
  Field,
  Label,
  Description,
  FieldGroup,
  Select,
  Switch,
  SwitchField,
  Button,
  InlineAlert,
  Heading,
  Text,
  Divider,
} from '../components/catalyst';
import { Grid, GridItem, Flex, Box } from '../components/catalyst/layout';
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
 * Settings section component with two-column layout
 */
function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Grid columns={3} columnGap="xl" rowGap="lg" className="max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <GridItem>
        <Heading level={2}>{title}</Heading>
        <Text className="mt-1">{description}</Text>
      </GridItem>
      <GridItem colSpan={2}>
        <FieldGroup>{children}</FieldGroup>
      </GridItem>
    </Grid>
  );
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
      } catch {
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

  const handleThemeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as Theme;
    setForm((prev) => ({ ...prev, theme: value }));
    setSuccessMessage(null);
  }, []);

  const handleTimezoneChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, timezone: value }));
    setSuccessMessage(null);
  }, []);

  const handleEmailNotificationsToggle = useCallback((checked: boolean) => {
    setForm((prev) => ({ ...prev, emailNotifications: checked }));
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
    } catch {
      setError('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [token, form, onSaveSuccess]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" className="min-h-[300px]">
        <Text>Loading preferences...</Text>
      </Flex>
    );
  }

  return (
    <Box className="mx-auto max-w-4xl">
      <Box className="px-4 py-6 sm:px-6 lg:px-8">
        <Heading>Settings</Heading>
        <Text className="mt-1">
          Manage your account settings and preferences.
        </Text>
      </Box>

      {/* Error message */}
      {error !== null && (
        <Box className="mx-4 mb-4 sm:mx-6 lg:mx-8">
          <InlineAlert color="error" onDismiss={() => setError(null)}>
            {error}
          </InlineAlert>
        </Box>
      )}

      {/* Success message */}
      {successMessage !== null && (
        <Box className="mx-4 mb-4 sm:mx-6 lg:mx-8">
          <InlineAlert color="success" onDismiss={() => setSuccessMessage(null)}>
            {successMessage}
          </InlineAlert>
        </Box>
      )}

      <Box className="divide-y divide-border">
        {/* Appearance Settings */}
        <SettingsSection
          title="Appearance"
          description="Customize how the application looks."
        >
          <Field>
            <Label>Theme</Label>
            <Description>Choose your preferred color scheme.</Description>
            <Select
              value={form.theme}
              onChange={handleThemeChange}
              options={THEME_OPTIONS}
            />
          </Field>
        </SettingsSection>

        <Divider />

        {/* Notification Settings */}
        <SettingsSection
          title="Notifications"
          description="Configure how you receive alerts and updates."
        >
          <SwitchField>
            <Label>Email Notifications</Label>
            <Description>
              Receive email alerts for new opportunities and upcoming deadlines.
            </Description>
            <Switch
              checked={form.emailNotifications}
              onChange={handleEmailNotificationsToggle}
              color="cyan"
            />
          </SwitchField>
        </SettingsSection>

        <Divider />

        {/* Regional Settings */}
        <SettingsSection
          title="Regional"
          description="Set your timezone for accurate deadline display."
        >
          <Field>
            <Label>Timezone</Label>
            <Description>
              Used for displaying deadlines and scheduling alerts.
            </Description>
            <Select
              value={form.timezone}
              onChange={handleTimezoneChange}
              options={TIMEZONE_OPTIONS}
            />
          </Field>
        </SettingsSection>
      </Box>

      {/* Save Button */}
      <Flex justify="end" gap="md" className="border-t border-border px-4 py-6 sm:px-6 lg:px-8">
        <Button
          onClick={handleSave}
          disabled={isSaving || hasChanges === false}
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Flex>
    </Box>
  );
}

export default SettingsPage;
