import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Flex, Stack, Box } from '../components/layout';
import { Text, Button } from '../components/primitives';

interface ErrorPageProps {
  code?: '404' | '403' | '500' | '503';
  title?: string;
  message?: string;
}

/**
 * Error page component for HTTP error states.
 */
export function ErrorPage({
  code = '500',
  title,
  message,
}: ErrorPageProps): React.ReactElement {
  const navigate = useNavigate();

  const getErrorContent = () => {
    switch (code) {
      case '404':
        return {
          icon: '🔍',
          title: title ?? 'Page Not Found',
          message: message ?? "The page you're looking for doesn't exist or has been moved.",
          color: 'var(--color-warning)',
        };
      case '403':
        return {
          icon: '🔒',
          title: title ?? 'Access Denied',
          message: message ?? "You don't have permission to access this resource.",
          color: 'var(--color-danger)',
        };
      case '503':
        return {
          icon: '🔧',
          title: title ?? 'Service Unavailable',
          message: message ?? "We're performing maintenance. Please try again later.",
          color: 'var(--color-warning)',
        };
      default:
        return {
          icon: '⚠️',
          title: title ?? 'Something Went Wrong',
          message: message ?? 'An unexpected error occurred. Please try again.',
          color: 'var(--color-danger)',
        };
    }
  };

  const content = getErrorContent();

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
      <Card variant="elevated" style={{ maxWidth: '500px', width: '100%' }}>
        <CardBody padding="xl">
          <Stack spacing="var(--spacing-6)" style={{ textAlign: 'center' }}>
            {/* Error Code */}
            <Text
              variant="heading1"
              style={{
                fontSize: '80px',
                fontWeight: 700,
                color: content.color,
                lineHeight: 1,
              }}
            >
              {code}
            </Text>

            {/* Icon */}
            <Box
              style={{
                fontSize: '48px',
              }}
            >
              {content.icon}
            </Box>

            {/* Title and Message */}
            <Stack spacing="var(--spacing-2)">
              <Text variant="heading4">{content.title}</Text>
              <Text variant="body" color="muted">
                {content.message}
              </Text>
            </Stack>

            {/* Actions */}
            <Flex gap="sm" justify="center">
              <Button variant="primary" onClick={() => navigate('/')}>
                Go Home
              </Button>
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </Flex>

            {/* Support Link */}
            <Text variant="caption" color="muted">
              Need help?{' '}
              <a
                href="mailto:support@example.com"
                className="text-primary"
              >
                Contact Support
              </a>
            </Text>
          </Stack>
        </CardBody>
      </Card>
    </Flex>
  );
}

export function NotFoundPage(): React.ReactElement {
  return <ErrorPage code="404" />;
}

export function ForbiddenPage(): React.ReactElement {
  return <ErrorPage code="403" />;
}

export function ServerErrorPage(): React.ReactElement {
  return <ErrorPage code="500" />;
}

export function MaintenancePage(): React.ReactElement {
  return <ErrorPage code="503" />;
}

export default ErrorPage;
