import {describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {RouterTestWrapper} from '@/test/router-test-utils';
import {AuthContext} from './AuthContext';
import {ProtectedRoute} from './ProtectedRoute';
import {Box} from '../components/catalyst/layout';
import type {AuthContextType, User} from './Auth.types';

// Test user data
const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
};

// Create a mock auth context with configurable state
function createMockAuthContext(overrides?: Partial<AuthContextType>): AuthContextType {
    return {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        login: vi.fn(),
        logout: vi.fn(),
        clearError: vi.fn(),
        setAuthData: vi.fn(),
        ...overrides,
    };
}

// Helper to render ProtectedRoute with necessary providers
type RenderOptions = {
    authContext: AuthContextType;
    initialPath?: string;
};

function renderProtectedRoute({authContext, initialPath = '/protected'}: RenderOptions) {
    return render(
        <AuthContext.Provider value={authContext}>
            <RouterTestWrapper initialPath={initialPath}>
                <ProtectedRoute>
                    <Box data-testid="protected-content">Protected Content</Box>
                </ProtectedRoute>
            </RouterTestWrapper>
        </AuthContext.Provider>
    );
}

describe('ProtectedRoute', () => {
    describe('When Authenticated', () => {
        it('should render children when user is authenticated', () => {
            const authContext = createMockAuthContext({
                user: mockUser,
                token: 'valid-token',
                isAuthenticated: true,
                isLoading: false,
            });

            renderProtectedRoute({authContext});

            expect(screen.getByTestId('protected-content')).toBeInTheDocument();
            expect(screen.getByText('Protected Content')).toBeInTheDocument();
        });

        it('should render children regardless of user role', () => {
            const adminUser: User = {...mockUser, role: 'admin'};
            const authContext = createMockAuthContext({
                user: adminUser,
                token: 'admin-token',
                isAuthenticated: true,
                isLoading: false,
            });

            renderProtectedRoute({authContext});

            expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        });

        it('should render nested content when authenticated', () => {
            const authContext = createMockAuthContext({
                user: mockUser,
                token: 'valid-token',
                isAuthenticated: true,
                isLoading: false,
            });

            render(
                <AuthContext.Provider value={authContext}>
                    <RouterTestWrapper initialPath="/protected">
                        <ProtectedRoute>
                            <Box data-testid="outer">
                                <Box data-testid="nested">Nested Content</Box>
                            </Box>
                        </ProtectedRoute>
                    </RouterTestWrapper>
                </AuthContext.Provider>
            );

            expect(screen.getByTestId('outer')).toBeInTheDocument();
            expect(screen.getByTestId('nested')).toBeInTheDocument();
            expect(screen.getByText('Nested Content')).toBeInTheDocument();
        });
    });

    describe('When Not Authenticated', () => {
        it('should not render protected content when isAuthenticated is false', () => {
            const authContext = createMockAuthContext({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });

            renderProtectedRoute({authContext});

            // Protected content should not be rendered (Navigate component redirects)
            expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        });

        it('should not render protected content even if user exists but isAuthenticated is false', () => {
            // Edge case: user object exists but isAuthenticated is explicitly false
            const authContext = createMockAuthContext({
                user: mockUser,
                token: null,
                isAuthenticated: false,
                isLoading: false,
            });

            renderProtectedRoute({authContext});

            expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        });
    });

    describe('Loading State', () => {
        it('should show loading state while checking authentication', () => {
            const authContext = createMockAuthContext({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: true,
            });

            renderProtectedRoute({authContext});

            expect(screen.getByText('Loading...')).toBeInTheDocument();
            expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        });

        it('should not redirect during loading state', () => {
            const authContext = createMockAuthContext({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: true,
            });

            renderProtectedRoute({authContext});

            // Should show loading, not redirect
            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('should show loading when isLoading is true even with user data', () => {
            // Scenario: token validation in progress
            const authContext = createMockAuthContext({
                user: mockUser,
                token: 'token-being-validated',
                isAuthenticated: false,
                isLoading: true,
            });

            renderProtectedRoute({authContext});

            expect(screen.getByText('Loading...')).toBeInTheDocument();
            expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        });
    });

    describe('Error State Handling', () => {
        it('should still show content when authenticated with error', () => {
            // User is authenticated but there's an error in state (e.g., profile fetch failed)
            const authContext = createMockAuthContext({
                user: mockUser,
                token: 'valid-token',
                isAuthenticated: true,
                isLoading: false,
                error: {message: 'Profile fetch failed'},
            });

            renderProtectedRoute({authContext});

            // Should still show protected content - auth errors don't block route
            expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        });

        it('should not render protected content when not authenticated even with error', () => {
            const authContext = createMockAuthContext({
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: {message: 'Login failed'},
            });

            renderProtectedRoute({authContext});

            expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        });
    });
});
