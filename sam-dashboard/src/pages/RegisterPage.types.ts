/**
 * Form state for register page
 */
export interface RegisterFormState {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  acceptTerms: boolean;
}

/**
 * Validation errors for register form
 */
export interface RegisterFormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  organizationName?: string;
  acceptTerms?: string;
}
