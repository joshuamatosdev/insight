import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Card, CardBody, Flex, Stack, Box } from '../components/catalyst/layout';
import { Text, Button, BuildingCheckIcon } from '../components/catalyst/primitives';
import type { VerificationStatus, VerifyEmailResult } from './types';

const API_BASE = '/api/v1';

/**
 * Verify email token with the API
 */
async function verifyEmailToken(verificationToken: string): Promise<VerifyEmailResult> {
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
      return { success: true, message: 'Email verified successfully' };
    } else {
      return { success: false, message: data.message ?? 'Verification failed' };
    }
  } catch {
    return { success: false, message: 'Unable to verify email. Please try again later.' };
  }
}

/**
 * Email verification page - handles token verification from email links
 */
export function VerifyEmailPage(): React.ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<VerificationStatus>(token !== null ? 'loading' : 'no-token');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const verificationAttempted = useRef(false);

  useEffect(() => {
    if (token === null || token.length === 0 || verificationAttempted.current === true) {
      return;
    }

    verificationAttempted.current = true;

    // Use an abort controller for cleanup
    const abortController = new AbortController();

    verifyEmailToken(token).then((result) => {
      if (abortController.signal.aborted === false) {
        if (result.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMessage(result.message);
        }
      }
    });

    return () => {
      abortController.abort();
    };
  }, [token]);

  const renderContent = (): React.ReactElement => {
    switch (status) {
      case 'loading':
        return (
          <Stack spacing="md" style={{ textAlign: 'center' }}>
            <Text variant="heading4">Verifying your email...</Text>
            <Text variant="body" color="muted">
              Please wait while we verify your email address.
            </Text>
          </Stack>
        );

      case 'success':
        return (
          <Stack spacing="md" style={{ textAlign: 'center' }}>
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
          <Stack spacing="md" style={{ textAlign: 'center' }}>
            <Text variant="heading4" color="danger">
              Verification Failed
            </Text>
            <Text variant="body">
              {errorMessage}
            </Text>
            <Stack spacing="sm">
              <Button
                variant="primary"
                onClick={() => navigate('/login')}
                fullWidth
              >
                Go to Login
              </Button>
              <Text variant="bodySmall" color="muted">
                Need a new verification link?{' '}
                <Link to="/resend-verification" className="text-primary">
                  Resend verification email
                </Link>
              </Text>
            </Stack>
          </Stack>
        );

      case 'no-token':
        return (
          <Stack spacing="md" style={{ textAlign: 'center' }}>
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
        backgroundColor: '#f4f4f5',
        padding: '1rem',
      }}
    >
      <Box style={{ width: '100%', maxWidth: '400px' }}>
        <Card variant="elevated">
          <CardBody padding="lg">
            <Flex justify="center" className="mb-4">
              <BuildingCheckIcon size="xl" className="text-blue-600 dark:text-blue-400" />
            </Flex>
            {renderContent()}
          </CardBody>
        </Card>
      </Box>
    </Flex>
  );
}

export default VerifyEmailPage;
