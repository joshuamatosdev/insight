import { useState, useCallback, FormEvent, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Flex, Stack, Box } from '../components/layout';
import { Text, Button, Input, BuildingCheckIcon } from '../components/primitives';

const API_BASE = '/api/v1';

interface FormState {
  email: string;
}

interface FormErrors {
  email?: string;
}

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
function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

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
  const [form, setForm] = useState<FormState>({ email: '' });
  const [validationErrors, setValidationErrors] = useState<FormErrors>({});
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
          backgroundColor: 'var(--color-gray-100)',
          padding: 'var(--spacing-4)',
        }}
      >
        <Box style={{ width: '100%', maxWidth: '400px' }}>
          <Card variant="elevated">
            <CardBody padding="lg">
              <Stack spacing="var(--spacing-4)" style={{ textAlign: 'center' }}>
                <Text variant="heading4" color="success">
                  Check Your Email
                </Text>
                <Text variant="body">
                  If an account exists for <strong>{form.email}</strong>, we have sent password reset instructions.
                </Text>
                <Text variant="bodySmall" color="muted">
                  Please check your inbox and spam folder.
                </Text>
                <Link to="/login" style={{ color: 'var(--color-primary)' }}>
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
              <Stack spacing="var(--spacing-4)">
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

                <Box>
                  <Text
                    as="label"
                    variant="bodySmall"
                    weight="medium"
                    style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}
                  >
                    Email Address
                  </Text>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                    fullWidth
                    isInvalid={validationErrors.email !== undefined}
                    autoComplete="email"
                    autoFocus
                  />
                  {validationErrors.email !== undefined && (
                    <Text variant="caption" color="danger" style={{ marginTop: 'var(--spacing-1)' }}>
                      {validationErrors.email}
                    </Text>
                  )}
                </Box>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  isDisabled={isLoading}
                  style={{ marginTop: 'var(--spacing-2)' }}
                >
                  Send Reset Link
                </Button>

                <Text variant="bodySmall" style={{ textAlign: 'center' }}>
                  Remember your password?{' '}
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

export default ForgotPasswordPage;
