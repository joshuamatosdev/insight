import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Flex, Stack, Box } from '../components/catalyst/layout';
import { Text, Button, Link } from '../components/catalyst/primitives';

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
          color: 'rgb(245 158 11)',
        };
      case '403':
        return {
          icon: '🔒',
          title: title ?? 'Access Denied',
          message: message ?? "You don't have permission to access this resource.",
          color: 'rgb(239 68 68)',
        };
      case '503':
        return {
          icon: '🔧',
          title: title ?? 'Service Unavailable',
          message: message ?? "We're performing maintenance. Please try again later.",
          color: 'rgb(245 158 11)',
        };
      default:
        return {
          icon: '⚠️',
          title: title ?? 'Something Went Wrong',
          message: message ?? 'An unexpected error occurred. Please try again.',
          color: 'rgb(239 68 68)',
        };
    }
  };

  const content = getErrorContent();

  return (
    <Flex
      justify="center"
      align="center"
      className="min-h-screen bg-zinc-100 p-4"
    >
      <Card variant="elevated" className="max-w-lg w-full">
        <CardBody padding="xl">
          <Stack spacing="lg" className="text-center">
            {/* Error Code */}
            <Text
              variant="heading1"
              className={`text-[80px] font-bold leading-none ${
                code === '404' || code === '503' ? 'text-amber-500' : 'text-red-500'
              }`}
            >
              {code}
            </Text>

            {/* Icon */}
            <Box className="text-5xl">
              {content.icon}
            </Box>

            {/* Title and Message */}
            <Stack spacing="sm">
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
              <Link
                href="mailto:support@example.com"
                className="text-primary"
              >
                Contact Support
              </Link>
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
