/**
 * User Preferences Hook
 *
 * Provides a reusable hook for fetching and updating user preferences.
 */

import {useCallback, useEffect, useState} from 'react';
import {useAuth} from '../auth';
import {API_BASE} from '../services/apiClient';

/**
 * Theme options for user preferences
 */
export type Theme = 'LIGHT' | 'DARK' | 'SYSTEM';

/**
 * User preferences from the API
 */
export interface UserPreferences {
    id: string;
    userId: string;
    theme: Theme;
    emailNotifications: boolean;
    dashboardLayout: string | null;
    timezone: string;
    language: string;
}

/**
 * Request payload for updating preferences
 */
export interface UpdatePreferencesRequest {
    theme?: Theme;
    emailNotifications?: boolean;
    dashboardLayout?: string;
    timezone?: string;
    language?: string;
}

/**
 * Hook return type
 */
export interface UseUserPreferencesReturn {
    preferences: UserPreferences | null;
    isLoading: boolean;
    error: Error | null;
    update: (data: UpdatePreferencesRequest) => Promise<UserPreferences>;
    refresh: () => Promise<void>;
}

/**
 * Hook to manage user preferences
 *
 * Provides functionality to fetch and update user preferences.
 *
 * @returns Preferences state, loading state, error, update function, and refresh function
 */
export function useUserPreferences(): UseUserPreferencesReturn {
    const {token} = useAuth();
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    /**
     * Fetches user preferences from the API
     */
    const fetchPreferences = useCallback(async (): Promise<void> => {
        if (token === null) {
            setPreferences(null);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE}/preferences`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok === false) {
                throw new Error('Failed to fetch preferences');
            }

            const data: UserPreferences = await response.json();
            setPreferences(data);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch preferences'));
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    /**
     * Updates user preferences via the API
     */
    const updatePreferences = useCallback(
        async (request: UpdatePreferencesRequest): Promise<UserPreferences> => {
            if (token === null) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(`${API_BASE}/preferences`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (response.ok === false) {
                throw new Error('Failed to update preferences');
            }

            const updatedPreferences: UserPreferences = await response.json();
            setPreferences(updatedPreferences);
            return updatedPreferences;
        },
        [token]
    );

    // Fetch preferences on mount and when token changes
    useEffect(() => {
        void fetchPreferences();
    }, [fetchPreferences]);

    return {
        preferences,
        isLoading,
        error,
        update: updatePreferences,
        refresh: fetchPreferences,
    };
}
