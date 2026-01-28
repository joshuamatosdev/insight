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
import {useAuth} from '../auth';
import {useIsPortalUser} from '../hooks';
import type {
    DigestFrequency,
    NotificationPreferences,
    NotificationPreferencesFormState,
    NotificationPreferencesPageProps,
} from './NotificationPreferencesPage.types';

/**
 * Digest frequency options for the selector
 */
const DIGEST_FREQUENCY_OPTIONS = [
    {value: 'REALTIME', label: 'Immediately'},
    {value: 'DAILY', label: 'Daily Digest'},
    {value: 'WEEKLY', label: 'Weekly Digest'},
    {value: 'NONE', label: 'None'},
];

/**
 * Intelligence user notification categories
 */
const INTEL_CATEGORIES = {
    opportunityAlerts: {
        label: 'Opportunity Alerts',
        description: 'Get notified when new opportunities match your saved searches and alerts.',
    },
    deadlineReminders: {
        label: 'Deadline Reminders',
        description: 'Receive reminders about upcoming proposal deadlines.',
    },
    systemAlerts: {
        label: 'System Updates',
        description: 'Important announcements about platform updates and maintenance.',
    },
};

/**
 * Portal user notification categories
 */
const PORTAL_CATEGORIES = {
    opportunityAlerts: {
        label: 'Contract Updates',
        description: 'Get notified about changes to your active contracts.',
    },
    deadlineReminders: {
        label: 'Deliverable Reminders',
        description: 'Receive reminders about upcoming deliverables and milestones.',
    },
    systemAlerts: {
        label: 'System Updates',
        description: 'Important announcements about platform updates and maintenance.',
    },
};

const API_BASE = '/api';
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
 * Fetches notification preferences from the API
 */
async function fetchPreferences(): Promise<NotificationPreferences> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/v1/notifications/preferences`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (response.ok === false) {
        throw new Error('Failed to fetch notification preferences');
    }

    return response.json();
}

/**
 * Updates notification preferences via the API
 */
async function updatePreferences(
    preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE}/v1/notifications/preferences`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
    });

    if (response.ok === false) {
        throw new Error('Failed to update notification preferences');
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
 * Notification Preferences Page Component
 */
export function NotificationPreferencesPage({
    onSaveSuccess,
}: NotificationPreferencesPageProps): React.ReactElement {
    const {token} = useAuth();
    const isPortalUser = useIsPortalUser();

    const [form, setForm] = useState<NotificationPreferencesFormState>({
        emailEnabled: true,
        pushEnabled: true,
        opportunityAlerts: true,
        deadlineReminders: true,
        systemAlerts: true,
        digestFrequency: 'REALTIME',
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalForm, setOriginalForm] = useState<NotificationPreferencesFormState | null>(null);

    // Select categories based on user role
    const categories = isPortalUser ? PORTAL_CATEGORIES : INTEL_CATEGORIES;

    // Load preferences on mount
    useEffect(() => {
        if (token === null) {
            return;
        }

        const loadPreferences = async (): Promise<void> => {
            try {
                setIsLoading(true);
                setError(null);
                const preferences = await fetchPreferences();
                const formState: NotificationPreferencesFormState = {
                    emailEnabled: preferences.emailEnabled,
                    pushEnabled: preferences.pushEnabled,
                    opportunityAlerts: preferences.opportunityAlerts,
                    deadlineReminders: preferences.deadlineReminders,
                    systemAlerts: preferences.systemAlerts,
                    digestFrequency: preferences.digestFrequency,
                };
                setForm(formState);
                setOriginalForm(formState);
            } catch {
                setError('Failed to load notification preferences. Please try again.');
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
            form.emailEnabled !== originalForm.emailEnabled ||
            form.pushEnabled !== originalForm.pushEnabled ||
            form.opportunityAlerts !== originalForm.opportunityAlerts ||
            form.deadlineReminders !== originalForm.deadlineReminders ||
            form.systemAlerts !== originalForm.systemAlerts ||
            form.digestFrequency !== originalForm.digestFrequency;

        setHasChanges(changed);
    }, [form, originalForm]);

    const handleToggle = useCallback(
        (field: keyof NotificationPreferencesFormState) => (checked: boolean) => {
            setForm((prev) => ({...prev, [field]: checked}));
            setSuccessMessage(null);
        },
        []
    );

    const handleFrequencyChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value as DigestFrequency;
        setForm((prev) => ({...prev, digestFrequency: value}));
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

            const updatedPreferences = await updatePreferences({
                emailEnabled: form.emailEnabled,
                pushEnabled: form.pushEnabled,
                opportunityAlerts: form.opportunityAlerts,
                deadlineReminders: form.deadlineReminders,
                systemAlerts: form.systemAlerts,
                digestFrequency: form.digestFrequency,
            });

            const formState: NotificationPreferencesFormState = {
                emailEnabled: updatedPreferences.emailEnabled,
                pushEnabled: updatedPreferences.pushEnabled,
                opportunityAlerts: updatedPreferences.opportunityAlerts,
                deadlineReminders: updatedPreferences.deadlineReminders,
                systemAlerts: updatedPreferences.systemAlerts,
                digestFrequency: updatedPreferences.digestFrequency,
            };
            setOriginalForm(formState);
            setHasChanges(false);
            setSuccessMessage('Notification preferences saved successfully!');

            if (onSaveSuccess !== undefined) {
                onSaveSuccess();
            }
        } catch {
            setError('Failed to save notification preferences. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [token, form, onSaveSuccess]);

    if (isLoading) {
        return (
            <Flex justify="center" align="center">
                <Text>Loading notification preferences...</Text>
            </Flex>
        );
    }

    return (
        <Box>
            <Box>
                <Heading>Notification Preferences</Heading>
                <Text>
                    Configure how you receive alerts and updates.
                </Text>
            </Box>

            {/* Error message */}
            {error !== null && (
                <Box>
                    <InlineAlert color="error" onDismiss={() => setError(null)}>
                        {error}
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
                {/* Delivery Methods */}
                <SettingsSection
                    title="Delivery Methods"
                    description="Choose how you want to receive notifications."
                >
                    <SwitchField>
                        <Label>Email Notifications</Label>
                        <Description>
                            Receive notifications via email.
                        </Description>
                        <Switch
                            checked={form.emailEnabled}
                            onChange={handleToggle('emailEnabled')}
                            color="cyan"
                        />
                    </SwitchField>

                    <SwitchField>
                        <Label>In-App / Push Notifications</Label>
                        <Description>
                            Receive notifications in the application and via push notifications.
                        </Description>
                        <Switch
                            checked={form.pushEnabled}
                            onChange={handleToggle('pushEnabled')}
                            color="cyan"
                        />
                    </SwitchField>
                </SettingsSection>

                <Divider/>

                {/* Notification Categories */}
                <SettingsSection
                    title="Categories"
                    description="Choose which types of notifications you want to receive."
                >
                    <SwitchField>
                        <Label>{categories.opportunityAlerts.label}</Label>
                        <Description>
                            {categories.opportunityAlerts.description}
                        </Description>
                        <Switch
                            checked={form.opportunityAlerts}
                            onChange={handleToggle('opportunityAlerts')}
                            color="cyan"
                        />
                    </SwitchField>

                    <SwitchField>
                        <Label>{categories.deadlineReminders.label}</Label>
                        <Description>
                            {categories.deadlineReminders.description}
                        </Description>
                        <Switch
                            checked={form.deadlineReminders}
                            onChange={handleToggle('deadlineReminders')}
                            color="cyan"
                        />
                    </SwitchField>

                    <SwitchField>
                        <Label>{categories.systemAlerts.label}</Label>
                        <Description>
                            {categories.systemAlerts.description}
                        </Description>
                        <Switch
                            checked={form.systemAlerts}
                            onChange={handleToggle('systemAlerts')}
                            color="cyan"
                        />
                    </SwitchField>
                </SettingsSection>

                <Divider/>

                {/* Digest Frequency */}
                <SettingsSection
                    title="Email Frequency"
                    description="Choose how often you receive email notifications."
                >
                    <Field>
                        <Label>Digest Frequency</Label>
                        <Description>
                            How often should we send you email notifications?
                        </Description>
                        <Select
                            value={form.digestFrequency}
                            onChange={handleFrequencyChange}
                            options={DIGEST_FREQUENCY_OPTIONS}
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

export default NotificationPreferencesPage;
