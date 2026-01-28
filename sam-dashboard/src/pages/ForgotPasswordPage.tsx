import { useState, useCallback, FormEvent, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Flex, Stack, Box } from '../components/catalyst/layout';
import { Text, Button, Input, BuildingCheckIcon } from '../components/catalyst/primitives';
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
      <Flex
        justify="center"
        align="center"
        style={{
          minHeight: '100vh',
          backgroundColor: '#f4f4f5',
          padding: '1rem',
        }}
      >
        <Box style={{ width: '100%', maxWidth: '400px' }}>
          <Card variant="elevated">
            <CardBody padding="lg">
              <Stack spacing="md" style={{ textAlign: 'center' }}>
                <Text variant="heading4" color="success">
                  Check Your Email
                </Text>
                <Text variant="body">
                  If an account exists for <strong>{form.email}</strong>, we have sent password reset instructions.
                </Text>
                <Text variant="bodySmall" color="muted">
                  Please check your inbox and spam folder.
                </Text>
                <Link to="/login" className="text-primary">
                  Return to login
                </Link>
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
        backgroundColor: '#f4f4f5',
        padding: '1rem',
      }}
    >
      <Box style={{ width: '100%', maxWidth: '400px' }}>
        <Card variant="elevated">
          <CardHeader
            style={{
              backgroundColor: '#2563eb',
              borderBottom: 'none',
              textAlign: 'center',
              padding: '1.5rem',
            }}
          >
            <Flex justify="center" align="center" direction="column" gap="sm">
              <BuildingCheckIcon size="xl" color="white" />
              <Stack spacing="xs" style={{ alignItems: 'center' }}>
                <Text variant="heading3" color="white" weight="semibold">
                  Forgot Password
                </Text>
                <Text variant="bodySmall" color="white" style={{ opacity: 0.8 }}>
                  Enter your email to reset your password
                </Text>
              </Stack>
            </Flex>
          </CardHeader>

          <CardBody padding="lg">
            <form onSubmit={handleSubmit}>
              <Stack spacing="md">
                {error !== null && (
                  <Box
                    style={{
                      padding: '0.75rem',
                      backgroundColor: '#fef2f2',
                      borderRadius: '0.375rem',
                      border: '1px solid #ef4444',
                    }}
                  >
                    <Text variant="bodySmall" color="danger">
                      {error}
                    </Text>
                  </Box>
                )}

                <Box>
                  <Text
                    as="label"
                    variant="bodySmall"
                    weight="medium"
                    className="block mb-1"
                  >
                    Email Address
                  </Text>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    invalid={validationErrors.email !== undefined}
                    autoComplete="email"
                    autoFocus
                  />
                  {validationErrors.email !== undefined && (
                    <Text variant="caption" color="danger" className="mt-1">
                      {validationErrors.email}
                    </Text>
                  )}
                </Box>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  isLoading={isLoading}
                  isDisabled={isLoading}
                >
                  Send Reset Link
                </Button>

                <Text variant="bodySmall" style={{ textAlign: 'center' }}>
                  Remember your password?{' '}
                  <Link to="/login" className="text-primary">
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

export default ForgotPasswordPage;
