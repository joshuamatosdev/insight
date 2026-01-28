import { useState, useCallback, FormEvent, ChangeEvent } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Flex,
  Stack,
  Box,
} from '../components/catalyst/layout';
import {
  Text,
  Button,
  Input,
  FormField,
  InlineAlert,
  InlineAlertDescription,
  AuthLayout,
} from '../components/catalyst/primitives';
import { BuildingCheckIcon } from '../components/catalyst/primitives/Icon';
import { Link } from '../components/catalyst/primitives/link';
import type { ForgotPasswordFormState, ForgotPasswordFormErrors } from './types';

const API_BASE = '/api/v1';

/**
 * Validates email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates form and returns errors
 */
function validateForm(form: ForgotPasswordFormState): ForgotPasswordFormErrors {
  const errors: ForgotPasswordFormErrors = {};

  if (form.email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (isValidEmail(form.email) === false) {
    errors.email = 'Please enter a valid email address';
  }

  return errors;
}

/**
 * Forgot password page - allows users to request a password reset link
 */
export function ForgotPasswordPage(): React.ReactElement {
  const [form, setForm] = useState<ForgotPasswordFormState>({ email: '' });
  const [validationErrors, setValidationErrors] = useState<ForgotPasswordFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm({ email: value });

      if (validationErrors.email !== undefined) {
        setValidationErrors({});
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

      const errors = validateForm(form);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/auth/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: form.email }),
        });

        if (response.ok === false) {
          const data = await response.json();
          throw new Error(data.message ?? 'Request failed');
        }

        setSuccess(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Request failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [form]
  );

  if (success) {
    return (
      <AuthLayout>
        <Box className="w-full max-w-md">
          <Card variant="elevated">
            <CardBody padding="lg">
              <Stack spacing="md" align="center" className="text-center">
                <Text variant="heading4" color="success">
                  Check Your Email
                </Text>
                <Text variant="body">
                  If an account exists for{' '}
                  <Text as="span" weight="semibold">{form.email}</Text>,
                  we have sent password reset instructions.
                </Text>
                <Text variant="bodySmall" color="muted">
                  Please check your inbox and spam folder.
                </Text>
                <Link href="/login" className="text-blue-600 dark:text-blue-400">
                  Return to login
                </Link>
              </Stack>
            </CardBody>
          </Card>
        </Box>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Box className="w-full max-w-md">
        <Card variant="elevated">
          <CardHeader className="bg-blue-600 border-b-0 text-center p-6">
            <Flex justify="center" align="center" direction="column" gap="sm">
              <BuildingCheckIcon size="xl" color="white" />
              <Stack spacing="xs" align="center">
                <Text variant="heading3" color="white" weight="semibold">
                  Forgot Password
                </Text>
                <Text variant="bodySmall" color="white" className="opacity-80">
                  Enter your email to reset your password
                </Text>
              </Stack>
            </Flex>
          </CardHeader>

          <CardBody padding="lg">
            <Box as="form" onSubmit={handleSubmit}>
              <Stack spacing="md">
                {error !== null && (
                  <InlineAlert color="error">
                    <InlineAlertDescription>
                      {error}
                    </InlineAlertDescription>
                  </InlineAlert>
                )}

                <FormField
                  label="Email Address"
                  error={validationErrors.email}
                >
                  <Input
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    invalid={validationErrors.email !== undefined}
                    autoComplete="email"
                    autoFocus
                  />
                </FormField>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  className="mt-2"
                  isLoading={isLoading}
                  isDisabled={isLoading}
                >
                  Send Reset Link
                </Button>

                <Text variant="bodySmall" className="text-center">
                  Remember your password?{' '}
                  <Link href="/login" className="text-blue-600 dark:text-blue-400">
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

export default ForgotPasswordPage;
