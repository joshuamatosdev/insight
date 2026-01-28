import {ChangeEvent, FormEvent, useCallback, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Box, Card, CardBody, CardHeader, Flex, HStack, Stack,} from '../components/catalyst/layout';
import {
    AuthLayout,
    Button,
    Checkbox,
    CheckboxField,
    FormField,
    InlineAlert,
    InlineAlertDescription,
    Input,
    Text,
} from '../components/catalyst/primitives';
import {BuildingCheckIcon} from '../components/catalyst/primitives/Icon';
import {Link} from '../components/catalyst/primitives/link';
import type {RegisterFormErrors, RegisterFormState} from './RegisterPage.types';

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

  const handleCheckboxChange = useCallback(
    (checked: boolean) => {
      setForm((prev) => ({ ...prev, acceptTerms: checked }));

      if (validationErrors.acceptTerms !== undefined) {
        setValidationErrors((prev) => ({ ...prev, acceptTerms: undefined }));
      }

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
      <AuthLayout>
        <Box>
          <Card variant="elevated">
            <CardBody padding="lg">
              <Stack spacing="md" align="center">
                <Text variant="heading4" color="success">
                  Registration Successful!
                </Text>
                <Text variant="body">
                  We have sent a verification email to{' '}
                  <Text as="span" weight="semibold">{form.email}</Text>.
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
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Box>
        <Card variant="elevated">
          <CardHeader>
            <Flex justify="center" align="center" direction="column" gap="sm">
              <BuildingCheckIcon size="xl" color="white" />
              <Stack spacing="xs" align="center">
                <Text variant="heading3" color="white" weight="semibold">
                  Create Account
                </Text>
                <Text variant="bodySmall" color="white">
                  Start your contract intelligence journey
                </Text>
              </Stack>
            </Flex>
          </CardHeader>

          <CardBody padding="lg">
            <Box as="form" onSubmit={handleSubmit}>
              <Stack spacing="md">
                {/* Error message */}
                {error !== null && (
                  <InlineAlert color="error">
                    <InlineAlertDescription>
                      {error}
                    </InlineAlertDescription>
                  </InlineAlert>
                )}

                {/* Name fields */}
                <HStack gap="md" align="start">
                  <Box>
                    <FormField
                      label="First Name"
                      required
                      error={validationErrors.firstName}
                    >
                      <Input
                        type="text"
                        value={form.firstName}
                        onChange={handleInputChange('firstName')}
                        placeholder="John"
                        invalid={validationErrors.firstName !== undefined}
                        autoComplete="given-name"
                        autoFocus
                      />
                    </FormField>
                  </Box>
                  <Box>
                    <FormField
                      label="Last Name"
                      required
                      error={validationErrors.lastName}
                    >
                      <Input
                        type="text"
                        value={form.lastName}
                        onChange={handleInputChange('lastName')}
                        placeholder="Doe"
                        invalid={validationErrors.lastName !== undefined}
                        autoComplete="family-name"
                      />
                    </FormField>
                  </Box>
                </HStack>

                {/* Email field */}
                <FormField
                  label="Email Address"
                  required
                  error={validationErrors.email}
                >
                  <Input
                    type="email"
                    value={form.email}
                    onChange={handleInputChange('email')}
                    placeholder="you@company.com"
                    invalid={validationErrors.email !== undefined}
                    autoComplete="email"
                  />
                </FormField>

                {/* Organization field */}
                <FormField
                  label="Organization Name"
                  hint="Optional. Creates a new organization with you as admin."
                >
                  <Input
                    type="text"
                    value={form.organizationName}
                    onChange={handleInputChange('organizationName')}
                    placeholder="Your Company LLC"
                    autoComplete="organization"
                  />
                </FormField>

                {/* Password field */}
                <FormField
                  label="Password"
                  required
                  error={validationErrors.password}
                >
                  <Input
                    type="password"
                    value={form.password}
                    onChange={handleInputChange('password')}
                    placeholder="Create a strong password"
                    invalid={validationErrors.password !== undefined}
                    autoComplete="new-password"
                  />
                </FormField>

                {/* Confirm Password field */}
                <FormField
                  label="Confirm Password"
                  required
                  error={validationErrors.confirmPassword}
                >
                  <Input
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    placeholder="Confirm your password"
                    invalid={validationErrors.confirmPassword !== undefined}
                    autoComplete="new-password"
                  />
                </FormField>

                {/* Terms checkbox */}
                <Stack spacing="xs">
                  <CheckboxField>
                    <Checkbox
                      checked={form.acceptTerms}
                      onChange={handleCheckboxChange}
                      color="blue"
                    />
                    <Text as="label" variant="bodySmall">
                      I agree to the Terms of Service and Privacy Policy
                    </Text>
                  </CheckboxField>
                  {validationErrors.acceptTerms !== undefined && (
                    <Text variant="caption" color="danger">
                      {validationErrors.acceptTerms}
                    </Text>
                  )}
                </Stack>

                {/* Submit button */}
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  isDisabled={isLoading}
                >
                  Create Account
                </Button>

                {/* Login link */}
                <Text variant="bodySmall">
                  Already have an account?{' '}
                  <Link href="/login">
                    Sign in
                  </Link>
                </Text>
              </Stack>
            </Box>
          </CardBody>
        </Card>
      </Box>
    </AuthLayout>
  );
}

export default RegisterPage;
