import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, Stack, Grid } from '../../components/catalyst/layout';
import { Text, Button, Input, Select } from '../../components/catalyst/primitives';
import {
  fetchTenantSettings,
  updateTenantSettings,
  TenantSettings,
  TIMEZONE_OPTIONS,
  DATE_FORMAT_OPTIONS,
  CURRENCY_OPTIONS,
} from '../../services/tenantAdminService';
import { useAuth } from '../../auth';

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
      <Card>
        <CardBody>
          <Text>Loading settings...</Text>
        </CardBody>
      </Card>
    );
  }

  if (settings === null) {
    return (
      <Card>
        <CardBody>
          <Text color="danger">{error ?? 'Failed to load settings'}</Text>
        </CardBody>
      </Card>
    );
  }

  return (
    <Stack spacing="md">
      <Text variant="heading3">Tenant Settings</Text>

      {error !== null && (
        <Card variant="bordered" style={{ backgroundColor: '#fef2f2' }}>
          <CardBody>
            <Text color="danger">{error}</Text>
          </CardBody>
        </Card>
      )}

      {success !== null && (
        <Card variant="bordered" style={{ backgroundColor: '#ecfdf5' }}>
          <CardBody>
            <Text color="success">{success}</Text>
          </CardBody>
        </Card>
      )}

      {/* General Settings */}
      <Card>
        <CardHeader>
          <Text variant="heading5">General Settings</Text>
        </CardHeader>
        <CardBody>
          <Grid columns={2} gap="md">
            <Select
              label="Timezone"
              value={settings.timezone}
              onChange={(e) => updateField('timezone', e.target.value)}
              options={TIMEZONE_OPTIONS}
            />
            <Select
              label="Date Format"
              value={settings.dateFormat}
              onChange={(e) => updateField('dateFormat', e.target.value)}
              options={DATE_FORMAT_OPTIONS}
            />
            <Select
              label="Currency"
              value={settings.currency}
              onChange={(e) => updateField('currency', e.target.value)}
              options={CURRENCY_OPTIONS}
            />
          </Grid>
        </CardBody>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <Text variant="heading5">Security Settings</Text>
        </CardHeader>
        <CardBody>
          <Grid columns={2} gap="md">
            <Input
              label="Session Timeout (minutes)"
              type="number"
              value={String(settings.sessionTimeoutMinutes)}
              onChange={(e) => updateField('sessionTimeoutMinutes', Number(e.target.value))}
              min={5}
              max={1440}
            />
            <Input
              label="Password Expiry (days)"
              type="number"
              value={String(settings.passwordExpiryDays)}
              onChange={(e) => updateField('passwordExpiryDays', Number(e.target.value))}
              min={0}
              max={365}
              // Set to 0 to disable password expiry
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={settings.mfaRequired}
                onChange={(e) => updateField('mfaRequired', e.target.checked)}
              />
              <Text>Require MFA for all users</Text>
            </label>
          </Grid>
        </CardBody>
      </Card>

      {/* SSO Settings */}
      <Card>
        <CardHeader>
          <Text variant="heading5">Single Sign-On (SSO)</Text>
        </CardHeader>
        <CardBody>
          <Stack spacing="md">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={settings.ssoEnabled}
                onChange={(e) => updateField('ssoEnabled', e.target.checked)}
              />
              <Text>Enable SSO</Text>
            </label>
            {settings.ssoEnabled === true && (
              <Select
                label="SSO Provider"
                value={settings.ssoProvider ?? ''}
                onChange={(e) => updateField('ssoProvider', e.target.value)}
                options={[
                  { value: '', label: 'Select provider...' },
                  { value: 'google', label: 'Google Workspace' },
                  { value: 'microsoft', label: 'Microsoft Azure AD' },
                  { value: 'okta', label: 'Okta' },
                  { value: 'saml', label: 'Custom SAML' },
                ]}
              />
            )}
          </Stack>
        </CardBody>
      </Card>

      {/* Save Button */}
      <Button
        variant="primary"
        onClick={handleSave}
        disabled={isSaving === true}
        size="lg"
      >
        {isSaving === true ? 'Saving...' : 'Save Settings'}
      </Button>
    </Stack>
  );
}

export default TenantSettingsPage;
