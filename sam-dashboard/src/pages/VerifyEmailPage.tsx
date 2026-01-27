import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardBody, Flex, Stack, Box } from '../components/layout';
import { Text, Button, BuildingCheckIcon } from '../components/primitives';

const API_BASE = '/api/v1';

type VerificationStatus = 'loading' | 'success' | 'error' | 'no-token';

/**
 * Email verification page - handles token verification from email links
 */
export function VerifyEmailPage(): React.ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<VerificationStatus>(token !== null ? 'loading' : 'no-token');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const verifyEmail = useCallback(async (verificationToken: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok && data.success === true) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.message ?? 'Verification failed');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Unable to verify email. Please try again later.');
    }
  }, []);

  useEffect(() => {
    if (token !== null && token.length > 0) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  const renderContent = (): React.ReactElement => {
    switch (status) {
      case 'loading':
        return (
          <Stack spacing="var(--spacing-4)" style={{ textAlign: 'center' }}>
            <Text variant="heading4">Verifying your email...</Text>
            <Text variant="body" color="muted">
              Please wait while we verify your email address.
            </Text>
          </Stack>
        );

      case 'success':
        return (
          <Stack spacing="var(--spacing-4)" style={{ textAlign: 'center' }}>
            <Text variant="heading4" color="success">
              Email Verified!
            </Text>
            <Text variant="body">
              Your email has been successfully verified. You can now sign in to your account.
            </Text>
            <Button
              variant="primary"
              onClick={() => navigate('/login')}
              fullWidth
            >
              Go to Login
            </Button>
          </Stack>
        );

      case 'error':
        return (
          <Stack spacing="var(--spacing-4)" style={{ textAlign: 'center' }}>
            <Text variant="heading4" color="danger">
              Verification Failed
            </Text>
            <Text variant="body">
              {errorMessage}
            </Text>
            <Stack spacing="var(--spacing-2)">
              <Button
                variant="primary"
                onClick={() => navigate('/login')}
                fullWidth
              >
                Go to Login
              </Button>
              <Text variant="bodySmall" color="muted">
                Need a new verification link?{' '}
                <Link to="/resend-verification" style={{ color: 'var(--color-primary)' }}>
                  Resend verification email
                </Link>
              </Text>
            </Stack>
          </Stack>
        );

      case 'no-token':
        return (
          <Stack spacing="var(--spacing-4)" style={{ textAlign: 'center' }}>
            <Text variant="heading4">No Verification Token</Text>
            <Text variant="body" color="muted">
              No verification token was provided. Please check your email and click the verification link.
            </Text>
            <Button
              variant="primary"
              onClick={() => navigate('/login')}
              fullWidth
            >
              Go to Login
            </Button>
          </Stack>
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
          <CardBody padding="lg">
            <Flex justify="center" style={{ marginBottom: 'var(--spacing-4)' }}>
              <BuildingCheckIcon size="xl" color="var(--color-primary)" />
            </Flex>
            {renderContent()}
          </CardBody>
        </Card>
      </Box>
    </Flex>
  );
}

export default VerifyEmailPage;
