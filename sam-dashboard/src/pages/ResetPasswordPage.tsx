import { useState, useEffect, useCallback, FormEvent, ChangeEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardBody, Flex, Stack, Box } from '../components/layout';
import { Text, Button, Input, BuildingCheckIcon } from '../components/primitives';

const API_BASE = '/api/v1';

interface FormState {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

type PageState = 'validating' | 'invalid' | 'form' | 'success';

/**
 * Validates password strength
 */
function isStrongPassword(password: string): boolean {
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password);
}

/**
 * Validates form and returns errors
 */
function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

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

  return errors;
}

/**
 * Reset password page - handles password reset with token
 */
export function ResetPasswordPage(): React.ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [pageState, setPageState] = useState<PageState>(token !== null ? 'validating' : 'invalid');
  const [form, setForm] = useState<FormState>({ password: '', confirmPassword: '' });
  const [validationErrors, setValidationErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate token on mount
  useEffect(() => {
    if (token === null || token.length === 0) {
      setPageState('invalid');
      return;
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`${API_BASE}/auth/validate-reset-token?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (response.ok && data.valid === true) {
          setPageState('form');
        } else {
          setPageState('invalid');
        }
      } catch {
        setPageState('invalid');
      }
    };

    validateToken();
  }, [token]);

  const handleInputChange = useCallback(
    (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));

      if (validationErrors[field] !== undefined) {
        setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
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

      if (token === null) {
        setError('Invalid reset token');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE}/auth/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            newPassword: form.password,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success === true) {
          setPageState('success');
        } else {
          setError(data.message ?? 'Password reset failed');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Password reset failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [form, token]
  );

  const renderContent = (): React.ReactElement => {
    switch (pageState) {
      case 'validating':
        return (
          <CardBody padding="lg">
            <Stack spacing="var(--spacing-4)" style={{ textAlign: 'center' }}>
              <Text variant="heading4">Validating Reset Link...</Text>
              <Text variant="body" color="muted">
                Please wait while we verify your reset link.
              </Text>
            </Stack>
          </CardBody>
        );

      case 'invalid':
        return (
          <CardBody padding="lg">
            <Stack spacing="var(--spacing-4)" style={{ textAlign: 'center' }}>
              <Text variant="heading4" color="danger">
                Invalid Reset Link
              </Text>
              <Text variant="body">
                This password reset link is invalid or has expired. Please request a new one.
              </Text>
              <Stack spacing="var(--spacing-2)">
                <Button
                  variant="primary"
                  onClick={() => navigate('/forgot-password')}
                  fullWidth
                >
                  Request New Link
                </Button>
                <Link to="/login" style={{ color: 'var(--color-primary)', textAlign: 'center' }}>
                  Return to login
                </Link>
              </Stack>
            </Stack>
          </CardBody>
        );

      case 'success':
        return (
          <CardBody padding="lg">
            <Stack spacing="var(--spacing-4)" style={{ textAlign: 'center' }}>
              <Text variant="heading4" color="success">
                Password Reset Successful
              </Text>
              <Text variant="body">
                Your password has been reset. You can now sign in with your new password.
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
        );

      case 'form':
        return (
          <>
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
                    Reset Password
                  </Text>
                  <Text variant="bodySmall" color="white" style={{ opacity: 0.8 }}>
                    Enter your new password
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
                      New Password
                    </Text>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={handleInputChange('password')}
                      placeholder="Enter new password"
                      fullWidth
                      isInvalid={validationErrors.password !== undefined}
                      autoComplete="new-password"
                      autoFocus
                    />
                    {validationErrors.password !== undefined && (
                      <Text variant="caption" color="danger" style={{ marginTop: 'var(--spacing-1)' }}>
                        {validationErrors.password}
                      </Text>
                    )}
                  </Box>

                  <Box>
                    <Text
                      as="label"
                      variant="bodySmall"
                      weight="medium"
                      style={{ display: 'block', marginBottom: 'var(--spacing-1)' }}
                    >
                      Confirm Password
                    </Text>
                    <Input
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleInputChange('confirmPassword')}
                      placeholder="Confirm new password"
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

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    style={{ marginTop: 'var(--spacing-2)' }}
                  >
                    Reset Password
                  </Button>
                </Stack>
              </form>
            </CardBody>
          </>
        );
    }
  };

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
          {renderContent()}
        </Card>
      </Box>
    </Flex>
  );
}

export default ResetPasswordPage;
