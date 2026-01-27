import { CSSProperties, ReactNode, ReactElement } from 'react';

export interface FormFieldProps {
  /** The form input element */
  children: ReactElement;
  /** Label text for the field */
  label: string;
  /** Unique ID for the field (auto-generated if not provided) */
  id?: string;
  /** Helper text to display below the input */
  description?: string;
  /** Error message to display when field is invalid */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional class name for the container */
  className?: string;
  /** Additional styles for the container */
  style?: CSSProperties;
  /** Whether to hide the label visually (still accessible to screen readers) */
  hideLabel?: boolean;
  /** Hint text to display (e.g., format hints) */
  hint?: ReactNode;
  /** Character count display */
  characterCount?: {
    current: number;
    max: number;
  };
}

export interface FormFieldContextValue {
  id: string;
  descriptionId: string;
  errorId: string;
  hasError: boolean;
  isRequired: boolean;
  isDisabled: boolean;
}
