import {useEffect, useRef, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {Box, Card, CardBody, Flex, Stack,} from '../components/catalyst/layout';
import {AuthLayout, Button, Text,} from '../components/catalyst/primitives';
import {BuildingCheckIcon} from '../components/catalyst/primitives/Icon';
import {processOAuthCallback} from '../services/oauthService';
import {useAuth} from '../auth';

type CallbackStatus = 'processing' | 'success' | 'error';

/**
 * OAuth callback page - handles the redirect from OAuth providers
 */
export function OAuthCallbackPage(): React.ReactElement {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuthData } = useAuth();

  const [status, setStatus] = useState<CallbackStatus>('processing');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current === true) {
      return;
    }
    processedRef.current = true;

    const provider = searchParams.get('provider');
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error !== null) {
      setStatus('error');
      setErrorMessage(searchParams.get('error_description') ?? 'Authentication was cancelled or failed');
      return;
    }

    if (provider === null || code === null) {
      setStatus('error');
      setErrorMessage('Invalid OAuth callback - missing provider or code');
      return;
    }

    // Process the OAuth callback
    // In a real implementation, the backend would exchange the code for tokens
    // and return user info. For now, we'll simulate this.
    const processCallback = async () => {
      try {
        // This would normally be handled entirely by the backend
        // The frontend just sends the code, and the backend does the exchange
        const response = await processOAuthCallback({
          provider,
          providerUserId: searchParams.get('user_id') ?? '',
          email: searchParams.get('email') ?? '',
          firstName: searchParams.get('first_name') ?? undefined,
          lastName: searchParams.get('last_name') ?? undefined,
          accessToken: searchParams.get('access_token') ?? undefined,
          refreshToken: searchParams.get('refresh_token') ?? undefined,
        });

        // Store auth data
        setAuthData({
          token: response.accessToken,
          refreshToken: response.refreshToken,
          user: response.user,
        });

        setStatus('success');

        // Redirect to dashboard after short delay
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1500);
      } catch (err) {
        setStatus('error');
        setErrorMessage(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    processCallback();
  }, [searchParams, navigate, setAuthData]);

  const renderContent = (): React.ReactElement => {
    switch (status) {
      case 'processing':
        return (
          <Stack spacing="md" align="center">
            <Text variant="heading4">Completing sign in...</Text>
            <Text variant="body" color="muted">
              Please wait while we authenticate your account.
            </Text>
          </Stack>
        );

      case 'success':
        return (
          <Stack spacing="md" align="center">
            <Text variant="heading4" color="success">
              Sign in successful!
            </Text>
            <Text variant="body">
              Redirecting you to the dashboard...
            </Text>
          </Stack>
        );

      case 'error':
        return (
          <Stack spacing="md" align="center">
            <Text variant="heading4" color="danger">
              Sign in failed
            </Text>
            <Text variant="body">
              {errorMessage}
            </Text>
            <Button
              variant="primary"
              onClick={() => navigate('/login')}
              fullWidth
            >
              Return to login
            </Button>
          </Stack>
        );
    }
  };

  return (
    <AuthLayout>
      <Box>
        <Card variant="elevated">
          <CardBody padding="lg">
            <Flex justify="center">
              <BuildingCheckIcon size="xl" />
            </Flex>
            {renderContent()}
          </CardBody>
        </Card>
      </Box>
    </AuthLayout>
  );
}

export default OAuthCallbackPage;
