import {useNavigate} from 'react-router-dom';
import {Box, Card, CardBody, Flex, Stack} from '../components/catalyst/layout';
import {Button, Link, Text} from '../components/catalyst/primitives';

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
    >
      <Card variant="elevated">
        <CardBody padding="xl">
          <Stack spacing="lg">
            {/* Error Code */}
            <Text
              variant="heading1"
            >
              {code}
            </Text>

            {/* Icon */}
            <Box>
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
