import { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext } from './AuthContext';
import { login as apiLogin, validateToken } from '../services/auth';
import type {
  AuthProviderProps,
  User,
  AuthError,
  AuthContextType,
  StoredAuthState,
} from './Auth.types';

const AUTH_STORAGE_KEY = 'sam_auth_state';

/**
 * Retrieves stored auth state from localStorage
 */
function getStoredAuth(): StoredAuthState | null {
  try {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored === null) {
      return null;
    }
    return JSON.parse(stored) as StoredAuthState;
  } catch {
    return null;
  }
}

/**
 * Saves auth state to localStorage
 */
function setStoredAuth(state: StoredAuthState | null): void {
  try {
    if (state === null) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } else {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
    }
  } catch (err) {
    console.error('Failed to persist auth state:', err);
  }
}

/**
 * Provides authentication state and actions to the app
 */
export function AuthProvider({ children }: AuthProviderProps): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    async function initializeAuth(): Promise<void> {
      const stored = getStoredAuth();

      if (stored === null) {
        setIsLoading(false);
        return;
      }

      // Validate the stored token
      const isValid = await validateToken(stored.token);

      if (isValid) {
        setUser(stored.user);
        setToken(stored.token);
      } else {
        // Token expired or invalid, clear storage
        setStoredAuth(null);
      }

      setIsLoading(false);
    }

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiLogin({ email, password });

      // Check if MFA is required (future feature)
      if (response.mfaRequired === true) {
        setError({ message: 'MFA is required but not yet implemented' });
        setIsLoading(false);
        return;
      }

      // Store auth state
      const authState: StoredAuthState = {
        token: response.token,
        refreshToken: response.refreshToken,
        user: response.user,
      };
      setStoredAuth(authState);

      // Update context state
      setUser(response.user);
      setToken(response.token);
    } catch (err) {
      const authError = err as AuthError;
      const errorObj: AuthError = {
        message: authError.message ?? 'Login failed',
      };
      if (authError.field !== undefined) {
        errorObj.field = authError.field;
      }
      if (authError.code !== undefined) {
        errorObj.code = authError.code;
      }
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback((): void => {
    setUser(null);
    setToken(null);
    setError(null);
    setStoredAuth(null);
  }, []);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  const setAuthData = useCallback((data: { token: string; refreshToken: string; user: User }): void => {
    const authState: StoredAuthState = {
      token: data.token,
      refreshToken: data.refreshToken,
      user: data.user,
    };
    setStoredAuth(authState);
    setUser(data.user);
    setToken(data.token);
  }, []);

  const isAuthenticated = user !== null && token !== null;

  const contextValue: AuthContextType = useMemo(
    () => ({
      user,
      token,
      isAuthenticated,
      isLoading,
      error,
      login,
      logout,
      clearError,
      setAuthData,
    }),
    [user, token, isAuthenticated, isLoading, error, login, logout, clearError, setAuthData]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
