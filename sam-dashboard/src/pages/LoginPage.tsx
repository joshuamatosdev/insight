import { useState, useCallback, FormEvent, ChangeEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import { Card, CardHeader, CardBody, Flex, Stack, Box } from '../components/layout';
import { Text, Button, Input, BuildingCheckIcon } from '../components/primitives';
import type { LoginFormState, LoginFormErrors } from './LoginPage.types';

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
  const { login, isLoading, error, clearError } = useAuth();

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
      setForm((prev) => ({ ...prev, [field]: value }));

      // Clear validation error for this field when user types
      if (validationErrors[field] !== undefined) {
        setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
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

  // Navigate on successful authentication
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    navigate(from, { replace: true });
  }

  return (
    <Flex
      justify="center"
      align="center"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-gray-100)',
        padding: 'var(--spacing-4)',
      }}
    >
      <Box style={{ width: '100%', maxWidth: '400px' }}>
        <Card variant="elevated">
          <CardHeader
            style={{
              backgroundColor: 'var(--color-primary)',
              borderBottom: 'none',
              textAlign: 'center',
              padding: 'var(--spacing-6)',
            }}
          >
            <Flex justify="center" align="center" direction="column" gap="sm">
              <BuildingCheckIcon size="xl" color="white" />
              <Stack spacing="var(--spacing-1)" style={{ alignItems: 'center' }}>
                <Text variant="heading3" color="white" weight="semibold">
                  SAM.gov Dashboard
                </Text>
                <Text variant="bodySmall" color="white" style={{ opacity: 0.8 }}>
                  Sign in to your account
                </Text>
              </Stack>
            </Flex>
          </CardHeader>

          <CardBody padding="lg">
            <form onSubmit={handleSubmit}>
              <Stack spacing="var(--spacing-4)">
                {/* Error message from authentication */}
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
                      {error.message}
                    </Text>
                  </Box>
                )}

                {/* Email field */}
                <Box>
                  <Text
                    as="label"
                    variant="bodySmall"
                    weight="medium"
                    style={{
                      display: 'block',
                      marginBottom: 'var(--spacing-1)',
                    }}
                  >
                    Email Address
                  </Text>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={handleInputChange('email')}
                    placeholder="you@example.com"
                    fullWidth
                    isInvalid={validationErrors.email !== undefined}
                    autoComplete="email"
                    autoFocus
                  />
                  {validationErrors.email !== undefined && (
                    <Text
                      variant="caption"
                      color="danger"
                      style={{ marginTop: 'var(--spacing-1)' }}
                    >
                      {validationErrors.email}
                    </Text>
                  )}
                </Box>

                {/* Password field */}
                <Box>
                  <Text
                    as="label"
                    variant="bodySmall"
                    weight="medium"
                    style={{
                      display: 'block',
                      marginBottom: 'var(--spacing-1)',
                    }}
                  >
                    Password
                  </Text>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={handleInputChange('password')}
                    placeholder="Enter your password"
                    fullWidth
                    isInvalid={validationErrors.password !== undefined}
                    autoComplete="current-password"
                  />
                  {validationErrors.password !== undefined && (
                    <Text
                      variant="caption"
                      color="danger"
                      style={{ marginTop: 'var(--spacing-1)' }}
                    >
                      {validationErrors.password}
                    </Text>
                  )}
                </Box>

                {/* Submit button */}
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  isDisabled={isLoading}
                  style={{ marginTop: 'var(--spacing-2)' }}
                >
                  Sign In
                </Button>
              </Stack>
            </form>
          </CardBody>
        </Card>

        {/* Footer text */}
        <Text
          variant="caption"
          color="muted"
          style={{
            textAlign: 'center',
            marginTop: 'var(--spacing-4)',
            display: 'block',
          }}
        >
          Government Contract Intelligence Platform
        </Text>
      </Box>
    </Flex>
  );
}

export default LoginPage;
