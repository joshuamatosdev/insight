import type {components} from '@/types/api.generated';

/**
 * User type - uses the generated UserDto from the backend API
 */
export type User = components['schemas']['UserDto'];

/**
 * User status enum extracted from UserDto
 */
export type UserStatus = NonNullable<User['status']>;

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
 * Auth data for setting authenticated state directly (e.g., from OAuth)
 */
export interface AuthData {
    token: string;
    refreshToken: string;
    user: User;
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
    /** Set auth data directly (e.g., from OAuth callback) */
    setAuthData: (data: AuthData) => void;
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
