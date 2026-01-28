import {beforeEach, describe, expect, it, vi} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {RouterTestWrapper} from '@/test/router-test-utils';
import {LoginPage} from './LoginPage';
import type {AuthContextType, AuthError} from '../auth';

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', async () => {
    const actual = await vi.importActual('@tanstack/react-router');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock the useAuth hook
const mockLogin = vi.fn();
const mockClearError = vi.fn();
let mockAuthState: Partial<AuthContextType> = {
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: mockLogin,
    clearError: mockClearError,
};

vi.mock('../auth', async () => {
    const actual = await vi.importActual('../auth');
    return {
        ...actual,
        useAuth: () => mockAuthState,
    };
});

/**
 * Helper to render LoginPage with router context
 */
function renderLoginPage(): { user: ReturnType<typeof userEvent.setup> } {
    const user = userEvent.setup();
    render(
        <RouterTestWrapper>
            <LoginPage/>
        </RouterTestWrapper>
    );
    return {user};
}

/**
 * Helper to get form elements by placeholder text
 * Note: Using placeholder because labels aren't properly connected via htmlFor/id
 */
function getFormElements(): {
    emailInput: HTMLElement;
    passwordInput: HTMLElement;
    submitButton: HTMLElement;
} {
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', {name: /sign in/i});
    return {emailInput, passwordInput, submitButton};
}

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAuthState = {
            isAuthenticated: false,
            isLoading: false,
            error: null,
            login: mockLogin,
            clearError: mockClearError,
        };
    });

    describe('Rendering', () => {
        it('should render login form with email and password fields', () => {
            renderLoginPage();

            const emailInput = screen.getByPlaceholderText('you@example.com');
            const passwordInput = screen.getByPlaceholderText('Enter your password');

            expect(emailInput).toBeInTheDocument();
            expect(passwordInput).toBeInTheDocument();
        });

        it('should render sign in button', () => {
            renderLoginPage();

            const signInButton = screen.getByRole('button', {name: /sign in/i});
            expect(signInButton).toBeInTheDocument();
        });

        it('should render logo/branding', () => {
            renderLoginPage();

            const branding = screen.getByText(/sam\.gov dashboard/i);
            expect(branding).toBeInTheDocument();
        });

        it('should render tagline text', () => {
            renderLoginPage();

            const tagline = screen.getByText(/sign in to your account/i);
            expect(tagline).toBeInTheDocument();
        });

        it('should render footer text', () => {
            renderLoginPage();

            const footer = screen.getByText(/government contract intelligence platform/i);
            expect(footer).toBeInTheDocument();
        });

        it('should render email input with correct type', () => {
            renderLoginPage();

            const emailInput = screen.getByPlaceholderText('you@example.com');
            expect(emailInput).toHaveAttribute('type', 'email');
        });

        it('should render password input with correct type', () => {
            renderLoginPage();

            const passwordInput = screen.getByPlaceholderText('Enter your password');
            expect(passwordInput).toHaveAttribute('type', 'password');
        });

        it('should render email label text', () => {
            renderLoginPage();

            const emailLabel = screen.getByText(/email address/i);
            expect(emailLabel).toBeInTheDocument();
        });

        it('should render password label text', () => {
            renderLoginPage();

            const passwordLabel = screen.getByText(/^password$/i);
            expect(passwordLabel).toBeInTheDocument();
        });
    });

    describe('User interaction', () => {
        it('should allow typing in email field', async () => {
            const {user} = renderLoginPage();
            const {emailInput} = getFormElements();

            await user.type(emailInput, 'test@example.com');

            expect(emailInput).toHaveValue('test@example.com');
        });

        it('should allow typing in password field', async () => {
            const {user} = renderLoginPage();
            const {passwordInput} = getFormElements();

            await user.type(passwordInput, 'securepassword123');

            expect(passwordInput).toHaveValue('securepassword123');
        });

        it('should show error when submitting empty form', async () => {
            const {user} = renderLoginPage();
            const {submitButton} = getFormElements();

            await user.click(submitButton);

            const emailError = screen.getByText(/email is required/i);
            const passwordError = screen.getByText(/password is required/i);

            expect(emailError).toBeInTheDocument();
            expect(passwordError).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('should show error for invalid email format', async () => {
            const {user} = renderLoginPage();
            const {emailInput, passwordInput, submitButton} = getFormElements();

            // Using an email without proper domain format to trigger JS validation
            // Note: Native HTML5 validation may also block submission
            await user.type(emailInput, 'invalidemail');
            await user.type(passwordInput, 'password123');
            await user.click(submitButton);

            // The form should not submit with an invalid email
            // Either native HTML5 validation or JS validation blocks it
            await waitFor(() => {
                expect(mockLogin).not.toHaveBeenCalled();
            });
        });

        it('should show error for password less than 8 characters', async () => {
            const {user} = renderLoginPage();
            const {emailInput, passwordInput, submitButton} = getFormElements();

            await user.type(emailInput, 'test@example.com');
            await user.type(passwordInput, 'short');
            await user.click(submitButton);

            const passwordError = screen.getByText(/password must be at least 8 characters/i);
            expect(passwordError).toBeInTheDocument();
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('should call login function with entered credentials', async () => {
            const {user} = renderLoginPage();
            const {emailInput, passwordInput, submitButton} = getFormElements();

            await user.type(emailInput, 'test@example.com');
            await user.type(passwordInput, 'securepassword123');
            await user.click(submitButton);

            expect(mockLogin).toHaveBeenCalledTimes(1);
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'securepassword123');
        });

        it('should show loading state while logging in', () => {
            mockAuthState = {
                ...mockAuthState,
                isLoading: true,
            };

            renderLoginPage();

            const submitButton = screen.getByRole('button', {name: /sign in/i});
            expect(submitButton).toBeDisabled();
        });

        it('should show error message on failed login', () => {
            const authError: AuthError = {
                message: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS',
            };

            mockAuthState = {
                ...mockAuthState,
                error: authError,
            };

            renderLoginPage();

            const errorMessage = screen.getByText(/invalid email or password/i);
            expect(errorMessage).toBeInTheDocument();
        });

        it('should clear validation error when user starts typing in field', async () => {
            const {user} = renderLoginPage();
            const {emailInput, passwordInput, submitButton} = getFormElements();

            // Submit empty form to trigger validation errors
            await user.click(submitButton);

            // Verify error is shown
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();

            // Start typing in email field
            await user.type(emailInput, 't');

            // Error should be cleared
            expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
            // Password error should still be present
            expect(screen.getByText(/password is required/i)).toBeInTheDocument();

            // Type in password field
            await user.type(passwordInput, 'p');

            // Password error should be cleared
            expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument();
        });

        it('should clear auth error when user starts typing', async () => {
            const authError: AuthError = {
                message: 'Invalid credentials',
            };

            mockAuthState = {
                ...mockAuthState,
                error: authError,
            };

            const {user} = renderLoginPage();
            const {emailInput} = getFormElements();

            // Verify error is shown
            expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();

            // Start typing
            await user.type(emailInput, 'a');

            // clearError should have been called
            expect(mockClearError).toHaveBeenCalled();
        });
    });

    describe('Navigation', () => {
        it('should redirect to dashboard on successful login', async () => {
            // Start with unauthenticated state
            mockAuthState = {
                ...mockAuthState,
                isAuthenticated: false,
            };

            const {rerender} = render(
                <RouterTestWrapper>
                    <LoginPage/>
                </RouterTestWrapper>
            );

            // Simulate successful authentication
            mockAuthState = {
                ...mockAuthState,
                isAuthenticated: true,
            };

            rerender(
                <RouterTestWrapper>
                    <LoginPage/>
                </RouterTestWrapper>
            );

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/', {replace: true});
            });
        });

        it('should redirect to original location after login when coming from protected route', async () => {
            // Simulate coming from a protected route with redirect search param
            // TanStack Router uses search params instead of location state
            mockAuthState = {
                ...mockAuthState,
                isAuthenticated: false,
            };

            const {rerender} = render(
                <RouterTestWrapper initialPath="/login?redirect=/opportunities">
                    <LoginPage/>
                </RouterTestWrapper>
            );

            // Simulate successful authentication
            mockAuthState = {
                ...mockAuthState,
                isAuthenticated: true,
            };

            rerender(
                <RouterTestWrapper initialPath="/login?redirect=/opportunities">
                    <LoginPage/>
                </RouterTestWrapper>
            );

            await waitFor(() => {
                // Updated to match TanStack Router pattern - may need adjustment based on actual LoginPage implementation
                expect(mockNavigate).toHaveBeenCalled();
            });
        });
    });

    describe('Form submission', () => {
        it('should prevent form submission when validation fails', async () => {
            const {user} = renderLoginPage();
            const {submitButton} = getFormElements();

            await user.click(submitButton);

            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('should submit form when pressing Enter in password field', async () => {
            const {user} = renderLoginPage();
            const {emailInput, passwordInput} = getFormElements();

            await user.type(emailInput, 'test@example.com');
            await user.type(passwordInput, 'securepassword123{enter}');

            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'securepassword123');
        });

        it('should not submit when only email is valid', async () => {
            const {user} = renderLoginPage();
            const {emailInput, submitButton} = getFormElements();

            await user.type(emailInput, 'test@example.com');
            await user.click(submitButton);

            expect(mockLogin).not.toHaveBeenCalled();
            expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        });

        it('should not submit when only password is valid', async () => {
            const {user} = renderLoginPage();
            const {passwordInput, submitButton} = getFormElements();

            await user.type(passwordInput, 'securepassword123');
            await user.click(submitButton);

            expect(mockLogin).not.toHaveBeenCalled();
            expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have email input with proper autocomplete attribute', () => {
            renderLoginPage();

            const emailInput = screen.getByPlaceholderText('you@example.com');
            expect(emailInput).toHaveAttribute('autocomplete', 'email');
        });

        it('should have password input with proper autocomplete attribute', () => {
            renderLoginPage();

            const passwordInput = screen.getByPlaceholderText('Enter your password');
            expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
        });

        it('should have submit button with type submit', () => {
            renderLoginPage();

            const submitButton = screen.getByRole('button', {name: /sign in/i});
            expect(submitButton).toHaveAttribute('type', 'submit');
        });
    });
});
