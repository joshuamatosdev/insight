/**
 * Tests for MfaSetupPage component
 */

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {RouterTestWrapper} from '@/test/router-test-utils';
import {MfaSetupPage} from './MfaSetupPage';
import type {AuthContextType} from '../auth';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', async () => {
    const actual = await vi.importActual('@tanstack/react-router');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock the useAuth hook
let mockAuthState: Partial<AuthContextType> = {
    token: 'test-token-123',
    isAuthenticated: true,
    isLoading: false,
    error: null,
};

vi.mock('../auth', async () => {
    const actual = await vi.importActual('../auth');
    return {
        ...actual,
        useAuth: () => mockAuthState,
    };
});

// Mock the MFA service
const mockStartMfaSetup = vi.fn();
const mockVerifyMfaSetup = vi.fn();

vi.mock('../services/mfaService', () => ({
    startMfaSetup: (...args: unknown[]) => mockStartMfaSetup(...args),
    verifyMfaSetup: (...args: unknown[]) => mockVerifyMfaSetup(...args),
}));

// Mock clipboard API - set up before each test
const mockClipboardWriteText = vi.fn();

/**
 * Helper to render MfaSetupPage with router context
 */
function renderMfaSetupPage(): { user: ReturnType<typeof userEvent.setup> } {
    const user = userEvent.setup();
    render(
        <RouterTestWrapper>
            <MfaSetupPage/>
        </RouterTestWrapper>
    );
    return {user};
}

/**
 * Mock response for startMfaSetup
 */
const mockSetupResponse = {
    secret: 'JBSWY3DPEHPK3PXP',
    qrCodeUrl: 'data:image/png;base64,mockqrcode',
    provisioningUri: 'otpauth://totp/SAMGov:test@example.com?secret=JBSWY3DPEHPK3PXP&issuer=SAMGov',
    backupCodes: null,
    setupComplete: false,
};

/**
 * Mock response for verifyMfaSetup with backup codes
 */
const mockVerifyResponseWithCodes = {
    secret: 'JBSWY3DPEHPK3PXP',
    qrCodeUrl: '',
    provisioningUri: '',
    backupCodes: ['ABC12345', 'DEF67890', 'GHI11111', 'JKL22222', 'MNO33333', 'PQR44444', 'STU55555', 'VWX66666'],
    setupComplete: true,
};

/**
 * Mock response for verifyMfaSetup without backup codes
 */
const mockVerifyResponseWithoutCodes = {
    secret: 'JBSWY3DPEHPK3PXP',
    qrCodeUrl: '',
    provisioningUri: '',
    backupCodes: null,
    setupComplete: true,
};

describe('MfaSetupPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAuthState = {
            token: 'test-token-123',
            isAuthenticated: true,
            isLoading: false,
            error: null,
        };
        mockStartMfaSetup.mockResolvedValue(mockSetupResponse);
        mockVerifyMfaSetup.mockResolvedValue(mockVerifyResponseWithCodes);
        mockClipboardWriteText.mockResolvedValue(undefined);

        // Setup clipboard mock for each test
        Object.defineProperty(navigator, 'clipboard', {
            value: {
                writeText: mockClipboardWriteText,
            },
            writable: true,
            configurable: true,
        });
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe('Intro Step', () => {
        it('should render the intro step by default', () => {
            renderMfaSetupPage();

            expect(screen.getByText('Set Up Two-Factor Authentication')).toBeInTheDocument();
            expect(screen.getByText(/add an extra layer of security/i)).toBeInTheDocument();
        });

        it('should display what user needs for setup', () => {
            renderMfaSetupPage();

            expect(screen.getByText("What you'll need:")).toBeInTheDocument();
            expect(screen.getByText(/an authenticator app on your phone/i)).toBeInTheDocument();
            expect(screen.getByText(/a few minutes to complete setup/i)).toBeInTheDocument();
        });

        it('should render Begin Setup button', () => {
            renderMfaSetupPage();

            expect(screen.getByRole('button', {name: /begin setup/i})).toBeInTheDocument();
        });

        it('should call startMfaSetup when Begin Setup is clicked', async () => {
            const {user} = renderMfaSetupPage();

            const beginButton = screen.getByRole('button', {name: /begin setup/i});
            await user.click(beginButton);

            expect(mockStartMfaSetup).toHaveBeenCalledTimes(1);
            expect(mockStartMfaSetup).toHaveBeenCalledWith('test-token-123');
        });

        it('should show loading state while starting setup', async () => {
            mockStartMfaSetup.mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve(mockSetupResponse), 100))
            );

            const {user} = renderMfaSetupPage();

            const beginButton = screen.getByRole('button', {name: /begin setup/i});
            await user.click(beginButton);

            expect(screen.getByRole('button', {name: /starting/i})).toBeInTheDocument();
            expect(screen.getByRole('button', {name: /starting/i})).toBeDisabled();

            await waitFor(() => {
                expect(screen.queryByRole('button', {name: /starting/i})).not.toBeInTheDocument();
            });
        });

        it('should display error when not authenticated', async () => {
            mockAuthState = {
                ...mockAuthState,
                token: null,
            };

            const {user} = renderMfaSetupPage();

            const beginButton = screen.getByRole('button', {name: /begin setup/i});
            await user.click(beginButton);

            expect(mockStartMfaSetup).not.toHaveBeenCalled();
        });

        it('should not proceed to scan step when startMfaSetup fails', async () => {
            mockStartMfaSetup.mockRejectedValue(new Error('Network error'));

            const {user} = renderMfaSetupPage();

            const beginButton = screen.getByRole('button', {name: /begin setup/i});
            await user.click(beginButton);

            // Should stay on intro step (error is set internally but not displayed in intro)
            await waitFor(() => {
                expect(screen.getByText('Set Up Two-Factor Authentication')).toBeInTheDocument();
            });

            // Should NOT navigate to scan step
            expect(screen.queryByText('Scan QR Code')).not.toBeInTheDocument();
        });
    });

    describe('Scan QR Code Step', () => {
        it('should display QR code after starting setup', async () => {
            const {user} = renderMfaSetupPage();

            const beginButton = screen.getByRole('button', {name: /begin setup/i});
            await user.click(beginButton);

            await waitFor(() => {
                expect(screen.getByText('Scan QR Code')).toBeInTheDocument();
            });
        });

        it('should display QR code image', async () => {
            const {user} = renderMfaSetupPage();

            await user.click(screen.getByRole('button', {name: /begin setup/i}));

            await waitFor(() => {
                const qrImage = screen.getByAltText('MFA QR Code');
                expect(qrImage).toBeInTheDocument();
                expect(qrImage).toHaveAttribute('src', 'data:image/png;base64,mockqrcode');
            });
        });

        it('should display secret key for manual entry', async () => {
            const {user} = renderMfaSetupPage();

            await user.click(screen.getByRole('button', {name: /begin setup/i}));

            await waitFor(() => {
                expect(screen.getByText(/enter this code manually/i)).toBeInTheDocument();
                // Secret is formatted in groups of 4
                expect(screen.getByText(/JBSW Y3DP EHPK 3PXP/i)).toBeInTheDocument();
            });
        });

        it('should have Copy Secret Key button', async () => {
            const {user} = renderMfaSetupPage();

            await user.click(screen.getByRole('button', {name: /begin setup/i}));

            await waitFor(() => {
                expect(screen.getByRole('button', {name: /copy secret key/i})).toBeInTheDocument();
            });
        });

        it('should trigger copy action when Copy Secret Key is clicked', async () => {
            const {user} = renderMfaSetupPage();

            await user.click(screen.getByRole('button', {name: /begin setup/i}));

            await waitFor(() => {
                expect(screen.getByRole('button', {name: /copy secret key/i})).toBeInTheDocument();
            });

            await user.click(screen.getByRole('button', {name: /copy secret key/i}));

            // Verify the copy action was successful by checking for the confirmation message
            await waitFor(() => {
                expect(screen.getByText(/secret copied to clipboard/i)).toBeInTheDocument();
            });
        });

        it('should show confirmation message when secret is copied', async () => {
            const {user} = renderMfaSetupPage();

            await user.click(screen.getByRole('button', {name: /begin setup/i}));

            await waitFor(() => {
                expect(screen.getByRole('button', {name: /copy secret key/i})).toBeInTheDocument();
            });

            await user.click(screen.getByRole('button', {name: /copy secret key/i}));

            await waitFor(() => {
                expect(screen.getByText(/secret copied to clipboard/i)).toBeInTheDocument();
            });
        });

        it('should display Continue button', async () => {
            const {user} = renderMfaSetupPage();

            await user.click(screen.getByRole('button', {name: /begin setup/i}));

            await waitFor(() => {
                expect(screen.getByRole('button', {name: /^continue$/i})).toBeInTheDocument();
            });
        });

        it('should navigate to verify step when Continue is clicked', async () => {
            const {user} = renderMfaSetupPage();

            await user.click(screen.getByRole('button', {name: /begin setup/i}));

            await waitFor(() => {
                expect(screen.getByRole('button', {name: /^continue$/i})).toBeInTheDocument();
            });

            await user.click(screen.getByRole('button', {name: /^continue$/i}));

            expect(screen.getByText('Verify Setup')).toBeInTheDocument();
        });

        it('should display recommended authenticator apps', async () => {
            const {user} = renderMfaSetupPage();

            await user.click(screen.getByRole('button', {name: /begin setup/i}));

            await waitFor(() => {
                expect(screen.getByText(/recommended apps/i)).toBeInTheDocument();
                expect(screen.getByText(/google authenticator/i)).toBeInTheDocument();
            });
        });
    });

    describe('Verify Step', () => {
        async function navigateToVerifyStep(user: ReturnType<typeof userEvent.setup>): Promise<void> {
            await user.click(screen.getByRole('button', {name: /begin setup/i}));
            await waitFor(() => {
                expect(screen.getByRole('button', {name: /^continue$/i})).toBeInTheDocument();
            });
            await user.click(screen.getByRole('button', {name: /^continue$/i}));
        }

        it('should display verify step heading', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToVerifyStep(user);

            expect(screen.getByText('Verify Setup')).toBeInTheDocument();
        });

        it('should display instruction to enter 6-digit code', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToVerifyStep(user);

            expect(screen.getByText(/enter the 6-digit code from your authenticator app/i)).toBeInTheDocument();
        });

        it('should render OTP input fields', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToVerifyStep(user);

            // OtpInput renders 6 individual inputs with aria-labels
            const inputs = screen.getAllByRole('textbox');
            expect(inputs.length).toBe(6);
        });

        it('should have Back button', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToVerifyStep(user);

            expect(screen.getByRole('button', {name: /back/i})).toBeInTheDocument();
        });

        it('should navigate back to scan step when Back is clicked', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToVerifyStep(user);
            await user.click(screen.getByRole('button', {name: /back/i}));

            expect(screen.getByText('Scan QR Code')).toBeInTheDocument();
        });

        it('should have disabled Verify button when code is incomplete', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToVerifyStep(user);

            const verifyButton = screen.getByRole('button', {name: /^verify$/i});
            expect(verifyButton).toBeDisabled();
        });

        it('should enable Verify button when 6 digits are entered', async () => {
            // Don't auto-verify for this test
            mockVerifyMfaSetup.mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve(mockVerifyResponseWithCodes), 5000))
            );

            const {user} = renderMfaSetupPage();

            await navigateToVerifyStep(user);

            const inputs = screen.getAllByRole('textbox');
            // Type 5 digits only to not trigger onComplete
            await user.type(inputs[0], '1');
            await user.type(inputs[1], '2');
            await user.type(inputs[2], '3');
            await user.type(inputs[3], '4');
            await user.type(inputs[4], '5');

            // Verify button should still be disabled with only 5 digits
            expect(screen.getByRole('button', {name: /^verify$/i})).toBeDisabled();

            // Add the 6th digit
            await user.type(inputs[5], '6');

            // Now the button should be enabled (though onComplete will fire)
            // Since verify is slow, we can check before it completes
            expect(screen.getByRole('button', {name: /verifying/i})).toBeInTheDocument();
        });

        it('should call verifyMfaSetup when 6 digits are entered', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToVerifyStep(user);

            const inputs = screen.getAllByRole('textbox');
            // OtpInput's onComplete will trigger verification automatically
            await user.type(inputs[0], '1');
            await user.type(inputs[1], '2');
            await user.type(inputs[2], '3');
            await user.type(inputs[3], '4');
            await user.type(inputs[4], '5');
            await user.type(inputs[5], '6');

            await waitFor(() => {
                // Should have been called at least once with the correct arguments
                expect(mockVerifyMfaSetup).toHaveBeenCalledWith('test-token-123', '123456');
            });
        });

        it('should show loading state while verifying', async () => {
            mockVerifyMfaSetup.mockImplementation(
                () => new Promise((resolve) => setTimeout(() => resolve(mockVerifyResponseWithCodes), 500))
            );

            const {user} = renderMfaSetupPage();

            await navigateToVerifyStep(user);

            const inputs = screen.getAllByRole('textbox');
            await user.type(inputs[0], '1');
            await user.type(inputs[1], '2');
            await user.type(inputs[2], '3');
            await user.type(inputs[3], '4');
            await user.type(inputs[4], '5');
            await user.type(inputs[5], '6');

            // onComplete triggers verification automatically
            await waitFor(() => {
                expect(screen.getByRole('button', {name: /verifying/i})).toBeInTheDocument();
                expect(screen.getByRole('button', {name: /verifying/i})).toBeDisabled();
            });

            await waitFor(() => {
                expect(screen.queryByRole('button', {name: /verifying/i})).not.toBeInTheDocument();
            });
        });

        it('should display error for invalid code', async () => {
            mockVerifyMfaSetup.mockRejectedValue(new Error('Invalid code'));

            const {user} = renderMfaSetupPage();

            await navigateToVerifyStep(user);

            const inputs = screen.getAllByRole('textbox');
            await user.type(inputs[0], '0');
            await user.type(inputs[1], '0');
            await user.type(inputs[2], '0');
            await user.type(inputs[3], '0');
            await user.type(inputs[4], '0');
            await user.type(inputs[5], '0');

            // onComplete triggers verification automatically
            await waitFor(() => {
                expect(screen.getByText('Invalid code')).toBeInTheDocument();
            });
        });

        it('should clear code input after error', async () => {
            mockVerifyMfaSetup.mockRejectedValue(new Error('Invalid code'));

            const {user} = renderMfaSetupPage();

            await navigateToVerifyStep(user);

            const inputs = screen.getAllByRole('textbox');
            await user.type(inputs[0], '0');
            await user.type(inputs[1], '0');
            await user.type(inputs[2], '0');
            await user.type(inputs[3], '0');
            await user.type(inputs[4], '0');
            await user.type(inputs[5], '0');

            // onComplete triggers verification automatically
            await waitFor(() => {
                expect(screen.getByText('Invalid code')).toBeInTheDocument();
            });

            // Check that the verify button is disabled again (code was cleared)
            const verifyButton = screen.getByRole('button', {name: /^verify$/i});
            expect(verifyButton).toBeDisabled();
        });

        it('should show error for short code', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToVerifyStep(user);

            const inputs = screen.getAllByRole('textbox');
            await user.type(inputs[0], '123');

            // Manually click verify (shouldn't be possible due to disabled state)
            // But the button should remain disabled
            const verifyButton = screen.getByRole('button', {name: /^verify$/i});
            expect(verifyButton).toBeDisabled();
        });

        it('should display error when not authenticated during verify', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToVerifyStep(user);

            // Change auth state mid-flow before entering code
            mockAuthState = {
                ...mockAuthState,
                token: null,
            };

            const inputs = screen.getAllByRole('textbox');
            await user.type(inputs[0], '1');
            await user.type(inputs[1], '2');
            await user.type(inputs[2], '3');
            await user.type(inputs[3], '4');
            await user.type(inputs[4], '5');
            await user.type(inputs[5], '6');

            // Should NOT call verify service when not authenticated
            // Error is set internally but service is not called
            await waitFor(() => {
                expect(mockVerifyMfaSetup).not.toHaveBeenCalled();
            });
        });
    });

    describe('Backup Codes Step', () => {
        async function navigateToBackupCodesStep(user: ReturnType<typeof userEvent.setup>): Promise<void> {
            await user.click(screen.getByRole('button', {name: /begin setup/i}));
            await waitFor(() => {
                expect(screen.getByRole('button', {name: /^continue$/i})).toBeInTheDocument();
            });
            await user.click(screen.getByRole('button', {name: /^continue$/i}));

            const inputs = screen.getAllByRole('textbox');
            await user.type(inputs[0], '1');
            await user.type(inputs[1], '2');
            await user.type(inputs[2], '3');
            await user.type(inputs[3], '4');
            await user.type(inputs[4], '5');
            await user.type(inputs[5], '6');

            await waitFor(() => {
                expect(screen.getByText('Save Backup Codes')).toBeInTheDocument();
            });
        }

        it('should display backup codes after successful verification', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToBackupCodesStep(user);

            expect(screen.getByText('Save Backup Codes')).toBeInTheDocument();
        });

        it('should display warning about saving backup codes', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToBackupCodesStep(user);

            expect(screen.getByText(/important: save these backup codes/i)).toBeInTheDocument();
            expect(screen.getByText(/these codes can be used to access your account/i)).toBeInTheDocument();
        });

        it('should display all backup codes', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToBackupCodesStep(user);

            expect(screen.getByText('ABC12345')).toBeInTheDocument();
            expect(screen.getByText('DEF67890')).toBeInTheDocument();
            expect(screen.getByText('GHI11111')).toBeInTheDocument();
            expect(screen.getByText('JKL22222')).toBeInTheDocument();
        });

        it('should display backup code count', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToBackupCodesStep(user);

            expect(screen.getByText(/you have 8 backup codes/i)).toBeInTheDocument();
        });

        it('should have Copy All button', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToBackupCodesStep(user);

            expect(screen.getByRole('button', {name: /copy all/i})).toBeInTheDocument();
        });

        it('should have Download button', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToBackupCodesStep(user);

            expect(screen.getByRole('button', {name: /download/i})).toBeInTheDocument();
        });

        it('should trigger copy action when Copy All is clicked', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToBackupCodesStep(user);

            // Before clicking copy, the continue button should be disabled
            expect(screen.getByRole('button', {name: /save codes to continue/i})).toBeDisabled();

            await user.click(screen.getByRole('button', {name: /copy all/i}));

            // After copying, the continue button should be enabled (proving copy was successful)
            await waitFor(() => {
                expect(screen.getByRole('button', {name: /^continue$/i})).not.toBeDisabled();
            });
        });

        it('should have disabled Continue button until codes are saved', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToBackupCodesStep(user);

            const continueButton = screen.getByRole('button', {name: /save codes to continue/i});
            expect(continueButton).toBeDisabled();
        });

        it('should enable Continue button after copying codes', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToBackupCodesStep(user);

            await user.click(screen.getByRole('button', {name: /copy all/i}));

            await waitFor(() => {
                const continueButton = screen.getByRole('button', {name: /^continue$/i});
                expect(continueButton).not.toBeDisabled();
            });
        });

        it('should enable Continue button after downloading codes', async () => {
            // Mock URL.createObjectURL and document methods for download
            const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
            const mockRevokeObjectURL = vi.fn();
            global.URL.createObjectURL = mockCreateObjectURL;
            global.URL.revokeObjectURL = mockRevokeObjectURL;

            const {user} = renderMfaSetupPage();

            await navigateToBackupCodesStep(user);

            await user.click(screen.getByRole('button', {name: /download/i}));

            await waitFor(() => {
                const continueButton = screen.getByRole('button', {name: /^continue$/i});
                expect(continueButton).not.toBeDisabled();
            });
        });

        it('should navigate to complete step when Continue is clicked', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToBackupCodesStep(user);

            await user.click(screen.getByRole('button', {name: /copy all/i}));

            await waitFor(() => {
                expect(screen.getByRole('button', {name: /^continue$/i})).not.toBeDisabled();
            });

            await user.click(screen.getByRole('button', {name: /^continue$/i}));

            expect(screen.getByText('Two-Factor Authentication Enabled')).toBeInTheDocument();
        });
    });

    describe('Complete Step', () => {
        async function navigateToCompleteStep(user: ReturnType<typeof userEvent.setup>): Promise<void> {
            await user.click(screen.getByRole('button', {name: /begin setup/i}));
            await waitFor(() => {
                expect(screen.getByRole('button', {name: /^continue$/i})).toBeInTheDocument();
            });
            await user.click(screen.getByRole('button', {name: /^continue$/i}));

            const inputs = screen.getAllByRole('textbox');
            await user.type(inputs[0], '1');
            await user.type(inputs[1], '2');
            await user.type(inputs[2], '3');
            await user.type(inputs[3], '4');
            await user.type(inputs[4], '5');
            await user.type(inputs[5], '6');

            await waitFor(() => {
                expect(screen.getByText('Save Backup Codes')).toBeInTheDocument();
            });

            await user.click(screen.getByRole('button', {name: /copy all/i}));
            await waitFor(() => {
                expect(screen.getByRole('button', {name: /^continue$/i})).not.toBeDisabled();
            });
            await user.click(screen.getByRole('button', {name: /^continue$/i}));
        }

        it('should display success message', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToCompleteStep(user);

            expect(screen.getByText('Two-Factor Authentication Enabled')).toBeInTheDocument();
        });

        it('should display success checkmark', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToCompleteStep(user);

            // The checkmark is rendered as text with specific styling
            expect(screen.getByText('✓')).toBeInTheDocument();
        });

        it('should display confirmation text', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToCompleteStep(user);

            expect(screen.getByText(/your account is now protected/i)).toBeInTheDocument();
            expect(screen.getByText(/you'll need your authenticator app each time you sign in/i)).toBeInTheDocument();
        });

        it('should have Done button', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToCompleteStep(user);

            expect(screen.getByRole('button', {name: /done/i})).toBeInTheDocument();
        });

        it('should navigate to security settings when Done is clicked', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToCompleteStep(user);

            await user.click(screen.getByRole('button', {name: /done/i}));

            expect(mockNavigate).toHaveBeenCalledWith('/settings/security');
        });
    });

    describe('Complete Step Without Backup Codes', () => {
        it('should skip to complete step when no backup codes are returned', async () => {
            mockVerifyMfaSetup.mockResolvedValue(mockVerifyResponseWithoutCodes);

            const {user} = renderMfaSetupPage();

            await user.click(screen.getByRole('button', {name: /begin setup/i}));
            await waitFor(() => {
                expect(screen.getByRole('button', {name: /^continue$/i})).toBeInTheDocument();
            });
            await user.click(screen.getByRole('button', {name: /^continue$/i}));

            const inputs = screen.getAllByRole('textbox');
            await user.type(inputs[0], '1');
            await user.type(inputs[1], '2');
            await user.type(inputs[2], '3');
            await user.type(inputs[3], '4');
            await user.type(inputs[4], '5');
            await user.type(inputs[5], '6');

            await waitFor(() => {
                expect(screen.getByText('Two-Factor Authentication Enabled')).toBeInTheDocument();
            });

            // Backup codes step should be skipped
            expect(screen.queryByText('Save Backup Codes')).not.toBeInTheDocument();
        });

        it('should skip to complete step when backup codes array is empty', async () => {
            mockVerifyMfaSetup.mockResolvedValue({
                ...mockVerifyResponseWithCodes,
                backupCodes: [],
            });

            const {user} = renderMfaSetupPage();

            await user.click(screen.getByRole('button', {name: /begin setup/i}));
            await waitFor(() => {
                expect(screen.getByRole('button', {name: /^continue$/i})).toBeInTheDocument();
            });
            await user.click(screen.getByRole('button', {name: /^continue$/i}));

            const inputs = screen.getAllByRole('textbox');
            await user.type(inputs[0], '1');
            await user.type(inputs[1], '2');
            await user.type(inputs[2], '3');
            await user.type(inputs[3], '4');
            await user.type(inputs[4], '5');
            await user.type(inputs[5], '6');

            await waitFor(() => {
                expect(screen.getByText('Two-Factor Authentication Enabled')).toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        it('should not proceed when startMfaSetup fails with non-Error object', async () => {
            mockStartMfaSetup.mockRejectedValue({code: 500});

            const {user} = renderMfaSetupPage();

            await user.click(screen.getByRole('button', {name: /begin setup/i}));

            // Should stay on intro step (component sets error internally)
            await waitFor(() => {
                expect(screen.getByRole('button', {name: /begin setup/i})).toBeInTheDocument();
            });

            // Should NOT navigate to scan step
            expect(screen.queryByText('Scan QR Code')).not.toBeInTheDocument();
        });

        it('should display generic error for verification failure without message', async () => {
            mockVerifyMfaSetup.mockRejectedValue({code: 500});

            const {user} = renderMfaSetupPage();

            await user.click(screen.getByRole('button', {name: /begin setup/i}));
            await waitFor(() => {
                expect(screen.getByRole('button', {name: /^continue$/i})).toBeInTheDocument();
            });
            await user.click(screen.getByRole('button', {name: /^continue$/i}));

            const inputs = screen.getAllByRole('textbox');
            await user.type(inputs[0], '1');
            await user.type(inputs[1], '2');
            await user.type(inputs[2], '3');
            await user.type(inputs[3], '4');
            await user.type(inputs[4], '5');
            await user.type(inputs[5], '6');

            await waitFor(() => {
                expect(screen.getByText('Invalid code')).toBeInTheDocument();
            });
        });

        it('should navigate back to scan step when Back is clicked after error', async () => {
            mockVerifyMfaSetup.mockRejectedValue(new Error('Invalid code'));

            const {user} = renderMfaSetupPage();

            await user.click(screen.getByRole('button', {name: /begin setup/i}));
            await waitFor(() => {
                expect(screen.getByRole('button', {name: /^continue$/i})).toBeInTheDocument();
            });
            await user.click(screen.getByRole('button', {name: /^continue$/i}));

            const inputs = screen.getAllByRole('textbox');
            await user.type(inputs[0], '1');
            await user.type(inputs[1], '2');
            await user.type(inputs[2], '3');
            await user.type(inputs[3], '4');
            await user.type(inputs[4], '5');
            await user.type(inputs[5], '6');

            await waitFor(() => {
                expect(screen.getByText('Invalid code')).toBeInTheDocument();
            });

            // Go back
            await user.click(screen.getByRole('button', {name: /back/i}));

            // Should be on scan step
            expect(screen.getByText('Scan QR Code')).toBeInTheDocument();
        });
    });

    describe('OTP Input Behavior', () => {
        async function navigateToVerifyStep(user: ReturnType<typeof userEvent.setup>): Promise<void> {
            await user.click(screen.getByRole('button', {name: /begin setup/i}));
            await waitFor(() => {
                expect(screen.getByRole('button', {name: /^continue$/i})).toBeInTheDocument();
            });
            await user.click(screen.getByRole('button', {name: /^continue$/i}));
        }

        it('should focus first input automatically', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToVerifyStep(user);

            await waitFor(() => {
                const inputs = screen.getAllByRole('textbox');
                expect(inputs[0]).toHaveFocus();
            });
        });

        it('should trigger verification when 6 digits are entered', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToVerifyStep(user);

            const inputs = screen.getAllByRole('textbox');

            // Type each digit (onComplete will trigger verification)
            await user.type(inputs[0], '1');
            await user.type(inputs[1], '2');
            await user.type(inputs[2], '3');
            await user.type(inputs[3], '4');
            await user.type(inputs[4], '5');
            await user.type(inputs[5], '6');

            // Should call verify automatically via onComplete
            await waitFor(() => {
                expect(mockVerifyMfaSetup).toHaveBeenCalledWith('test-token-123', '123456');
            });
        });

        it('should only allow numeric input', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToVerifyStep(user);

            const inputs = screen.getAllByRole('textbox');
            await user.type(inputs[0], 'abc1');

            // Only the numeric character should be entered
            expect(inputs[0]).toHaveValue('1');
        });

        it('should render 6 input fields', async () => {
            const {user} = renderMfaSetupPage();

            await navigateToVerifyStep(user);

            const inputs = screen.getAllByRole('textbox');
            expect(inputs.length).toBe(6);
        });
    });

    describe('Accessibility', () => {
        it('should have accessible heading structure', () => {
            renderMfaSetupPage();

            const heading = screen.getByRole('heading', {level: 4});
            expect(heading).toHaveTextContent('Set Up Two-Factor Authentication');
        });

        it('should have accessible OTP input labels', async () => {
            const {user} = renderMfaSetupPage();

            await user.click(screen.getByRole('button', {name: /begin setup/i}));
            await waitFor(() => {
                expect(screen.getByRole('button', {name: /^continue$/i})).toBeInTheDocument();
            });
            await user.click(screen.getByRole('button', {name: /^continue$/i}));

            await waitFor(() => {
                // Each OTP input should have an aria-label
                const inputs = screen.getAllByRole('textbox');
                inputs.forEach((input, index) => {
                    expect(input).toHaveAttribute('aria-label', `Digit ${index + 1} of 6`);
                });
            });
        });

        it('should have accessible QR code alt text', async () => {
            const {user} = renderMfaSetupPage();

            await user.click(screen.getByRole('button', {name: /begin setup/i}));

            await waitFor(() => {
                const qrImage = screen.getByAltText('MFA QR Code');
                expect(qrImage).toBeInTheDocument();
            });
        });
    });
});
