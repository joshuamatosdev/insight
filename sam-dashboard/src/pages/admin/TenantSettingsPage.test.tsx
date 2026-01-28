/**
 * Tests for TenantSettingsPage component
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {TenantSettingsPage} from './TenantSettingsPage';
import type {TenantSettings} from '../../services/tenantAdminService';
// Import mocked functions after vi.mock
import {fetchTenantSettings, updateTenantSettings} from '../../services/tenantAdminService';
import type {AuthContextType} from '../../auth';

// Mock the tenant admin service
vi.mock('../../services/tenantAdminService', () => ({
    fetchTenantSettings: vi.fn(),
    updateTenantSettings: vi.fn(),
    TIMEZONE_OPTIONS: [
        {value: 'America/New_York', label: 'Eastern Time (ET)'},
        {value: 'America/Chicago', label: 'Central Time (CT)'},
        {value: 'America/Los_Angeles', label: 'Pacific Time (PT)'},
        {value: 'UTC', label: 'UTC'},
    ],
    DATE_FORMAT_OPTIONS: [
        {value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (US)'},
        {value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (EU)'},
        {value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (ISO)'},
    ],
    CURRENCY_OPTIONS: [
        {value: 'USD', label: 'US Dollar (USD)'},
        {value: 'EUR', label: 'Euro (EUR)'},
        {value: 'GBP', label: 'British Pound (GBP)'},
    ],
}));

// Mock the useAuth hook
let mockAuthState: Partial<AuthContextType> = {
    token: 'mock-token',
    isAuthenticated: true,
};

vi.mock('../../auth', async () => {
    const actual = await vi.importActual('../../auth');
    return {
        ...actual,
        useAuth: () => mockAuthState,
    };
});

/**
 * Create mock tenant settings data
 */
function createMockSettings(overrides: Partial<TenantSettings> = {}): TenantSettings {
    return {
        id: 'settings-1',
        tenantId: 'tenant-1',
        timezone: 'America/New_York',
        dateFormat: 'MM/dd/yyyy',
        currency: 'USD',
        mfaRequired: false,
        sessionTimeoutMinutes: 30,
        passwordExpiryDays: 90,
        ssoEnabled: false,
        ssoProvider: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        ...overrides,
    };
}

/**
 * Helper to get select element by its label attribute
 */
function getSelectByLabel(label: string): HTMLSelectElement {
    const select = document.querySelector(`select[label="${label}"]`) as HTMLSelectElement | null;
    if (select === null) {
        throw new Error(`Could not find select with label="${label}"`);
    }
    return select;
}

/**
 * Helper to get input element by its label attribute
 */
function getInputByLabel(label: string): HTMLInputElement {
    const input = document.querySelector(`input[label="${label}"]`) as HTMLInputElement | null;
    if (input === null) {
        throw new Error(`Could not find input with label="${label}"`);
    }
    return input;
}

describe('TenantSettingsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAuthState = {
            token: 'mock-token',
            isAuthenticated: true,
        };
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('Loading State', () => {
        it('should display loading message while fetching settings', () => {
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockImplementation(
                () => new Promise(() => {
                    /* never resolves */
                })
            );

            render(<TenantSettingsPage/>);

            expect(screen.getByText('Loading settings...')).toBeInTheDocument();
        });

        it('should call fetchTenantSettings with auth token', async () => {
            const mockSettings = createMockSettings();
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(fetchTenantSettings).toHaveBeenCalledWith('mock-token');
            });
        });

        it('should not fetch settings when token is null', () => {
            mockAuthState = {
                token: null,
                isAuthenticated: false,
            };

            render(<TenantSettingsPage/>);

            expect(fetchTenantSettings).not.toHaveBeenCalled();
        });
    });

    describe('Display Settings', () => {
        it('should render settings page heading after loading', async () => {
            const mockSettings = createMockSettings();
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Tenant Settings')).toBeInTheDocument();
            });
        });

        it('should render General Settings section', async () => {
            const mockSettings = createMockSettings();
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('General Settings')).toBeInTheDocument();
            });
        });

        it('should render Security Settings section', async () => {
            const mockSettings = createMockSettings();
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Security Settings')).toBeInTheDocument();
            });
        });

        it('should render SSO Settings section', async () => {
            const mockSettings = createMockSettings();
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Single Sign-On (SSO)')).toBeInTheDocument();
            });
        });

        it('should display current timezone value', async () => {
            const mockSettings = createMockSettings({timezone: 'America/New_York'});
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                const timezoneSelect = getSelectByLabel('Timezone');
                expect(timezoneSelect.value).toBe('America/New_York');
            });
        });

        it('should display current date format value', async () => {
            const mockSettings = createMockSettings({dateFormat: 'yyyy-MM-dd'});
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                const dateFormatSelect = getSelectByLabel('Date Format');
                expect(dateFormatSelect.value).toBe('yyyy-MM-dd');
            });
        });

        it('should display current currency value', async () => {
            const mockSettings = createMockSettings({currency: 'EUR'});
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                const currencySelect = getSelectByLabel('Currency');
                expect(currencySelect.value).toBe('EUR');
            });
        });

        it('should display session timeout value', async () => {
            const mockSettings = createMockSettings({sessionTimeoutMinutes: 60});
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                const sessionInput = getInputByLabel('Session Timeout (minutes)');
                expect(sessionInput.value).toBe('60');
            });
        });

        it('should display password expiry value', async () => {
            const mockSettings = createMockSettings({passwordExpiryDays: 180});
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                const passwordInput = getInputByLabel('Password Expiry (days)');
                expect(passwordInput.value).toBe('180');
            });
        });

        it('should display MFA required checkbox unchecked when false', async () => {
            const mockSettings = createMockSettings({mfaRequired: false});
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Require MFA for all users')).toBeInTheDocument();
            });

            // Find the checkbox associated with the MFA label
            const mfaLabel = screen.getByText('Require MFA for all users');
            const checkbox = mfaLabel.closest('label')?.querySelector('input[type="checkbox"]');
            expect(checkbox).not.toBeChecked();
        });

        it('should display MFA required checkbox checked when true', async () => {
            const mockSettings = createMockSettings({mfaRequired: true});
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Require MFA for all users')).toBeInTheDocument();
            });

            const mfaLabel = screen.getByText('Require MFA for all users');
            const checkbox = mfaLabel.closest('label')?.querySelector('input[type="checkbox"]');
            expect(checkbox).toBeChecked();
        });

        it('should display SSO enabled checkbox unchecked when false', async () => {
            const mockSettings = createMockSettings({ssoEnabled: false});
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Enable SSO')).toBeInTheDocument();
            });

            const ssoLabel = screen.getByText('Enable SSO');
            const checkbox = ssoLabel.closest('label')?.querySelector('input[type="checkbox"]');
            expect(checkbox).not.toBeChecked();
        });

        it('should show SSO provider dropdown when SSO is enabled', async () => {
            const mockSettings = createMockSettings({
                ssoEnabled: true,
                ssoProvider: 'google',
            });
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                const ssoProviderSelect = getSelectByLabel('SSO Provider');
                expect(ssoProviderSelect).toBeInTheDocument();
                expect(ssoProviderSelect.value).toBe('google');
            });
        });

        it('should hide SSO provider dropdown when SSO is disabled', async () => {
            const mockSettings = createMockSettings({ssoEnabled: false});
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Tenant Settings')).toBeInTheDocument();
            });

            expect(document.querySelector('select[label="SSO Provider"]')).not.toBeInTheDocument();
        });
    });

    describe('Update Settings', () => {
        it('should update timezone when selection changes', async () => {
            const user = userEvent.setup();
            const mockSettings = createMockSettings({timezone: 'America/New_York'});
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Tenant Settings')).toBeInTheDocument();
            });

            const timezoneSelect = getSelectByLabel('Timezone');
            await user.selectOptions(timezoneSelect, 'UTC');

            expect(timezoneSelect.value).toBe('UTC');
        });

        it('should update date format when selection changes', async () => {
            const user = userEvent.setup();
            const mockSettings = createMockSettings({dateFormat: 'MM/dd/yyyy'});
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Tenant Settings')).toBeInTheDocument();
            });

            const dateFormatSelect = getSelectByLabel('Date Format');
            await user.selectOptions(dateFormatSelect, 'yyyy-MM-dd');

            expect(dateFormatSelect.value).toBe('yyyy-MM-dd');
        });

        it('should update currency when selection changes', async () => {
            const user = userEvent.setup();
            const mockSettings = createMockSettings({currency: 'USD'});
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Tenant Settings')).toBeInTheDocument();
            });

            const currencySelect = getSelectByLabel('Currency');
            await user.selectOptions(currencySelect, 'EUR');

            expect(currencySelect.value).toBe('EUR');
        });

        it('should update session timeout when value changes', async () => {
            const user = userEvent.setup();
            const mockSettings = createMockSettings({sessionTimeoutMinutes: 30});
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Tenant Settings')).toBeInTheDocument();
            });

            const sessionInput = getInputByLabel('Session Timeout (minutes)');
            await user.clear(sessionInput);
            await user.type(sessionInput, '60');

            expect(sessionInput.value).toBe('60');
        });

        it('should update password expiry when value changes', async () => {
            const user = userEvent.setup();
            const mockSettings = createMockSettings({passwordExpiryDays: 90});
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Tenant Settings')).toBeInTheDocument();
            });

            const passwordInput = getInputByLabel('Password Expiry (days)');
            await user.clear(passwordInput);
            await user.type(passwordInput, '180');

            expect(passwordInput.value).toBe('180');
        });

        it('should toggle MFA required checkbox', async () => {
            const user = userEvent.setup();
            const mockSettings = createMockSettings({mfaRequired: false});
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Require MFA for all users')).toBeInTheDocument();
            });

            const mfaLabel = screen.getByText('Require MFA for all users');
            const checkbox = mfaLabel.closest('label')?.querySelector('input[type="checkbox"]') as HTMLInputElement;

            expect(checkbox).not.toBeChecked();
            await user.click(checkbox);
            expect(checkbox).toBeChecked();
        });

        it('should toggle SSO enabled checkbox and show provider dropdown', async () => {
            const user = userEvent.setup();
            const mockSettings = createMockSettings({ssoEnabled: false});
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Enable SSO')).toBeInTheDocument();
            });

            // SSO provider should not be visible initially
            expect(document.querySelector('select[label="SSO Provider"]')).not.toBeInTheDocument();

            const ssoLabel = screen.getByText('Enable SSO');
            const checkbox = ssoLabel.closest('label')?.querySelector('input[type="checkbox"]') as HTMLInputElement;
            await user.click(checkbox);

            // SSO provider should now be visible
            await waitFor(() => {
                expect(document.querySelector('select[label="SSO Provider"]')).toBeInTheDocument();
            });
        });

        it('should update SSO provider when selection changes', async () => {
            const user = userEvent.setup();
            const mockSettings = createMockSettings({
                ssoEnabled: true,
                ssoProvider: '',
            });
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(document.querySelector('select[label="SSO Provider"]')).toBeInTheDocument();
            });

            const ssoProviderSelect = getSelectByLabel('SSO Provider');
            await user.selectOptions(ssoProviderSelect, 'microsoft');

            expect(ssoProviderSelect.value).toBe('microsoft');
        });
    });

    describe('Save Settings', () => {
        it('should render save button', async () => {
            const mockSettings = createMockSettings();
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByRole('button', {name: /save settings/i})).toBeInTheDocument();
            });
        });

        it('should call updateTenantSettings when save button is clicked', async () => {
            const user = userEvent.setup();
            const mockSettings = createMockSettings();
            const updatedSettings = createMockSettings({timezone: 'UTC'});
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);
            (updateTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(updatedSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByRole('button', {name: /save settings/i})).toBeInTheDocument();
            });

            const saveButton = screen.getByRole('button', {name: /save settings/i});
            await user.click(saveButton);

            expect(updateTenantSettings).toHaveBeenCalledWith('mock-token', mockSettings);
        });

        it('should show saving state while update is in progress', async () => {
            const user = userEvent.setup();
            const mockSettings = createMockSettings();
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);
            (updateTenantSettings as ReturnType<typeof vi.fn>).mockImplementation(
                () =>
                    new Promise((resolve) => {
                        setTimeout(() => resolve(mockSettings), 100);
                    })
            );

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByRole('button', {name: /save settings/i})).toBeInTheDocument();
            });

            const saveButton = screen.getByRole('button', {name: /save settings/i});
            await user.click(saveButton);

            expect(screen.getByRole('button', {name: /saving.../i})).toBeInTheDocument();
            expect(screen.getByRole('button', {name: /saving.../i})).toBeDisabled();
        });

        it('should display success message after saving', async () => {
            const user = userEvent.setup();
            const mockSettings = createMockSettings();
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);
            (updateTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByRole('button', {name: /save settings/i})).toBeInTheDocument();
            });

            const saveButton = screen.getByRole('button', {name: /save settings/i});
            await user.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText('Settings saved successfully')).toBeInTheDocument();
            });
        });

        it('should clear success message before new save attempt', async () => {
            const user = userEvent.setup();
            const mockSettings = createMockSettings();
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);
            (updateTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByRole('button', {name: /save settings/i})).toBeInTheDocument();
            });

            // First save
            const saveButton = screen.getByRole('button', {name: /save settings/i});
            await user.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText('Settings saved successfully')).toBeInTheDocument();
            });

            // Make second save start (the success message should be cleared during save)
            (updateTenantSettings as ReturnType<typeof vi.fn>).mockImplementation(
                () =>
                    new Promise((resolve) => {
                        setTimeout(() => resolve(mockSettings), 100);
                    })
            );

            await user.click(saveButton);

            // During the save process, success should be cleared
            await waitFor(() => {
                expect(screen.queryByText('Settings saved successfully')).not.toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        it('should display error when fetch settings fails', async () => {
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockRejectedValue(
                new Error('Network error')
            );

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Network error')).toBeInTheDocument();
            });
        });

        it('should display generic error message for non-Error exceptions', async () => {
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockRejectedValue('Unknown error');

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Failed to load settings')).toBeInTheDocument();
            });
        });

        it('should display error when update settings fails', async () => {
            const user = userEvent.setup();
            const mockSettings = createMockSettings();
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);
            (updateTenantSettings as ReturnType<typeof vi.fn>).mockRejectedValue(
                new Error('Update failed')
            );

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByRole('button', {name: /save settings/i})).toBeInTheDocument();
            });

            const saveButton = screen.getByRole('button', {name: /save settings/i});
            await user.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText('Update failed')).toBeInTheDocument();
            });
        });

        it('should display generic error when update fails with non-Error', async () => {
            const user = userEvent.setup();
            const mockSettings = createMockSettings();
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);
            (updateTenantSettings as ReturnType<typeof vi.fn>).mockRejectedValue('Unknown error');

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByRole('button', {name: /save settings/i})).toBeInTheDocument();
            });

            const saveButton = screen.getByRole('button', {name: /save settings/i});
            await user.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText('Failed to save settings')).toBeInTheDocument();
            });
        });

        it('should clear error message before new save attempt', async () => {
            const user = userEvent.setup();
            const mockSettings = createMockSettings();
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);
            (updateTenantSettings as ReturnType<typeof vi.fn>)
                .mockRejectedValueOnce(new Error('First error'))
                .mockResolvedValueOnce(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByRole('button', {name: /save settings/i})).toBeInTheDocument();
            });

            const saveButton = screen.getByRole('button', {name: /save settings/i});

            // First save - should fail
            await user.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText('First error')).toBeInTheDocument();
            });

            // Second save - should succeed and error should be cleared
            await user.click(saveButton);

            await waitFor(() => {
                expect(screen.queryByText('First error')).not.toBeInTheDocument();
            });
        });

        it('should not show settings form when settings is null after failed fetch', async () => {
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockRejectedValue(
                new Error('Failed to load')
            );

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Failed to load')).toBeInTheDocument();
            });

            // Settings form elements should not be present
            expect(document.querySelector('select[label="Timezone"]')).not.toBeInTheDocument();
            expect(screen.queryByRole('button', {name: /save settings/i})).not.toBeInTheDocument();
        });
    });

    describe('Authentication Requirements', () => {
        it('should not fetch settings when token is undefined', () => {
            mockAuthState = {
                token: undefined,
                isAuthenticated: false,
            };

            render(<TenantSettingsPage/>);

            expect(fetchTenantSettings).not.toHaveBeenCalled();
        });

        it('should not save settings when token becomes null after load', async () => {
            const user = userEvent.setup();
            const mockSettings = createMockSettings();
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            const {rerender} = render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByRole('button', {name: /save settings/i})).toBeInTheDocument();
            });

            // Change token to null after settings are loaded
            mockAuthState = {
                token: null,
                isAuthenticated: false,
            };

            // Force rerender with new auth state
            rerender(<TenantSettingsPage/>);

            const saveButton = screen.getByRole('button', {name: /save settings/i});
            await user.click(saveButton);

            expect(updateTenantSettings).not.toHaveBeenCalled();
        });
    });

    describe('Form Validation', () => {
        it('should have min/max constraints on session timeout input', async () => {
            const mockSettings = createMockSettings();
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Tenant Settings')).toBeInTheDocument();
            });

            const sessionInput = getInputByLabel('Session Timeout (minutes)');
            expect(sessionInput.getAttribute('min')).toBe('5');
            expect(sessionInput.getAttribute('max')).toBe('1440');
        });

        it('should have min/max constraints on password expiry input', async () => {
            const mockSettings = createMockSettings();
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Tenant Settings')).toBeInTheDocument();
            });

            const passwordInput = getInputByLabel('Password Expiry (days)');
            expect(passwordInput.getAttribute('min')).toBe('0');
            expect(passwordInput.getAttribute('max')).toBe('365');
        });

        it('should pass help text as attribute on password expiry input', async () => {
            const mockSettings = createMockSettings();
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(screen.getByText('Tenant Settings')).toBeInTheDocument();
            });

            const passwordInput = getInputByLabel('Password Expiry (days)');
            // The helpText is passed as an attribute (though not rendered by the Input component)
            expect(passwordInput.getAttribute('helpText')).toBe('Set to 0 to disable password expiry');
        });
    });

    describe('SSO Provider Options', () => {
        it('should display all SSO provider options when SSO is enabled', async () => {
            const mockSettings = createMockSettings({
                ssoEnabled: true,
                ssoProvider: '',
            });
            (fetchTenantSettings as ReturnType<typeof vi.fn>).mockResolvedValue(mockSettings);

            render(<TenantSettingsPage/>);

            await waitFor(() => {
                expect(document.querySelector('select[label="SSO Provider"]')).toBeInTheDocument();
            });

            const ssoProviderSelect = getSelectByLabel('SSO Provider');
            const options = ssoProviderSelect.querySelectorAll('option');

            // Should have placeholder + 4 provider options
            expect(options.length).toBe(5);
            expect(screen.getByRole('option', {name: 'Select provider...'})).toBeInTheDocument();
            expect(screen.getByRole('option', {name: 'Google Workspace'})).toBeInTheDocument();
            expect(screen.getByRole('option', {name: 'Microsoft Azure AD'})).toBeInTheDocument();
            expect(screen.getByRole('option', {name: 'Okta'})).toBeInTheDocument();
            expect(screen.getByRole('option', {name: 'Custom SAML'})).toBeInTheDocument();
        });
    });
});
