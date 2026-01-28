import {Component, ErrorInfo, ReactNode} from 'react';
import {Box, Card, CardBody, Flex, Stack} from '../layout';
import {Text} from './text';
import {Button} from './button';

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
        return {hasError: true, error};
    }

    override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({errorInfo});

        // Log to error tracking service
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        if (this.props.onError !== undefined) {
            this.props.onError(error, errorInfo);
        }
    }

    handleRetry = (): void => {
        this.setState({hasError: false, error: null, errorInfo: null});
    };

    override render(): ReactNode {
        if (this.state.hasError === true) {
            if (this.props.fallback !== undefined) {
                return this.props.fallback;
            }

            return (
                <Flex
                    justify="center"
                    align="center"
                    className="min-h-[400px] p-4"
                >
                    <Card variant="bordered" className="max-w-[500px]">
                        <CardBody padding="lg">
                            <Stack spacing="md" className="text-center">
                                <Box
                                    className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto text-[32px]"
                                >
                                    ⚠️
                                </Box>
                                <Text variant="heading4">Something went wrong</Text>
                                <Text variant="body" color="muted">
                                    We apologize for the inconvenience. Please try again or contact support
                                    if the problem persists.
                                </Text>
                                {process.env['NODE_ENV'] === 'development' && this.state.error !== null && (
                                    <Box
                                        className="p-3 bg-zinc-100 rounded text-left font-mono text-xs overflow-auto max-h-[200px]"
                                    >
                                        <Text variant="caption" className="text-red-500">
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
