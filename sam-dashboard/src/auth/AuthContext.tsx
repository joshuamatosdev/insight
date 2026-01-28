import { createContext, useContext } from 'react';
import type { AuthContextType } from './Auth.types';

/**
 * Default context value for unauthenticated state
 */
const defaultContextValue: AuthContextType = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  login: async () => {
    throw new Error('AuthProvider not found');
  },
  logout: () => {
    throw new Error('AuthProvider not found');
  },
  clearError: () => {
    throw new Error('AuthProvider not found');
  },
  setAuthData: () => {
    throw new Error('AuthProvider not found');
  },
};

/**
 * Authentication context for managing user session
 */
export const AuthContext = createContext<AuthContextType>(defaultContextValue);

/**
 * Hook to access authentication context
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === defaultContextValue) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;
