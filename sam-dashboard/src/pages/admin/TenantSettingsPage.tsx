import { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Stack,
  Grid,
  GridItem,
  Section,
  SectionHeader,
  Flex,
} from '../../components/catalyst/layout';
import {
  Text,
  Button,
  Input,
  Select,
  Checkbox,
  CheckboxField,
  InlineAlert,
  InlineAlertDescription,
} from '../../components/catalyst/primitives';
import {
  fetchTenantSettings,
  updateTenantSettings,
  TenantSettings,
  TIMEZONE_OPTIONS,
  DATE_FORMAT_OPTIONS,
  CURRENCY_OPTIONS,
} from '../../services/tenantAdminService';
import { useAuth } from '../../auth';
import { Description, Label } from '../../components/catalyst/blocks/fieldset';

/**
 * Tenant Settings administration page
 */
export function TenantSettingsPage(): React.ReactElement {
  const { token } = useAuth();

  const [settings, setSettings] = useState<TenantSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      if (token === null || token === undefined) {
        return;
      }

      try {
        const data = await fetchTenantSettings(token);
        setSettings(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [token]);

  const handleSave = async () => {
    if (token === null || token === undefined || settings === null) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await updateTenantSettings(token, settings);
      setSettings(updated);
      setSuccess('Settings saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = <K extends keyof TenantSettings>(
    field: K,
    value: TenantSettings[K]
  ) => {
    if (settings !== null) {
      setSettings({ ...settings, [field]: value });
    }
  };

  if (isLoading === true) {
    return (
      <Section id="tenant-settings">
        <Flex justify="center" align="center" className="min-h-[300px]">
          <Text variant="body" color="muted">
            Loading settings...
          </Text>
        </Flex>
      </Section>
    );
  }

  if (settings === null) {
    return (
      <Section id="tenant-settings">
        <Flex justify="center" align="center" className="min-h-[300px]">
          <Stack spacing="md" align="center">
            <Text variant="body" color="danger">
              {error ?? 'Failed to load settings'}
            </Text>
            <Button variant="primary" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </Stack>
        </Flex>
      </Section>
    );
  }

  return (
    <Section id="tenant-settings">
      <SectionHeader title="Tenant Settings" />

      <Stack spacing="md">
        {error !== null && (
          <InlineAlert color="error">
            <InlineAlertDescription>{error}</InlineAlertDescription>
          </InlineAlert>
        )}

        {success !== null && (
          <InlineAlert color="success">
            <InlineAlertDescription>{success}</InlineAlertDescription>
          </InlineAlert>
        )}

        {/* General Settings */}
        <Card variant="elevated">
          <CardHeader>
            <Text variant="heading5" weight="semibold">
              General Settings
            </Text>
          </CardHeader>
          <CardBody>
            <Grid columns={2} gap="md">
              <GridItem>
                <Stack spacing="xs">
                  <Text as="label" variant="label" htmlFor="timezone">
                    Timezone
                  </Text>
                  <Select
                    id="timezone"
                    value={settings.timezone}
                    onChange={(e) => updateField('timezone', e.target.value)}
                    options={TIMEZONE_OPTIONS}
                    fullWidth
                  />
                </Stack>
              </GridItem>
              <GridItem>
                <Stack spacing="xs">
                  <Text as="label" variant="label" htmlFor="dateFormat">
                    Date Format
                  </Text>
                  <Select
                    id="dateFormat"
                    value={settings.dateFormat}
                    onChange={(e) => updateField('dateFormat', e.target.value)}
                    options={DATE_FORMAT_OPTIONS}
                    fullWidth
                  />
                </Stack>
              </GridItem>
              <GridItem>
                <Stack spacing="xs">
                  <Text as="label" variant="label" htmlFor="currency">
                    Currency
                  </Text>
                  <Select
                    id="currency"
                    value={settings.currency}
                    onChange={(e) => updateField('currency', e.target.value)}
                    options={CURRENCY_OPTIONS}
                    fullWidth
                  />
                </Stack>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>

        {/* Security Settings */}
        <Card variant="elevated">
          <CardHeader>
            <Text variant="heading5" weight="semibold">
              Security Settings
            </Text>
          </CardHeader>
          <CardBody>
            <Grid columns={2} gap="md">
              <GridItem>
                <Stack spacing="xs">
                  <Text as="label" variant="label" htmlFor="sessionTimeout">
                    Session Timeout (minutes)
                  </Text>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={String(settings.sessionTimeoutMinutes)}
                    onChange={(e) =>
                      updateField('sessionTimeoutMinutes', Number(e.target.value))
                    }
                    min={5}
                    max={1440}
                  />
                </Stack>
              </GridItem>
              <GridItem>
                <Stack spacing="xs">
                  <Text as="label" variant="label" htmlFor="passwordExpiry">
                    Password Expiry (days)
                  </Text>
                  <Input
                    id="passwordExpiry"
                    type="number"
                    value={String(settings.passwordExpiryDays)}
                    onChange={(e) =>
                      updateField('passwordExpiryDays', Number(e.target.value))
                    }
                    min={0}
                    max={365}
                  />
                  <Text variant="caption" color="muted">
                    Set to 0 to disable password expiry
                  </Text>
                </Stack>
              </GridItem>
              <GridItem>
                <CheckboxField>
                  <Checkbox
                    checked={settings.mfaRequired}
                    onChange={(checked) => updateField('mfaRequired', checked)}
                    color="blue"
                  />
                  <Label>Require MFA for all users</Label>
                  <Description>
                    When enabled, all users must set up multi-factor authentication
                  </Description>
                </CheckboxField>
              </GridItem>
            </Grid>
          </CardBody>
        </Card>

        {/* SSO Settings */}
        <Card variant="elevated">
          <CardHeader>
            <Text variant="heading5" weight="semibold">
              Single Sign-On (SSO)
            </Text>
          </CardHeader>
          <CardBody>
            <Stack spacing="md">
              <CheckboxField>
                <Checkbox
                  checked={settings.ssoEnabled}
                  onChange={(checked) => updateField('ssoEnabled', checked)}
                  color="blue"
                />
                <Label>Enable SSO</Label>
                <Description>
                  Allow users to sign in using an external identity provider
                </Description>
              </CheckboxField>
              {settings.ssoEnabled === true && (
                <Stack spacing="xs">
                  <Text as="label" variant="label" htmlFor="ssoProvider">
                    SSO Provider
                  </Text>
                  <Select
                    id="ssoProvider"
                    value={settings.ssoProvider ?? ''}
                    onChange={(e) => updateField('ssoProvider', e.target.value)}
                    options={[
                      { value: '', label: 'Select provider...' },
                      { value: 'google', label: 'Google Workspace' },
                      { value: 'microsoft', label: 'Microsoft Azure AD' },
                      { value: 'okta', label: 'Okta' },
                      { value: 'saml', label: 'Custom SAML' },
                    ]}
                    fullWidth
                  />
                </Stack>
              )}
            </Stack>
          </CardBody>
        </Card>

        {/* Save Button */}
        <Flex justify="end">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving === true}
            size="lg"
          >
            {isSaving === true ? 'Saving...' : 'Save Settings'}
          </Button>
        </Flex>
      </Stack>
    </Section>
  );
}

export default TenantSettingsPage;
