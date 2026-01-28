/**
 * Form state for login page
 */
export interface LoginFormState {
    email: string;
    password: string;
}

/**
 * Validation errors for login form
 */
export interface LoginFormErrors {
    email?: string;
    password?: string;
}
