import { useState, useCallback, FormEvent, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Flex, Stack, Box } from '../components/layout';
import { Text, Button, Input, BuildingCheckIcon } from '../components/primitives';
import type { RegisterFormState, RegisterFormErrors } from './RegisterPage.types';

const API_BASE = '/api/v1';

/**
 * Validates email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength
 */
function isStrongPassword(password: string): boolean {
  // At least 8 chars, one uppercase, one lowercase, one number
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);
}

/**
 * Validates registration form and returns errors
 */
function validateForm(form: RegisterFormState): RegisterFormErrors {
  const errors: RegisterFormErrors = {};

  if (form.firstName.trim().length === 0) {
    errors.firstName = 'First name is required';
  }

  if (form.lastName.trim().length === 0) {
    errors.lastName = 'Last name is required';
  }

  if (form.email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (isValidEmail(form.email) === false) {
    errors.email = 'Please enter a valid email address';
  }

  if (form.password.length === 0) {
    errors.password = 'Password is required';
  } else if (isStrongPassword(form.password) === false) {
    errors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
  }

  if (form.confirmPassword.length === 0) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (form.acceptTerms === false) {
    errors.acceptTerms = 'You must accept the terms of service';
  }

  return errors;
}

/**
 * Registration page component
 */
export function RegisterPage(): React.ReactElement {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterFormState>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    organizationName: '',
    acceptTerms: false,
  });
  const [validationErrors, setValidationErrors] = useState<RegisterFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = useCallback(
    (field: keyof RegisterFormState) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));

      // Clear validation error for this field when user types
      const errorKey = field as keyof RegisterFormErrors;
      if (validationErrors[errorKey] !== undefined) {
        setValidationErrors((prev) => ({ ...prev, [errorKey]: undefined }));
      }

      // Clear error when user starts typing
      if (error !== null) {
        setError(null);
      }
    },
    [validationErrors, error]
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

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            firstName: form.firstName,
            lastName: form.lastName,
            organizationName: form.organizationName.trim().length > 0 ? form.organizationName : undefined,
          }),
        });

        if (response.ok === false) {
          const data = await response.json();
          throw new Error(data.message ?? 'Registration failed');
        }

        // Show success message
        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [form]
  );

  if (success) {
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
            <CardBody padding="lg">
              <Stack spacing="var(--spacing-4)" style={{ textAlign: 'center' }}>
                <Text variant="heading4" color="success">
                  Registration Successful!
                </Text>
                <Text variant="body">
                  We have sent a verification email to <strong>{form.email}</strong>.
                  Please check your inbox and click the verification link to activate your account.
                </Text>
                <Button
                  variant="primary"
                  onClick={() => navigate('/login')}
                  fullWidth
                >
                  Go to Login
                </Button>
              </Stack>
            </CardBody>
          </Card>
        </Box>
      </Flex>
    );
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
      <Box style={{ width: '100%', maxWidth: '450px' }}>
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
                  Create Account
                </Text>
                <Text variant="bodySmall" color="white" style={{ opacity: 0.8 }}>
                  Start your contract intelligence journey
                </Text>
              </Stack>
            </Flex>
          </CardHeader>

          <CardBody padding="lg">
            <form onSubmit={handleSubmit}>
              <Stack spacing="var(--spacing-4)">
                {/* Error message */}
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
                      {error}
                    </Text>
                  </Box>
                )}

                {/* Name fields */}
                <Flex gap="md">
                  <Box style={{ flex: 1 }}>
                    <Text
                      as="label"
                      variant="bodySmall"
                      weight="medium"
                      style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}
                    >
                      First Name *
                    </Text>
                    <Input
                      type="text"
                      value={form.firstName}
                      onChange={handleInputChange('firstName')}
                      placeholder="John"
                      fullWidth
                      isInvalid={validationErrors.firstName !== undefined}
                      autoComplete="given-name"
                      autoFocus
                    />
                    {validationErrors.firstName !== undefined && (
                      <Text variant="caption" color="danger" style={{ marginTop: 'var(--spacing-1)' }}>
                        {validationErrors.firstName}
                      </Text>
                    )}
                  </Box>
                  <Box style={{ flex: 1 }}>
                    <Text
                      as="label"
                      variant="bodySmall"
                      weight="medium"
                      style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}
                    >
                      Last Name *
                    </Text>
                    <Input
                      type="text"
                      value={form.lastName}
                      onChange={handleInputChange('lastName')}
                      placeholder="Doe"
                      fullWidth
                      isInvalid={validationErrors.lastName !== undefined}
                      autoComplete="family-name"
                    />
                    {validationErrors.lastName !== undefined && (
                      <Text variant="caption" color="danger" style={{ marginTop: 'var(--spacing-1)' }}>
                        {validationErrors.lastName}
                      </Text>
                    )}
                  </Box>
                </Flex>

                {/* Email field */}
                <Box>
                  <Text
                    as="label"
                    variant="bodySmall"
                    weight="medium"
                    style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}
                  >
                    Email Address *
                  </Text>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={handleInputChange('email')}
                    placeholder="you@company.com"
                    fullWidth
                    isInvalid={validationErrors.email !== undefined}
                    autoComplete="email"
                  />
                  {validationErrors.email !== undefined && (
                    <Text variant="caption" color="danger" style={{ marginTop: 'var(--spacing-1)' }}>
                      {validationErrors.email}
                    </Text>
                  )}
                </Box>

                {/* Organization field */}
                <Box>
                  <Text
                    as="label"
                    variant="bodySmall"
                    weight="medium"
                    style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}
                  >
                    Organization Name
                  </Text>
                  <Input
                    type="text"
                    value={form.organizationName}
                    onChange={handleInputChange('organizationName')}
                    placeholder="Your Company LLC"
                    fullWidth
                    autoComplete="organization"
                  />
                  <Text variant="caption" color="muted" style={{ marginTop: 'var(--spacing-1)' }}>
                    Optional. Creates a new organization with you as admin.
                  </Text>
                </Box>

                {/* Password field */}
                <Box>
                  <Text
                    as="label"
                    variant="bodySmall"
                    weight="medium"
                    style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}
                  >
                    Password *
                  </Text>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={handleInputChange('password')}
                    placeholder="Create a strong password"
                    fullWidth
                    isInvalid={validationErrors.password !== undefined}
                    autoComplete="new-password"
                  />
                  {validationErrors.password !== undefined && (
                    <Text variant="caption" color="danger" style={{ marginTop: 'var(--spacing-1)' }}>
                      {validationErrors.password}
                    </Text>
                  )}
                </Box>

                {/* Confirm Password field */}
                <Box>
                  <Text
                    as="label"
                    variant="bodySmall"
                    weight="medium"
                    style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}
                  >
                    Confirm Password *
                  </Text>
                  <Input
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    placeholder="Confirm your password"
                    fullWidth
                    isInvalid={validationErrors.confirmPassword !== undefined}
                    autoComplete="new-password"
                  />
                  {validationErrors.confirmPassword !== undefined && (
                    <Text variant="caption" color="danger" style={{ marginTop: 'var(--spacing-1)' }}>
                      {validationErrors.confirmPassword}
                    </Text>
                  )}
                </Box>

                {/* Terms checkbox */}
                <Box>
                  <Flex align="start" gap="sm">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={form.acceptTerms}
                      onChange={handleInputChange('acceptTerms')}
                      style={{ marginTop: '4px' }}
                    />
                    <Text as="label" variant="bodySmall" htmlFor="acceptTerms">
                      I agree to the Terms of Service and Privacy Policy
                    </Text>
                  </Flex>
                  {validationErrors.acceptTerms !== undefined && (
                    <Text variant="caption" color="danger" style={{ marginTop: 'var(--spacing-1)' }}>
                      {validationErrors.acceptTerms}
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
                  Create Account
                </Button>

                {/* Login link */}
                <Text variant="bodySmall" style={{ textAlign: 'center' }}>
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: 'var(--color-primary)' }}>
                    Sign in
                  </Link>
                </Text>
              </Stack>
            </form>
          </CardBody>
        </Card>
      </Box>
    </Flex>
  );
}

export default RegisterPage;
