/**
 * User information returned from authentication
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

/**
 * Login credentials for authentication
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data for new user signup
 */
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string;
}

/**
 * Response from login API endpoint
 */
export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  mfaRequired?: boolean;
}

/**
 * Authentication error with message and optional field errors
 */
export interface AuthError {
  message: string;
  field?: string;
  code?: string;
}

/**
 * Auth state and actions provided by AuthContext
 */
export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

/**
 * Props for AuthProvider component
 */
export interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Stored auth state in localStorage
 */
export interface StoredAuthState {
  token: string;
  refreshToken: string;
  user: User;
}
