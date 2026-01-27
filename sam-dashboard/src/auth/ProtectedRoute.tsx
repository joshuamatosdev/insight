import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Flex } from '../components/catalyst/layout';
import { Text } from '../components/catalyst/primitives';

export interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Route guard that redirects unauthenticated users to login
 */
export function ProtectedRoute({ children }: ProtectedRouteProps): React.ReactElement {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <Flex
        justify="center"
        align="center"
        className="min-h-screen bg-zinc-50 dark:bg-zinc-900"
      >
        <Text variant="body" color="muted">
          Loading...
        </Text>
      </Flex>
    );
  }

  // Redirect to login if not authenticated
  if (isAuthenticated === false) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
