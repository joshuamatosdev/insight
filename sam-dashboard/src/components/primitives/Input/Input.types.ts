import { CSSProperties, InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isInvalid?: boolean;
  fullWidth?: boolean;
  containerStyle?: CSSProperties;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: InputSize;
  isInvalid?: boolean;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}
