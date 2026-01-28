import {useCallback, useEffect, useState} from 'react';
import {
    Button,
    Description,
    Divider,
    Field,
    FieldGroup,
    Heading,
    InlineAlert,
    Label,
    Select,
    Switch,
    SwitchField,
    Text,
} from '../components/catalyst';
import {Box, Flex, Grid, GridItem} from '../components/catalyst/layout';
import {useUserPreferences} from '../hooks';
import type {
    SettingsFormState,
    SettingsPageProps,
    Theme,
} from './SettingsPage.types';

/**
 * Common timezone options
 */
const TIMEZONE_OPTIONS = [
    {value: 'America/New_York', label: 'Eastern Time (ET)'},
    {value: 'America/Chicago', label: 'Central Time (CT)'},
    {value: 'America/Denver', label: 'Mountain Time (MT)'},
    {value: 'America/Los_Angeles', label: 'Pacific Time (PT)'},
    {value: 'America/Anchorage', label: 'Alaska Time (AKT)'},
    {value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)'},
    {value: 'UTC', label: 'UTC'},
];

/**
 * Theme options for the selector
 */
const THEME_OPTIONS = [
    {value: 'LIGHT', label: 'Light'},
    {value: 'DARK', label: 'Dark'},
    {value: 'SYSTEM', label: 'System Default'},
];

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
        <Grid columns={3} columnGap="xl" rowGap="lg">
            <GridItem>
                <Heading level={2}>{title}</Heading>
                <Text>{description}</Text>
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
export function SettingsPage({onSaveSuccess}: SettingsPageProps): React.ReactElement {
    const {preferences, isLoading, error: fetchError, update, refresh} = useUserPreferences();

    const [form, setForm] = useState<SettingsFormState>({
        theme: 'SYSTEM',
        emailNotifications: true,
        timezone: 'America/New_York',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalForm, setOriginalForm] = useState<SettingsFormState | null>(null);

    // Sync form state with loaded preferences
    useEffect(() => {
        if (preferences !== null) {
            const formState: SettingsFormState = {
                theme: preferences.theme,
                emailNotifications: preferences.emailNotifications,
                timezone: preferences.timezone,
            };
            setForm(formState);
            setOriginalForm(formState);
        }
    }, [preferences]);

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

    // Update error state from fetch error
    useEffect(() => {
        if (fetchError !== null) {
            setError('Failed to load preferences. Please try again.');
        }
    }, [fetchError]);

    const handleThemeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value as Theme;
        setForm((prev) => ({...prev, theme: value}));
        setSuccessMessage(null);
    }, []);

    const handleTimezoneChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        setForm((prev) => ({...prev, timezone: value}));
        setSuccessMessage(null);
    }, []);

    const handleEmailNotificationsToggle = useCallback((checked: boolean) => {
        setForm((prev) => ({...prev, emailNotifications: checked}));
        setSuccessMessage(null);
    }, []);

    const handleSave = useCallback(async () => {
        try {
            setIsSaving(true);
            setError(null);
            setSuccessMessage(null);

            const updatedPreferences = await update({
                theme: form.theme,
                emailNotifications: form.emailNotifications,
                timezone: form.timezone,
            });

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
    }, [form, onSaveSuccess, update]);

    const handleRetry = useCallback(() => {
        setError(null);
        void refresh();
    }, [refresh]);

    if (isLoading) {
        return (
            <Flex justify="center" align="center">
                <Text>Loading preferences...</Text>
            </Flex>
        );
    }

    return (
        <Box>
            <Box>
                <Heading>Settings</Heading>
                <Text>
                    Manage your account settings and preferences.
                </Text>
            </Box>

            {/* Error message */}
            {error !== null && (
                <Box>
                    <InlineAlert color="error" onDismiss={() => setError(null)}>
                        {error}
                        {fetchError !== null && (
                            <Button variant="ghost" size="sm" onClick={handleRetry}>
                                Retry
                            </Button>
                        )}
                    </InlineAlert>
                </Box>
            )}

            {/* Success message */}
            {successMessage !== null && (
                <Box>
                    <InlineAlert color="success" onDismiss={() => setSuccessMessage(null)}>
                        {successMessage}
                    </InlineAlert>
                </Box>
            )}

            <Box>
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

                <Divider/>

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

                <Divider/>

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
            <Flex justify="end" gap="md">
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
