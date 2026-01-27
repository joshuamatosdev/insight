import { ReactNode, CSSProperties, ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonBaseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  /** Accessible label for the button (required when children is not text) */
  'aria-label'?: string;
  /** Whether the button is pressed (for toggle buttons) */
  'aria-pressed'?: boolean | 'mixed';
  /** Loading state announcement for screen readers */
  loadingText?: string;
}

export interface IconButtonProps extends Omit<ButtonBaseProps, 'leftIcon' | 'rightIcon' | 'children'> {
  icon: ReactNode;
  'aria-label': string;
}
