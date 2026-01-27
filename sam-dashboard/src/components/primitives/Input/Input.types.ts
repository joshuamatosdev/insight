import { CSSProperties, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from 'react';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  isInvalid?: boolean;
  fullWidth?: boolean;
  containerStyle?: CSSProperties;
  /** ID of the element that describes the input (for error messages) */
  'aria-describedby'?: string;
  /** Error message ID for aria-errormessage */
  'aria-errormessage'?: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  size?: InputSize;
  isInvalid?: boolean;
  fullWidth?: boolean;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  /** ID of the element that describes the select (for error messages) */
  'aria-describedby'?: string;
  /** Error message ID for aria-errormessage */
  'aria-errormessage'?: string;
}

export interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  size?: InputSize;
  isInvalid?: boolean;
  fullWidth?: boolean;
  /** ID of the element that describes the textarea (for error messages) */
  'aria-describedby'?: string;
  /** Error message ID for aria-errormessage */
  'aria-errormessage'?: string;
}
