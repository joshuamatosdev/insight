import { useState, useEffect } from 'react';
import { Flex, Stack, Box } from '../../components/catalyst/layout';
import { Button, Text } from '../../components/catalyst/primitives';
import { fetchOAuthProviders, getProviderInfo, initiateOAuthLogin } from '../../services/oauthService';

/**
 * Social login buttons component for OAuth providers
 */
export function SocialLoginButtons(): React.ReactElement | null {
  const [providers, setProviders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const response = await fetchOAuthProviders();
        setProviders(response.providers);
        setIsEnabled(response.enabled);
      } catch {
        // OAuth not available, silently fail
        setProviders([]);
        setIsEnabled(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadProviders();
  }, []);

  if (isLoading === true) {
    return null;
  }

  if (isEnabled === false || providers.length === 0) {
    return null;
  }

  const handleProviderClick = (provider: string) => {
    initiateOAuthLogin(provider);
  };

  return (
    <Stack spacing="md">
      <Flex align="center" gap="md">
        <Box style={{ flex: 1, height: '1px', backgroundColor: '#d4d4d8' }} />
        <Text variant="caption" color="muted">
          or continue with
        </Text>
        <Box style={{ flex: 1, height: '1px', backgroundColor: '#d4d4d8' }} />
      </Flex>

      <Stack spacing="sm">
        {providers.map((providerId) => {
          const provider = getProviderInfo(providerId);
          return (
            <SocialButton
              key={provider.id}
              provider={provider}
              onClick={() => handleProviderClick(provider.id)}
            />
          );
        })}
      </Stack>
    </Stack>
  );
}

interface SocialButtonProps {
  provider: {
    id: string;
    name: string;
    icon: string;
  };
  onClick: () => void;
}

function SocialButton({ provider, onClick }: SocialButtonProps): React.ReactElement {
  const getProviderStyles = (providerId: string): React.CSSProperties => {
    switch (providerId) {
      case 'google':
        return {
          backgroundColor: 'white',
          border: '1px solid #d4d4d8',
          color: '#3f3f46',
        };
      case 'microsoft':
        return {
          backgroundColor: '#2F2F2F',
          border: 'none',
          color: 'white',
        };
      default:
        return {
          backgroundColor: '#f4f4f5',
          border: '1px solid #d4d4d8',
          color: '#3f3f46',
        };
    }
  };

  return (
    <Button
      variant="secondary"
      className="w-full"
      onClick={onClick}
      style={{
        ...getProviderStyles(provider.id),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
      }}
    >
      <ProviderIcon provider={provider.id} />
      <span>Continue with {provider.name}</span>
    </Button>
  );
}

function ProviderIcon({ provider }: { provider: string }): React.ReactElement {
  // Simple SVG icons for providers
  switch (provider) {
    case 'google':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      );
    case 'microsoft':
      return (
        <svg width="18" height="18" viewBox="0 0 23 23">
          <rect x="1" y="1" width="10" height="10" fill="#F25022" />
          <rect x="12" y="1" width="10" height="10" fill="#7FBA00" />
          <rect x="1" y="12" width="10" height="10" fill="#00A4EF" />
          <rect x="12" y="12" width="10" height="10" fill="#FFB900" />
        </svg>
      );
    default:
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
        </svg>
      );
  }
}

export default SocialLoginButtons;
