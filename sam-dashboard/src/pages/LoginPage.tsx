import {ChangeEvent, FormEvent, useCallback, useEffect, useState} from 'react';
import {useLocation, useNavigate} from '@tanstack/react-router';
import {useAuth} from '../auth';
import {Box, Card, CardBody, CardHeader, Flex, Stack,} from '../components/catalyst/layout';
import {
    AuthLayout,
    Button,
    FormField,
    InlineAlert,
    InlineAlertDescription,
    Input,
    Text,
} from '../components/catalyst/primitives';
import {BuildingCheckIcon} from '../components/catalyst/primitives/Icon';
import type {LoginFormErrors, LoginFormState} from './LoginPage.types';

/**
 * Validates email format
 */
function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates login form and returns errors
 */
function validateForm(form: LoginFormState): LoginFormErrors {
    const errors: LoginFormErrors = {};

    if (form.email.trim().length === 0) {
        errors.email = 'Email is required';
    } else if (isValidEmail(form.email) === false) {
        errors.email = 'Please enter a valid email address';
    }

    if (form.password.length === 0) {
        errors.password = 'Password is required';
    } else if (form.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
    }

    return errors;
}

/**
 * Login page component with email/password authentication
 */
export function LoginPage(): React.ReactElement {
    const navigate = useNavigate();
    const location = useLocation();
    const {login, isLoading, error, clearError} = useAuth();

    const [form, setForm] = useState<LoginFormState>({
        email: '',
        password: '',
    });
    const [validationErrors, setValidationErrors] = useState<LoginFormErrors>({});

    // Get the redirect path from location state, default to dashboard
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/';

    const handleInputChange = useCallback(
        (field: keyof LoginFormState) => (event: ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            setForm((prev) => ({...prev, [field]: value}));

            // Clear validation error for this field when user types
            if (validationErrors[field] !== undefined) {
                setValidationErrors((prev) => ({...prev, [field]: undefined}));
            }

            // Clear auth error when user starts typing
            if (error !== null) {
                clearError();
            }
        },
        [validationErrors, error, clearError]
    );

    const handleSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            // Validate form
            const errors = validateForm(form);
            if (Object.keys(errors).length > 0) {
                setValidationErrors(errors);
                return;
            }

            // Attempt login
            await login(form.email, form.password);

            // If successful, navigate to the originally requested page
            // The login function updates isAuthenticated, which we check here
            // The navigation happens in useEffect or we check the result
        },
        [form, login]
    );

    // Get isAuthenticated from the same useAuth call
    const {isAuthenticated} = useAuth();

    // Navigate on successful authentication (in useEffect to avoid setState during render)
    useEffect(() => {
        if (isAuthenticated) {
            navigate({to: from, replace: true});
        }
    }, [isAuthenticated, navigate, from]);

    return (
        <AuthLayout>
            <Box>
                <Card variant="elevated">
                    <CardHeader>
                        <Flex justify="center" align="center" direction="column" gap="sm">
                            <BuildingCheckIcon size="xl" color="white"/>
                            <Stack spacing="xs" align="center">
                                <Text variant="heading3" color="white" weight="semibold">
                                    SAM.gov Dashboard
                                </Text>
                                <Text variant="bodySmall" color="white">
                                    Sign in to your account
                                </Text>
                            </Stack>
                        </Flex>
                    </CardHeader>

                    <CardBody padding="lg">
                        <Box as="form" onSubmit={handleSubmit}>
                            <Stack spacing="md">
                                {/* Error message from authentication */}
                                {error !== null && (
                                    <InlineAlert color="error">
                                        <InlineAlertDescription>
                                            {error.message}
                                        </InlineAlertDescription>
                                    </InlineAlert>
                                )}

                                {/* Email field */}
                                <FormField
                                    label="Email Address"
                                    error={validationErrors.email}
                                >
                                    <Input
                                        type="email"
                                        value={form.email}
                                        onChange={handleInputChange('email')}
                                        placeholder="you@example.com"
                                        invalid={validationErrors.email !== undefined}
                                        autoComplete="email"
                                        autoFocus
                                    />
                                </FormField>

                                {/* Password field */}
                                <FormField
                                    label="Password"
                                    error={validationErrors.password}
                                >
                                    <Input
                                        type="password"
                                        value={form.password}
                                        onChange={handleInputChange('password')}
                                        placeholder="Enter your password"
                                        invalid={validationErrors.password !== undefined}
                                        autoComplete="current-password"
                                    />
                                </FormField>

                                {/* Submit button */}
                                <Button
                                    type="submit"
                                    variant="primary"
                                    fullWidth
                                    isLoading={isLoading}
                                    isDisabled={isLoading}
                                >
                                    Sign In
                                </Button>
                            </Stack>
                        </Box>
                    </CardBody>
                </Card>

                {/* Footer text */}
                <Text
                    variant="caption"
                    color="muted"
                >
                    Government Contract Intelligence Platform
                </Text>
            </Box>
        </AuthLayout>
    );
}

export default LoginPage;
