import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardBody, Stack, Flex, Box } from '../layout';
import { Text, Button } from '../primitives';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary component to catch and handle React errors gracefully.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Log to error tracking service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    if (this.props.onError !== undefined) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): ReactNode {
    if (this.state.hasError === true) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }

      return (
        <Flex
          justify="center"
          align="center"
          style={{
            minHeight: '400px',
            padding: 'var(--spacing-4)',
          }}
        >
          <Card variant="bordered" style={{ maxWidth: '500px' }}>
            <CardBody padding="lg">
              <Stack spacing="var(--spacing-4)" style={{ textAlign: 'center' }}>
                <Box
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-danger-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    fontSize: '32px',
                  }}
                >
                  ⚠️
                </Box>
                <Text variant="heading4">Something went wrong</Text>
                <Text variant="body" color="muted">
                  We apologize for the inconvenience. Please try again or contact support
                  if the problem persists.
                </Text>
                {process.env.NODE_ENV === 'development' && this.state.error !== null && (
                  <Box
                    style={{
                      padding: 'var(--spacing-3)',
                      backgroundColor: 'var(--color-gray-100)',
                      borderRadius: '4px',
                      textAlign: 'left',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      overflow: 'auto',
                      maxHeight: '200px',
                    }}
                  >
                    <Text variant="caption" style={{ color: 'var(--color-danger)' }}>
                      {this.state.error.toString()}
                    </Text>
                  </Box>
                )}
                <Flex gap="sm" justify="center">
                  <Button variant="primary" onClick={this.handleRetry}>
                    Try Again
                  </Button>
                  <Button variant="secondary" onClick={() => window.location.reload()}>
                    Reload Page
                  </Button>
                </Flex>
              </Stack>
            </CardBody>
          </Card>
        </Flex>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
